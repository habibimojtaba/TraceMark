// --- frontend/src/components/CreateBatch.jsx ---
import React, { useState } from 'react';

// Component for Originators to create new batches
function CreateBatch({ contract, showMessage }) {
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    // Handle form submission to create batch
    const handleCreateBatch = async (e) => {
        e.preventDefault();
        if (!contract || !description.trim()) return;

        setLoading(true);
        showMessage('Creating new batch...', 'info');

        try {
            const tx = await contract.createBatch(description.trim());
            const receipt = await tx.wait(); // Wait for transaction

            // Extract Batch ID from event logs for confirmation
            const batchCreatedEvent = receipt.logs?.find(log => {
                 try {
                     const parsedLog = contract.interface.parseLog(log);
                     return parsedLog?.name === "BatchCreated";
                 } catch (e) { return false; } // Ignore non-matching logs
             });
            const batchId = batchCreatedEvent ? batchCreatedEvent.args.batchId.toString() : 'unknown';

            showMessage(`Batch created successfully! Batch ID: ${batchId}`, 'success');
            setDescription(''); // Clear input
        } catch (error) {
            console.error("Error creating batch:", error);
            showMessage(`Failed to create batch: ${error?.reason || error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        // Card layout for the form
        <div className="card">
            <h2 className="text-xl font-semibold mb-4">Create New Batch (Originator Only)</h2>
            <form onSubmit={handleCreateBatch}>
                {/* Description Input */}
                <div className="mb-3">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Batch Description:</label>
                    <input
                        id="description"
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., Organic Coffee Beans Lot #42"
                        className="input-field" // Tailwind class
                        required
                    />
                </div>
                {/* Submit Button */}
                <button type="submit" className="btn w-full" disabled={loading || !description.trim()}>
                    {loading ? 'Creating...' : 'Create Batch'}
                </button>
            </form>
        </div>
    );
}

export default CreateBatch; // Export component
