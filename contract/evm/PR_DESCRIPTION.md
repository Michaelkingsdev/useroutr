## Summary
This Pull Request introduces the complete Hardhat integration pipeline for the `HTLCEvm` (Hashed Time-Locked Contract), bridging the gap between raw Solidity development and seamless live deployment/testing capabilities.

Following initial feedback, this PR also includes several hardening fixes and environment alignments.

## Key Sub-Tasks Completed

### 1. Robust Development Environment Setup
- Initialized local Hardhat config spanning across 6 isolated active testnets.
- **Aligned Package Manager**: Switched to `npm` to match the root repository, providing a `package-lock.json` and removing `pnpm` residuals.
- Added strict `.gitignore` covering `artifacts`, `cache`, `typechain-types`, and `node_modules`.
- Authored a comprehensive `README.md` for project onboarding.

### 2. Multi-Chain Verification & Fixes
- **Unified Etherscan API V2**: Restored the `apiKey` object in `hardhat.config.ts` to support multi-chain verification while maintaining compatibility with the latest API V2 endpoints.
- **Deploy Script Hardening**: Fixed a bug in the `.env` injection logic where network names with multiple hyphens (e.g., `base-sepolia`) were not correctly transformed. Now uses `replaceAll("-", "_")`.
- **Typed Event Parsing**: Removed all `@ts-ignore` instances by implementing proper typed event parsing using `htlc.interface.parseLog`.

### 3. Comprehensive Testing & Gas Profiling
- **Hashlock Unification**: Fixed a critical test mismatch where the JS-calculated hashlock didn't account for the 32-byte padding of the preimage. Now uses `sha256(zeroPadValue(utf8Bytes, 32))` consistently.
- **10/10 Test Coverage**: Covering happy paths for Lock/Withdraw/Refund routines alongside rejecting premature refunding, invalid preimages, double-withdrawing, and expired timelocks.
- **Gas Reporting**: Integrated `hardhat-gas-reporter` in `devDependencies` and enabled it by default in `npm test`.

## Verification Results
All 10 tests passed successfully with high performance (~800ms total).
Contract remains fully verified on Base Sepolia.
