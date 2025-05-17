# GbeseToken (GBT)

**Contract Address:** `0xC6dd34113889f23b0bf06FA77b3EBf441cB388eF`  
**Sourcify Verified:** [Full Match on Sepolia (84532)](https://repo.sourcify.dev/contracts/full_match/84532/0xC6dd34113889f23b0bf06FA77b3EBf441cB388eF/)  
**Basescan Explorer:** [View on Sepolia](https://sepolia.basescan.org/address/0xC6dd34113889f23b0bf06FA77b3EBf441cB388eF)

---

## Overview

**GbeseToken** is an ERC-20 token for the gbese webapp with built-in on-chain KYC enforcement. It integrates with a separate `KYCVerifier` contract to ensure that only approved wallets may **mint**, **send**, or **receive** GBT.

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
constructor(address _kycVerifier) ERC20("Gbese Token", "GBT") Ownable(msg.sender); {
  _mint(msg.sender, INITIAL_SUPPLY);
  kycVerifier = IKYCVerifier(_kycVerifier);
}
```
- `_kycVerifier`: address of the deployed KYCVerifier contract
- Mints 1,000,000 GBT (18 decimals) to msg.sender

### Minting

```solidity
function mint(address to, uint256 amount) external onlyOwner {
  require(kycVerifier.isVerified(to), "KYC: recipient not verified");
  _mint(to, amount);
  emit TokensMinted(to, amount);
}
```
- Only the contract owner may call
- Requires the recipient wallet to be KYC-approved on-chain

### Transfer Hook

Overrides the ERC-20 _update hook:

```solidity
function _update(address from, address to, uint256 amount) internal override {
  super._update(from, to, amount);

  if (from != address(0) && to != address(0)) {
    require(kycVerifier.isVerified(from), "KYC: sender not verified");
    require(kycVerifier.isVerified(to),   "KYC: recipient not verified");

    transferIndex++;
    emit TransferLogged(
      transferIndex,
      from, to, amount, block.number
    );
  }
}
```
- Blocks transfers to/from unverified wallets
- Increments a global transferIndex and logs each valid transfer

---

## Usage With Your DApp

### Add GBT to MetaMask

```javascript
await window.ethereum.request({
  method: "wallet_watchAsset",
  params: {
    type: "ERC20",
    options: {
      address: "0xC6dd34113889f23b0bf06FA77b3EBf441cB388eF",
      symbol: "GBT",
      decimals: 18,
      image: "https://yourcdn.com/gbt-logo.png"
    }
  }
});
```

### Check Balance & Mint
```javascript
import { ethers } from "ethers";
import GbeseTokenABI from "./abis/GbeseToken.json";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer   = provider.getSigner();
const gbese    = new ethers.Contract(
  "0xC6dd34113889f23b0bf06FA77b3EBf441cB388eF",
  GbeseTokenABI,
  signer
);

// Mint 10 GBT to user
await gbese.mint(userAddress, ethers.parseUnits("10", 18));

// Read balance
const balance = await gbese.balanceOf(userAddress);
console.log("GBT balance:", ethers.formatUnits(balance, 18));
```

---

## Security & Next Steps

- **Access Control**: only the owner can mint new GBT

- **KYC Enforcement**: on-chain checks prevent unverified wallets from receiving or sending GBT

- **Event Auditing**: use TokensMinted and TransferLogged to build off-chain dashboards

- **Upgradeability**: added a setter for kycVerifier to support future migrations