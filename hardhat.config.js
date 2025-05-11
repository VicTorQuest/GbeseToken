require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL,     
      chainId: 84532,
      accounts: [
        process.env.DEPLOYER_PRIVATE_KEY,
        process.env.USER_PRIVATE_KEY
      ].filter(Boolean)
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY,
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
  sourcify: {
    enabled: true
  },
  mocha: {
    timeout: 20000,
  },
};
