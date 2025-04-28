// --- frontend/src/components/ViewBatch.jsx ---
import React, { useState, useCallback } from 'react';
import BatchHistory from './BatchHistory'; // Component to display history table

// Component to view details and history of a batch
function ViewBatch({ contract, showMessage }) {
    const [batchIdToView, setBatchIdToView] = useState('');
    const [batchDetails, setBatchDetails] = useState(null); // Stores fetched details
    const [batchHistory, setBatchHistory] = useState([]);   // Stores fetched history
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');                 // Stores fetch errors

    // Handle form submission to view batch data
    const handleViewBatch = useCallback(async (e) => {
        if (e) e.preventDefault(); // Prevent page reload on form submit
        if (!contract || !batchIdToView.trim()) {
             setError('Please enter a Batch ID.');
             setBatchDetails(null); setBatchHistory([]); return;
        };

        // Validate Batch ID
        if (isNaN(batchIdToView) || parseInt(batchIdToView, 10) < 0 || !Number.isInteger(Number(batchIdToView))) {
            setError('Batch ID must be a non-negative integer.');
            setBatchDetails(null); setBatchHistory([]); return;
        }
        const numericBatchId = parseInt(batchIdToView, 10);

        setLoading(true);
        setError('');
        setBatchDetails(null); // Clear previous results
        setBatchHistory([]);
        showMessage(`Fetching data for batch ${numericBatchId}...`, 'info');

        try {
             // Fetch details and history concurrently
             const [detailsResult, historyResult] = await Promise.all([
                 contract.getBatchDetails(numericBatchId),
                 contract.getBatchHistory(numericBatchId)
             ]);

            // Format and set details state
            setBatchDetails({
                id: detailsResult.id.toString(),
                description: detailsResult.description,
                originator: detailsResult.originator,
                // Convert Solidity timestamp (seconds) to JS Date (milliseconds)
                creationTime: new Date(Number(detailsResult.creationTime) * 1000).toLocaleString()
            });

            // Format and set history state
            const formattedHistory = historyResult.map(event => ({
                timestamp: new Date(Number(event.timestamp) * 1000).toLocaleString(),
                actor: event.actor,
                description: event.description,
                location: event.location
            }));
            setBatchHistory(formattedHistory);

            showMessage(`Data loaded for batch ${numericBatchId}.`, 'success');

        } catch (error) {
             console.error("Error fetching batch data:", error);
             const reason = error?.reason || error.message;
             setError(`Failed to fetch data: ${reason}`);
             showMessage(`Failed to fetch data: ${reason}`, 'error');
             setBatchDetails(null); // Clear results on error
             setBatchHistory([]);
        } finally {
            setLoading(false);
        }
    }, [contract, batchIdToView, showMessage]); // Recalculate if these change

    return (
        // Card layout for the view section
        <div className="card">
            <h2 className="text-xl font-semibold mb-4">View Batch Provenance</h2>
            {/* Batch ID Input Form */}
            <form onSubmit={handleViewBatch} className="flex items-end gap-2 mb-6">
                 <div className="flex-grow">
                    <label htmlFor="batchIdView" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Batch ID:</label>
                    <input
                        id="batchIdView"
                        type="number"
                        min="0"
                        step="1"
                        value={batchIdToView}
                        onChange={(e) => setBatchIdToView(e.target.value)}
                        placeholder="Enter Batch ID to view"
                        className="input-field" // Tailwind class
                    />
                </div>
                <button type="submit" className="btn h-10" disabled={loading || !batchIdToView}>
                    {loading ? 'Loading...' : 'View History'}
                </button>
            </form>

            {/* Display Error */}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            {/* Display Loading State */}
            {loading && !batchDetails && <p className="text-center">Loading batch data...</p>}

            {/* Display Batch Details if loaded */}
            {batchDetails && (
                <div className="mb-6 p-4 border rounded dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                    <h3 className="text-lg font-semibold mb-2">Batch Details (ID: {batchDetails.id})</h3>
                    <p><strong>Description:</strong> {batchDetails.description}</p>
                    <p><strong>Originator:</strong> <span className="text-xs break-all">{batchDetails.originator}</span></p>
                    <p><strong>Created On:</strong> {batchDetails.creationTime}</p>
                </div>
            )}

            {/* Display Batch History Table if loaded */}
            {batchHistory.length > 0 && (
                 <BatchHistory history={batchHistory} />
            )}

            {/* Placeholders for different states */}
            {!loading && batchDetails && batchHistory.length === 0 && (
                 <p className="text-center text-gray-500">No event history found for this batch (beyond creation).</p>
            )}
             {!loading && !batchDetails && !error && batchIdToView && (
                 <p className="text-center text-gray-500">Batch details will appear here.</p>
             )}
        </div>
    );
}

export default ViewBatch; // Export component
