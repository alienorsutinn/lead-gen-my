'use client';

import { useEffect, useState } from 'react';
import { getDailyUsage } from '../actions/usage';

// Hardcoded limits for display matching env vars default
// Ideally these come from server config endpoint
const LIMITS: Record<string, number> = {
    DISCOVER_PLACES: 500,
    PSI_AUDIT: 100,
    LLM_VERDICT: 50,
    CAPTURE_SCREENSHOT: 50
};

export function UsageWidget() {
    const [usage, setUsage] = useState<Record<string, number>>({});

    useEffect(() => {
        getDailyUsage().then(setUsage);
    }, []);

    const metrics = [
        { key: 'DISCOVER_PLACES', label: 'Market Discovery' },
        { key: 'PSI_AUDIT', label: 'Experience Checks' },
        { key: 'CAPTURE_SCREENSHOT', label: 'Proof Captures' },
        { key: 'LLM_VERDICT', label: 'Strategy Audits' },
    ];

    return (
        <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 mb-8">
            <h3 className="font-black mb-6 text-slate-900 uppercase tracking-widest text-[10px]">Daily Strategy Capacity</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {metrics.map(m => {
                    const current = usage[m.key] || 0;
                    const max = LIMITS[m.key] || 100;
                    const percent = Math.min((current / max) * 100, 100);
                    const color = percent > 90 ? 'bg-red-500' : (percent > 75 ? 'bg-yellow-500' : 'bg-green-500');

                    return (
                        <div key={m.key} className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span>{m.label}</span>
                                <span className="font-mono">{current} / {max}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`${color} h-2 rounded-full transition-all duration-500`}
                                    style={{ width: `${percent}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
