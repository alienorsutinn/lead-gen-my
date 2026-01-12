'use client';

import { useState, useTransition } from 'react';
import { triggerAnalysis } from '../actions/analysis';
import { Activity, Loader2 } from 'lucide-react';

export function RunAnalysisButton({ placeId }: { placeId: string }) {
    const [isPending, startTransition] = useTransition();
    const [triggered, setTriggered] = useState(false);

    const handleRun = () => {
        startTransition(async () => {
            try {
                await triggerAnalysis(placeId);
                setTriggered(true);
            } catch (e) {
                console.error(e);
                alert("Failed to trigger analysis");
            }
        });
    };

    if (triggered) {
        return (
            <div className="mt-6 px-6 py-2 bg-indigo-50 text-indigo-600 text-sm font-bold rounded-xl border border-indigo-100 flex items-center gap-2 justify-center">
                <Loader2 size={16} className="animate-spin" /> Analysis Queued...
            </div>
        );
    }

    return (
        <button
            onClick={handleRun}
            disabled={isPending}
            className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto"
        >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Activity size={16} />}
            Run Analysis
        </button>
    );
}
