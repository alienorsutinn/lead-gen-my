'use client';

import { useState } from 'react';
import { exportLeadsAsCsv } from '../actions/leads';

export function ExportButton({ filters }: { filters: any }) {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            const csvData = await exportLeadsAsCsv(filters);
            if (!csvData) {
                alert('No data to export');
                return;
            }

            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            alert('Export failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm"
        >
            {loading ? 'Exporting...' : 'Export CSV'}
        </button>
    );
}
