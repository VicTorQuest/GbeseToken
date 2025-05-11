// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MockKYCVerifier {
    mapping(address => bool) public isVerified;

    /// @notice Test helper to flip a user’s KYC status
    function setVerified(address user, bool ok) external {
        isVerified[user] = ok;
    }
}