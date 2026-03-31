#![no_std]
use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, panic_with_error, token,
    Address, BytesN, Env, IntoVal, Symbol, Val, Vec,
};

// ── Errors ──────────────────────────────────────────────────────────────────

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum SettlementError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    InvalidAmount = 4,
    InvalidTimelock = 5,
    SettlementNotFound = 6,
    AlreadyConfirmed = 7,
}

// ── Storage keys ────────────────────────────────────────────────────────────

#[contracttype]
pub enum DataKey {
    Admin,
    HtlcContract,
    FeeCollector,
    Settlement(BytesN<32>), // keyed by hashlock
}

// ── Domain types ────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SettlementInfo {
    pub source_asset: Address,
    pub source_amount: i128,
    pub dest_asset: Address,
    pub dest_amount: i128,
    pub merchant: Address,
    pub merchant_amount: i128,
    pub fee_amount: i128,
    pub hashlock: BytesN<32>,
    pub timelock: u64,
    pub htlc_lock_id: BytesN<32>,
    pub confirmed: bool,
}

// ── Events ──────────────────────────────────────────────────────────────────

#[contractevent(data_format = "vec")]
pub struct Initialized {
    #[topic]
    pub admin: Address,
    pub htlc_contract: Address,
    pub fee_collector: Address,
}

#[contractevent(data_format = "vec")]
pub struct Settled {
    #[topic]
    pub merchant: Address,
    pub hashlock: BytesN<32>,
    pub dest_amount: i128,
    pub merchant_amount: i128,
    pub fee_amount: i128,
}

#[contractevent(data_format = "vec")]
pub struct Confirmed {
    #[topic]
    pub merchant: Address,
    pub hashlock: BytesN<32>,
    pub htlc_lock_id: BytesN<32>,
}

#[contractevent(data_format = "vec")]
pub struct ConfigUpdated {
    pub htlc_contract: Address,
    pub fee_collector: Address,
}

// ── Contract ────────────────────────────────────────────────────────────────

#[contract]
pub struct SettlementContract;

#[contractimpl]
impl SettlementContract {
    // ── Admin ───────────────────────────────────────────────────────────

