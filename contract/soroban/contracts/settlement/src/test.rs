#![cfg(test)]

use super::*;
use soroban_sdk::testutils::{Address as _, Ledger};
use soroban_sdk::{token, Address, Bytes, BytesN, Env};

// Import sibling contracts for cross-contract testing.
use fee_collector_contract::FeeCollectorContract;
use htlc_contract::HTLCContract;

extern crate fee_collector as fee_collector_contract;
extern crate htlc as htlc_contract;

struct TestEnv {
    env: Env,
    admin: Address,
    relay: Address,
    treasury: Address,
    merchant: Address,
    token_addr: Address,
    htlc_id: Address,
    fee_collector_id: Address,
    settlement_id: Address,
}

fn setup() -> TestEnv {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_timestamp(1_000);

    // Token
    let token_admin = Address::generate(&env);
    let stellar_asset = env.register_stellar_asset_contract_v2(token_admin);
    let token_addr = stellar_asset.address();
    let asset_admin = token::StellarAssetClient::new(&env, &token_addr);

    // Actors
    let admin = Address::generate(&env);
    let relay = Address::generate(&env);
    let treasury = Address::generate(&env);
    let merchant = Address::generate(&env);

    // Deploy contracts
    let htlc_id = env.register(HTLCContract, ());
    let fee_collector_id = env.register(FeeCollectorContract, ());
    let settlement_id = env.register(SettlementContract, ());

    // Initialize fee-collector: 100 bps = 1 %
    let fc_client =
        fee_collector_contract::FeeCollectorContractClient::new(&env, &fee_collector_id);
    fc_client.initialize(&admin, &100_u32, &treasury);

    // Initialize settlement
    let settle_client = SettlementContractClient::new(&env, &settlement_id);
    settle_client.initialize(&admin, &htlc_id, &fee_collector_id);

    // Mint tokens to settlement contract (simulates relay deposit after path payment)
    asset_admin.mint(&settlement_id, &100_000);
    // Mint extra to relay so it can call HTLC.lock() after receiving merchant_amount
    asset_admin.mint(&relay, &0);

    TestEnv {
        env,
        admin,
        relay,
        treasury,
        merchant,
        token_addr,
        htlc_id,
        fee_collector_id,
        settlement_id,
    }
}

// ── Happy path: settle → HTLC lock → confirm → withdraw ────────────────────

#[test]
fn settle_happy_path() {
    let t = setup();
    let client = SettlementContractClient::new(&t.env, &t.settlement_id);
    let tok = token::TokenClient::new(&t.env, &t.token_addr);

    let source_asset = Address::generate(&t.env);
    let source_amount = 11_000_i128;
    let dest_amount = 10_000_i128;
    let timelock = 2_000_u64;
    let preimage = Bytes::from_array(&t.env, &[1, 2, 3, 4]);
    let hashlock: BytesN<32> = t.env.crypto().sha256(&preimage).into();

    // Phase 1: settle (fee deduction)
    let (merchant_amount, fee_amount) = client.settle(
        &t.relay,
        &source_asset,
        &source_amount,
        &t.token_addr,
        &dest_amount,
        &t.merchant,
        &hashlock,
        &timelock,
    );

    assert_eq!(merchant_amount, 9_900); // 10_000 - 1%
    assert_eq!(fee_amount, 100);

    // Treasury received fee
    assert_eq!(tok.balance(&t.treasury), 100);
    // Relay received merchant_amount for HTLC locking
    assert_eq!(tok.balance(&t.relay), 9_900);
    // Settlement spent dest_amount
    assert_eq!(tok.balance(&t.settlement_id), 90_000);

    // Pending settlement recorded
    let info = client.get_settlement(&hashlock);
    assert_eq!(info.merchant_amount, 9_900);
    assert_eq!(info.fee_amount, 100);
    assert!(!info.confirmed);

    // Relay locks in HTLC
    let htlc_client = htlc_contract::HTLCContractClient::new(&t.env, &t.htlc_id);
    let lock_id = htlc_client.lock(
        &t.relay,
        &t.merchant,
        &t.token_addr,
        &merchant_amount,
        &hashlock,
        &timelock,
    );

    // Phase 2: confirm
    client.confirm(&t.relay, &hashlock, &lock_id);

    let info = client.get_settlement(&hashlock);
    assert!(info.confirmed);
    assert_eq!(info.htlc_lock_id, lock_id);

    // Merchant claims via HTLC
    let ok = htlc_client.withdraw(&lock_id, &preimage);
    assert!(ok);
    assert_eq!(tok.balance(&t.merchant), 9_900);
    assert_eq!(tok.balance(&t.htlc_id), 0);
}

// ── HTLC refund returns to relay ────────────────────────────────────────────

#[test]
fn refund_returns_to_relay() {
    let t = setup();
    let client = SettlementContractClient::new(&t.env, &t.settlement_id);
    let tok = token::TokenClient::new(&t.env, &t.token_addr);

    let source_asset = Address::generate(&t.env);
    let dest_amount = 4_000_i128;
    let timelock = 1_500_u64;
    let preimage = Bytes::from_array(&t.env, &[99]);
    let hashlock: BytesN<32> = t.env.crypto().sha256(&preimage).into();

    let (merchant_amount, _) = client.settle(
        &t.relay,
        &source_asset,
        &4_400_i128,
        &t.token_addr,
        &dest_amount,
        &t.merchant,
        &hashlock,
        &timelock,
    );

    // Relay locks
    let htlc_client = htlc_contract::HTLCContractClient::new(&t.env, &t.htlc_id);
    let lock_id = htlc_client.lock(
        &t.relay,
        &t.merchant,
        &t.token_addr,
        &merchant_amount,
        &hashlock,
        &timelock,
    );
    client.confirm(&t.relay, &hashlock, &lock_id);

    // Advance past timelock
    t.env.ledger().set_timestamp(1_501);

    let ok = htlc_client.refund(&lock_id);
    assert!(ok);

    // Funds go back to relay (the HTLC sender)
    assert_eq!(tok.balance(&t.htlc_id), 0);
    assert_eq!(tok.balance(&t.relay), merchant_amount);
}

