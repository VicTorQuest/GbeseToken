// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IKYCVerifier {
    function isVerified(address user) external view returns (bool);
}

contract GbeseToken is ERC20, Ownable {
    // Our Gbese token will have 1,000,000 GBT initial supply (with 18 decimals)
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10 ** 18;

    IKYCVerifier public kycVerifier;

    uint256 public transferIndex;

    // logs every non‑mint, non‑burn transfer
    event TransferLogged (
        uint256 indexed index,
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 blockNumber
    );

    // kogs every mint transaction
    event TokensMinted (
        address indexed to,
        uint256 amount
    );

    constructor(address _kycVerifier)  ERC20("Gbese", "GBT") Ownable(msg.sender) {
        // Mint the initial supply to the deployer (owner)
        _mint(msg.sender, INITIAL_SUPPLY);

        //setting the depoloyed kyc smart contract
        kycVerifier = IKYCVerifier(_kycVerifier);
    }

    // incase we update or deploy a new KYCVerifier(on-chain ssi) contract
    function setKYCVerifier(address _newVerifier) external onlyOwner {
        kycVerifier = IKYCVerifier(_newVerifier);
    }

    ///onlyOwner can mint onlyVerified wallets 
    function mint(address to, uint256 amount) external onlyOwner {
        require(kycVerifier.isVerified(to), "on-chaine KYC: This wallet is not verified");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }


    function _update(address from, address to, uint256 amount) internal override {
        super._update(from, to, amount);

        // if it's not a mint or burn (from | to == address(0)), require both sender and receiver are verified
        if (from != address(0) && to != address(0)) {
            // Ensuring both parties are KYC‐verified
            require( kycVerifier.isVerified(from),"KYC: sender not verified");
            require(kycVerifier.isVerified(to),"KYC: recipient not verified");
        
            transferIndex++;

            emit TransferLogged(
                transferIndex,
                from, 
                to, 
                amount, 
                block.number
            );
        }
    }
}