    /// One-time initialisation.
    pub fn initialize(
        env: Env,
        admin: Address,
        htlc_contract: Address,
        fee_collector: Address,
    ) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic_with_error!(&env, SettlementError::AlreadyInitialized);
        }
        admin.require_auth();

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::HtlcContract, &htlc_contract);
        env.storage()
            .instance()
            .set(&DataKey::FeeCollector, &fee_collector);

        Initialized {
            admin,
            htlc_contract,
            fee_collector,
        }
        .publish(&env);
    }

    /// Admin-only: update HTLC / fee-collector contract references.
    pub fn update_config(
        env: Env,
        htlc_contract: Address,
        fee_collector: Address,
    ) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic_with_error!(&env, SettlementError::NotInitialized));
        admin.require_auth();

        env.storage()
            .instance()
            .set(&DataKey::HtlcContract, &htlc_contract);
        env.storage()
            .instance()
            .set(&DataKey::FeeCollector, &fee_collector);

        ConfigUpdated {
            htlc_contract,
            fee_collector,
        }
        .publish(&env);
    }

    // ── Core (two-phase settlement) ─────────────────────────────────────

    /// **Phase 1** — Execute fee deduction and prepare for HTLC lock.
    ///
    /// The relay must have deposited `dest_amount` of `dest_asset` into
    /// this contract before calling `settle()`.
    ///
    /// Steps:
    /// 1. Transfer `dest_amount` to fee-collector.
    /// 2. Fee-collector splits: `merchant_amount` back to this contract,
    ///    `fee_amount` to treasury.
    /// 3. Transfer `merchant_amount` to the relay (`caller`) so it can
    ///    call `HTLC.lock()` next.
    /// 4. Record a pending settlement keyed by `hashlock`.
    ///
    /// Returns `(merchant_amount, fee_amount)`.
    pub fn settle(
        env: Env,
        caller: Address,
        source_asset: Address,
        source_amount: i128,
        dest_asset: Address,
        dest_amount: i128,
        merchant: Address,
        hashlock: BytesN<32>,
        timelock: u64,
    ) -> (i128, i128) {
        caller.require_auth();

        if !env.storage().instance().has(&DataKey::Admin) {
            panic_with_error!(&env, SettlementError::NotInitialized);
        }
        if dest_amount <= 0 {
            panic_with_error!(&env, SettlementError::InvalidAmount);
        }
        if timelock <= env.ledger().timestamp() {
            panic_with_error!(&env, SettlementError::InvalidTimelock);
        }

        let fee_collector_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::FeeCollector)
            .unwrap();
        let self_addr = env.current_contract_address();
        let dest_token = token::Client::new(&env, &dest_asset);

        // 1. Send converted amount to fee-collector.
        dest_token.transfer(&self_addr, &fee_collector_addr, &dest_amount);

        // 2. Fee-collector splits: merchant portion back to us, fee to treasury.
        let deduct_args: Vec<Val> = Vec::from_array(
            &env,
            [
                dest_asset.clone().into_val(&env),
                dest_amount.into_val(&env),
                self_addr.clone().into_val(&env),
            ],
        );
        let (merchant_amount, fee_amount): (i128, i128) =
            env.invoke_contract(&fee_collector_addr, &Symbol::new(&env, "deduct"), deduct_args);

        // 3. Send merchant_amount to the relay so it can lock in HTLC.
        dest_token.transfer(&self_addr, &caller, &merchant_amount);

        // 4. Record pending settlement (not yet confirmed with HTLC lock).
        let zeroed_lock_id = BytesN::from_array(&env, &[0u8; 32]);
        let info = SettlementInfo {
            source_asset,
            source_amount,
            dest_asset,
            dest_amount,
            merchant: merchant.clone(),
            merchant_amount,
            fee_amount,
            hashlock: hashlock.clone(),
            timelock,
            htlc_lock_id: zeroed_lock_id,
            confirmed: false,
        };
        env.storage()
            .persistent()
            .set(&DataKey::Settlement(hashlock.clone()), &info);

        Settled {
            merchant,
            hashlock,
            dest_amount,
            merchant_amount,
            fee_amount,
        }
        .publish(&env);

        (merchant_amount, fee_amount)
    }

    /// **Phase 2** — Confirm that the HTLC lock has been created.
    ///
    /// Called by the relay after it has locked `merchant_amount` in the
    /// HTLC contract. Links the settlement to the HTLC lock ID.
    pub fn confirm(
        env: Env,
        caller: Address,
        hashlock: BytesN<32>,
        htlc_lock_id: BytesN<32>,
    ) {
        caller.require_auth();

        let mut info: SettlementInfo = env
            .storage()
            .persistent()
            .get(&DataKey::Settlement(hashlock.clone()))
            .unwrap_or_else(|| panic_with_error!(&env, SettlementError::SettlementNotFound));

        if info.confirmed {
            panic_with_error!(&env, SettlementError::AlreadyConfirmed);
        }

        info.htlc_lock_id = htlc_lock_id.clone();
        info.confirmed = true;
        env.storage()
            .persistent()
            .set(&DataKey::Settlement(hashlock.clone()), &info);

        Confirmed {
            merchant: info.merchant,
            hashlock,
            htlc_lock_id,
        }
        .publish(&env);
    }

    // ── Queries ─────────────────────────────────────────────────────────

    pub fn get_settlement(env: Env, hashlock: BytesN<32>) -> SettlementInfo {
        env.storage()
            .persistent()
            .get(&DataKey::Settlement(hashlock))
            .unwrap_or_else(|| panic_with_error!(&env, SettlementError::SettlementNotFound))
    }
}

mod test;
