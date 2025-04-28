// --- frontend/src/components/AddEvent.jsx ---
import React, { useState } from 'react';

// Component for Custodians to add events to batches
function AddEvent({ contract, showMessage }) {
    const [batchId, setBatchId] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [location, setLocation] = useState(''); // Optional
    const [loading, setLoading] = useState(false);

    // Handle form submission to add event
    const handleAddEvent = async (e) => {
        e.preventDefault();
        if (!contract || !batchId.trim() || !eventDescription.trim()) return;

        // Validate Batch ID input
        if (isNaN(batchId) || parseInt(batchId, 10) < 0 || !Number.isInteger(Number(batchId))) {
            showMessage('Batch ID must be a non-negative integer.', 'error');
            return;
        }
        const numericBatchId = parseInt(batchId, 10);

        setLoading(true);
        showMessage(`Adding event to batch ${numericBatchId}...`, 'info');

        try {
            // Call contract function
            const tx = await contract.addEvent(
                numericBatchId,
                eventDescription.trim(),
                location.trim()
            );
            await tx.wait(); // Wait for transaction
            showMessage(`Event added successfully to batch ${numericBatchId}!`, 'success');
            // Clear form
            setBatchId('');
            setEventDescription('');
            setLocation('');
        } catch (error) {
            console.error("Error adding event:", error);
            showMessage(`Failed to add event: ${error?.reason || error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        // Card layout for the form
        <div className="card">
            <h2 className="text-xl font-semibold mb-4">Add Event to Batch (Custodian Only)</h2>
            <form onSubmit={handleAddEvent}>
                {/* Batch ID Input */}
                <div className="mb-3">
                    <label htmlFor="batchIdEvent" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Batch ID:</label>
                    <input
                        id="batchIdEvent"
                        type="number"
                        min="0"
                        step="1"
                        value={batchId}
                        onChange={(e) => setBatchId(e.target.value)}
                        placeholder="Enter the Batch ID"
                        className="input-field" // Tailwind class
                        required
                    />
                </div>
                 {/* Event Description Input */}
                 <div className="mb-3">
                    <label htmlFor="eventDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Event Description:</label>
                    <input
                        id="eventDescription"
                        type="text"
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                        placeholder="e.g., Shipped via Truck #123"
                        className="input-field" // Tailwind class
                        required
                    />
                </div>
                 {/* Location Input (Optional) */}
                 <div className="mb-3">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location (Optional):</label>
                    <input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., Warehouse B, Port City"
                        className="input-field" // Tailwind class
                    />
                </div>
                {/* Submit Button */}
                <button type="submit" className="btn w-full" disabled={loading || !batchId || !eventDescription}>
                    {loading ? 'Adding Event...' : 'Add Event'}
                </button>
            </form>
        </div>
    );
}

export default AddEvent; // Export component
