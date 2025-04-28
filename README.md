# TraceMark: Decentralized Provenance Tracker

A simple supply chain provenance tracking system using Solidity, Hardhat, React, and Ethers.js on the Sepolia testnet. This dApp provides a transparent and immutable ledger for tracking item batches.

## Problem

Traditional supply chains can lack transparency, making it hard to verify the origin and handling of goods. This can lead to counterfeiting and difficulty in verifying claims (e.g., organic, fair trade).

## Solution

This project uses a blockchain-based ledger to address these issues:

* **Smart Contract (`Provenance.sol`):** Manages batch creation and event logging with role-based access control.
* **Transparency:** Publicly viewable batch history on the blockchain.
* **Immutability:** Recorded events cannot be altered.
* **React Frontend:** Interface for wallet connection, role-based actions, and viewing provenance data.

## Technology Stack

* **Blockchain:** Ethereum (Sepolia Testnet)
* **Smart Contract:** Solidity `^0.8.20`, OpenZeppelin Contracts (`@openzeppelin/contracts@4.9.3`)
* **Development Environment:** Hardhat
* **Frontend:** React (Vite), Ethers.js v6, Tailwind CSS
* **Wallet:** MetaMask

## Prerequisites

* Node.js (v18+ recommended) & npm
* Git
* MetaMask Browser Extension

## Setup & Running Locally

1.  **Clone:**
    ```bash
    git clone [https://github.com/habibimojtaba/TraceMark.git](https://github.com/habibimojtaba/TraceMark.git)
    cd TraceMark
    ```

2.  **Install Backend Dependencies:**
    ```bash
    npm install
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    cd frontend
    npm install
    cd ..
    ```

4.  **Environment Variables:**
    * Create a `.env` file in the root directory.
    * Add your `SEPOLIA_RPC_URL` (from Alchemy/Infura) and `PRIVATE_KEY` (from MetaMask export).
    * **Important:** Ensure `.env` is listed in your `.gitignore` file.

5.  **Compile Contract:**
    ```bash
    npx hardhat compile
    ```

6.  **Deploy Contract:**
    * Get Sepolia ETH for your deployer account via a faucet.
    * Run: `npx hardhat run scripts/deploy.js --network sepolia`
    * This saves address/ABI to `frontend/src/contracts/` and grants roles to the deployer.

7.  **Run Frontend:**
    ```bash
    cd frontend
    npm run dev
    ```
    * Open the localhost URL (e.g., `http://localhost:5173`) in your browser.

## Usage

1.  Connect MetaMask to the dApp (ensure Sepolia network is selected).
2.  The UI will display your assigned roles (Owner, Originator, Custodian).
3.  Use the relevant panels based on your roles:
    * **Owner:** Grant/revoke roles via the Admin Panel.
    * **Originator:** Create new batches.
    * **Custodian:** Add events to existing batches.
    * **Anyone:** View batch history using a Batch ID.

## Deployed Contract (Sepolia)

`0xF60b4A6D052f73406fed0A2B6c160a8b91e0434E` *(Note: Replace if you redeploy)*

## License

MIT (Consider adding a `LICENSE` file).
