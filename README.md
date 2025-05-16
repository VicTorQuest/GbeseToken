# GbeseToken (GBT)

**Contract Address:** `0xC6dd34113889f23b0bf06FA77b3EBf441cB388eF`  
**Sourcify Verified:** [Full Match on Sepolia (84532)](https://repo.sourcify.dev/contracts/full_match/84532/0xC6dd34113889f23b0bf06FA77b3EBf441cB388eF/)  
**Basescan Explorer:** [View on Sepolia](https://sepolia.basescan.org/address/0xC6dd34113889f23b0bf06FA77b3EBf441cB388eF)

---

## Overview

`GbeseToken` is an ERC-20 token for the gbese webapp with built-in on-chain KYC enforcement. It integrates with a separate `KYCVerifier` contract to ensure that only approved wallets may **mint**, **send**, or **receive** GBT.

Key Features:

- **Initial Supply:** 1,000,000 GBT minted to owner on deployment  
- **Owner‐only Minting:** `mint(address to, uint256 amount)` gated by KYC status  
- **KYC Integration:** calls into `KYCVerifier.isVerified(address)` before allowing mint/transfer  
- **Transfer Logging:** every non-mint/non-burn transfer emits a `TransferLogged` event with a sequential index  
- **Events:**  
  - `TokensMinted(address indexed to, uint256 amount)`  
  - `TransferLogged(uint256 indexed index, address indexed from, address indexed to, uint256 amount, uint256 blockNumber)`

---

## Contract Details

### Constructor

```solidity
constructor(address _kycVerifier) ERC20("Gbese Token", "GBT") Ownable(msg.sender);
