'use client';

import { useState } from 'react';
import { exportOpportunitiesAsCsv } from '../actions/opportunities';
import { Download } from 'lucide-react';
import { useToast } from './ui/Toast';

interface ExportButtonProps {
    filters: any;
}

export function ExportButton({ filters }: ExportButtonProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleExport = async () => {
        setLoading(true);
        toast('Generating CSV export...', 'info');
        try {
            const csvData = await exportOpportunitiesAsCsv(filters);
            if (!csvData) {
                toast('No data to export', 'warning');
                return;
            }

            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `opportunities-${new Date().toISOString().split('T')[0]}.csv`;
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
            className="bg-white border-2 border-slate-200 text-slate-700 px-6 py-2 rounded-xl font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
            <Download size={16} className={loading ? 'animate-bounce' : ''} />
            {loading ? 'Generating...' : 'Export Results'}
        </button>
    );
}
