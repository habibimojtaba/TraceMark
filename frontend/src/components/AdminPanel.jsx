    // --- frontend/src/components/AdminPanel.jsx ---
    import React, { useState } from 'react';
    import { ethers } from 'ethers'; // For address validation

    // Admin panel for owner actions (grant/revoke roles)
    function AdminPanel({ contract, showMessage }) {
        // Grant role form state
        const [addressToGrant, setAddressToGrant] = useState('');
        const [roleToGrant, setRoleToGrant] = useState('originator');
        const [loadingGrant, setLoadingGrant] = useState(false);

        // Revoke role form state
        const [addressToRevoke, setAddressToRevoke] = useState('');
        const [roleToRevoke, setRoleToRevoke] = useState('originator');
        const [loadingRevoke, setLoadingRevoke] = useState(false);

        // Grant role handler
        const handleGrantRole = async (e) => {
            e.preventDefault();
            if (!contract || !addressToGrant.trim()) return;
            if (!ethers.isAddress(addressToGrant.trim())) {
                showMessage('Invalid Ethereum address.', 'error');
                return;
            }

            setLoadingGrant(true);
            const role = roleToGrant === 'originator' ? 'Originator' : 'Custodian';
            showMessage(`Granting ${role} role to ${addressToGrant}...`, 'info');

            try {
                let tx;
                if (roleToGrant === 'originator') {
                    tx = await contract.grantOriginatorRole(addressToGrant.trim());
                } else {
                    tx = await contract.grantCustodianRole(addressToGrant.trim());
                }
                await tx.wait(); // Wait for mining
                showMessage(`${role} role granted successfully to ${addressToGrant}!`, 'success');
                setAddressToGrant(''); // Clear input
            } catch (error) {
                console.error(`Error granting ${role} role:`, error);
                showMessage(`Failed to grant ${role} role: ${error?.reason || error.message}`, 'error');
            } finally {
                setLoadingGrant(false);
            }
        };

         // Revoke role handler
         const handleRevokeRole = async (e) => {
            e.preventDefault();
            if (!contract || !addressToRevoke.trim()) return;
             if (!ethers.isAddress(addressToRevoke.trim())) {
                showMessage('Invalid Ethereum address.', 'error');
                return;
            }

            setLoadingRevoke(true);
            const role = roleToRevoke === 'originator' ? 'Originator' : 'Custodian';
            showMessage(`Revoking ${role} role from ${addressToRevoke}...`, 'info');

            try {
                let tx;
                if (roleToRevoke === 'originator') {
                    tx = await contract.revokeOriginatorRole(addressToRevoke.trim());
                } else {
                    tx = await contract.revokeCustodianRole(addressToRevoke.trim());
                }
                await tx.wait(); // Wait for mining
                showMessage(`${role} role revoked successfully from ${addressToRevoke}!`, 'success');
                setAddressToRevoke(''); // Clear input
            } catch (error) {
                console.error(`Error revoking ${role} role:`, error);
                showMessage(`Failed to revoke ${role} role: ${error?.reason || error.message}`, 'error');
            } finally {
                setLoadingRevoke(false);
            }
        };


        return (
            <div className="card">
                <h2 className="text-xl font-semibold mb-4">Admin Panel (Owner Only)</h2>

                {/* Grant Role Form */}
                <form onSubmit={handleGrantRole} className="mb-6 p-4 border rounded dark:border-gray-600">
                     <h3 className="text-lg font-medium mb-2">Grant Role</h3>
                     <div className="mb-3">
                        <label htmlFor="addressGrant" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address:</label>
                        <input
                            id="addressGrant"
                            type="text"
                            value={addressToGrant}
                            onChange={(e) => setAddressToGrant(e.target.value)}
                            placeholder="0x..."
                            className="input-field"
                            required
                        />
                    </div>
                     <div className="mb-3">
                         <label htmlFor="roleGrant" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role:</label>
                         <select
                             id="roleGrant"
                             value={roleToGrant}
                             onChange={(e) => setRoleToGrant(e.target.value)}
                             className="input-field"
                         >
                             <option value="originator">Originator</option>
                             <option value="custodian">Custodian</option>
                         </select>
                     </div>
                    <button type="submit" className="btn w-full" disabled={loadingGrant || !addressToGrant}>
                        {loadingGrant ? 'Granting...' : 'Grant Role'}
                    </button>
                </form>

                 {/* Revoke Role Form */}
                <form onSubmit={handleRevokeRole} className="p-4 border rounded dark:border-gray-600">
                     <h3 className="text-lg font-medium mb-2">Revoke Role</h3>
                     <div className="mb-3">
                        <label htmlFor="addressRevoke" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address:</label>
                        <input
                            id="addressRevoke"
                            type="text"
                            value={addressToRevoke}
                            onChange={(e) => setAddressToRevoke(e.target.value)}
                            placeholder="0x..."
                            className="input-field"
                            required
                        />
                    </div>
                     <div className="mb-3">
                         <label htmlFor="roleRevoke" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role:</label>
                         <select
                             id="roleRevoke"
                             value={roleToRevoke}
                             onChange={(e) => setRoleToRevoke(e.target.value)}
                             className="input-field"
                         >
                             <option value="originator">Originator</option>
                             <option value="custodian">Custodian</option>
                         </select>
                     </div>
                    <button type="submit" className="btn w-full bg-red-600 hover:bg-red-700 focus:ring-red-500" disabled={loadingRevoke || !addressToRevoke}>
                        {loadingRevoke ? 'Revoking...' : 'Revoke Role'}
                    </button>
                </form>
            </div>
        );
    }

    export default AdminPanel;
    