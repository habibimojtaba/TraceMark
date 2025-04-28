require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // Load .env file

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20", // Match your contract's pragma
  networks: {
    hardhat: {
      // Local testing network configuration (optional)
      // chainId: 1337 // Standard for local Hardhat nodes
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "", // Read from .env
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [], // Read from .env
      chainId: 11155111, // Sepolia chain ID
    },
    // Add other networks like mainnet if needed
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY, // Optional: for USD conversion
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API_KEY || "", // Read from .env
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};
