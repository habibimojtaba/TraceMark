// --- frontend/src/components/ConnectWallet.jsx ---
import React from 'react';

// Simple component to display connection status and connect button
function ConnectWallet({ account, networkName, connectWallet, loading }) {
    return (
        // Card layout using Tailwind classes
        <div className="card text-center">
            {/* Conditional rendering based on account connection status */}
            {!account ? (
                // Show connect button if no account is connected
                <button onClick={connectWallet} className="btn" disabled={loading}>
                    {/* Show loading text or default text */}
                    {loading ? 'Connecting...' : 'Connect Wallet (MetaMask)'}
                </button>
            ) : (
                // Show connection details if account is connected
                <div>
                    <p className="text-green-600 dark:text-green-400 font-semibold">Wallet Connected</p>
                    {/* Display truncated account address */}
                    <p className="text-sm break-all">Account: {account}</p>
                    {/* Display connected network name */}
                    <p className="text-sm">Network: {networkName || 'Loading...'}</p>
                </div>
            )}
        </div>
    );
}

export default ConnectWallet; // Export the component