// ── Fee calculation accuracy ────────────────────────────────────────────────

#[test]
fn fee_matches_merchant_fee_bps() {
    let t = setup();
    let client = SettlementContractClient::new(&t.env, &t.settlement_id);

    let source_asset = Address::generate(&t.env);
    let dest_amount = 7_777_i128;
    let preimage = Bytes::from_array(&t.env, &[5, 5]);
    let hashlock: BytesN<32> = t.env.crypto().sha256(&preimage).into();

    let (merchant_amount, fee_amount) = client.settle(
        &t.relay,
        &source_asset,
        &8_000_i128,
        &t.token_addr,
        &dest_amount,
        &t.merchant,
        &hashlock,
        &2_000_u64,
    );

    // 1% of 7_777 = 77 (integer division)
    assert_eq!(fee_amount, 77);
    assert_eq!(merchant_amount, 7_700);
    assert_eq!(merchant_amount + fee_amount, dest_amount);
}

// ── Timelock asymmetry ──────────────────────────────────────────────────────

#[test]
fn timelock_is_shorter_than_source() {
    let t = setup();
    let client = SettlementContractClient::new(&t.env, &t.settlement_id);

    let source_asset = Address::generate(&t.env);
    let preimage = Bytes::from_array(&t.env, &[7, 8, 9]);
    let hashlock: BytesN<32> = t.env.crypto().sha256(&preimage).into();

    let source_timelock: u64 = 1_000 + 86_400; // 24h
    let stellar_timelock: u64 = 1_000 + 43_200; // 12h

    client.settle(
        &t.relay,
        &source_asset,
        &2_000_i128,
        &t.token_addr,
        &2_000_i128,
        &t.merchant,
        &hashlock,
        &stellar_timelock,
    );

    let info = client.get_settlement(&hashlock);
    assert_eq!(info.timelock, stellar_timelock);
    assert!(stellar_timelock < source_timelock);
}

// ── Error: double initialize ────────────────────────────────────────────────

#[test]
#[should_panic(expected = "Error(Contract, #2)")]
fn double_initialize_panics() {
    let t = setup();
    let client = SettlementContractClient::new(&t.env, &t.settlement_id);
    client.initialize(&t.admin, &t.htlc_id, &t.fee_collector_id);
}

// ── Error: zero amount ──────────────────────────────────────────────────────

#[test]
#[should_panic(expected = "Error(Contract, #4)")]
fn settle_zero_amount_panics() {
    let t = setup();
    let client = SettlementContractClient::new(&t.env, &t.settlement_id);
    let source_asset = Address::generate(&t.env);
    let hashlock = BytesN::from_array(&t.env, &[0u8; 32]);

    client.settle(
        &t.relay,
        &source_asset,
        &0_i128,
        &t.token_addr,
        &0_i128,
        &t.merchant,
        &hashlock,
        &2_000_u64,
    );
}

// ── Error: past timelock ────────────────────────────────────────────────────

#[test]
#[should_panic(expected = "Error(Contract, #5)")]
fn settle_past_timelock_panics() {
    let t = setup();
    let client = SettlementContractClient::new(&t.env, &t.settlement_id);
    let source_asset = Address::generate(&t.env);
    let hashlock = BytesN::from_array(&t.env, &[0u8; 32]);

    client.settle(
        &t.relay,
        &source_asset,
        &1_000_i128,
        &t.token_addr,
        &1_000_i128,
        &t.merchant,
        &hashlock,
        &500_u64,
    );
}

// ── Error: settlement not found ─────────────────────────────────────────────

#[test]
#[should_panic(expected = "Error(Contract, #6)")]
fn get_settlement_not_found_panics() {
    let t = setup();
    let client = SettlementContractClient::new(&t.env, &t.settlement_id);
    let bad = BytesN::from_array(&t.env, &[0u8; 32]);
    client.get_settlement(&bad);
}

// ── Error: double confirm ───────────────────────────────────────────────────

#[test]
#[should_panic(expected = "Error(Contract, #7)")]
fn double_confirm_panics() {
    let t = setup();
    let client = SettlementContractClient::new(&t.env, &t.settlement_id);

    let source_asset = Address::generate(&t.env);
    let preimage = Bytes::from_array(&t.env, &[42]);
    let hashlock: BytesN<32> = t.env.crypto().sha256(&preimage).into();

    let (merchant_amount, _) = client.settle(
        &t.relay,
        &source_asset,
        &3_000_i128,
        &t.token_addr,
        &3_000_i128,
        &t.merchant,
        &hashlock,
        &2_000_u64,
    );

    let htlc_client = htlc_contract::HTLCContractClient::new(&t.env, &t.htlc_id);
    let lock_id = htlc_client.lock(
        &t.relay,
        &t.merchant,
        &t.token_addr,
        &merchant_amount,
        &hashlock,
        &2_000_u64,
    );

    client.confirm(&t.relay, &hashlock, &lock_id);
    client.confirm(&t.relay, &hashlock, &lock_id); // should panic
}

// ── Config update ───────────────────────────────────────────────────────────

#[test]
fn update_config_works() {
    let t = setup();
    let client = SettlementContractClient::new(&t.env, &t.settlement_id);
    let new_htlc = Address::generate(&t.env);
    let new_fc = Address::generate(&t.env);
    client.update_config(&new_htlc, &new_fc);
}
