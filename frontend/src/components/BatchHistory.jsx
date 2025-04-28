// --- frontend/src/components/BatchHistory.jsx ---
import React from 'react';

// Component specifically for displaying the event history in a table
function BatchHistory({ history }) {
    // Handle cases where history might be null or empty
    if (!history || history.length === 0) {
        // This message is now handled in ViewBatch, but keep a fallback just in case
        return <p className="text-center text-gray-500">No history events to display.</p>;
    }

    return (
        <div>
            <h3 className="text-lg font-semibold mb-3">Event History</h3>
            {/* Responsive table container */}
            <div className="overflow-x-auto">
                {/* Table structure with Tailwind styling */}
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border dark:border-gray-600 rounded-md">
                    {/* Table Header */}
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Timestamp</th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Event</th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actor</th>
                             <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                        </tr>
                    </thead>
                    {/* Table Body */}
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {/* Map over the history array to create table rows */}
                        {history.map((event, index) => (
                            // Use index as key (safe if list doesn't reorder)
                            // Apply alternating row background colors for readability
                            <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}>
                                {/* Table Data Cells */}
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{event.timestamp}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{event.description}</td>
                                {/* Allow actor address to break if needed */}
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 break-all">{event.actor}</td>
                                 {/* Display location or a dash if empty */}
                                 <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{event.location || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default BatchHistory; // Export the component
