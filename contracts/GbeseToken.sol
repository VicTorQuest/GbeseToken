// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "hardhat/console.sol"; 
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GbeseToken is ERC20 {
    constructor()  ERC20("Gbese", "GBT") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}
