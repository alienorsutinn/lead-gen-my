'use client';

import { useState } from 'react';
import { updateLeadStatus } from '../actions/leads';
import { Badge } from './ui/Badge';
import { useRouter } from 'next/navigation';

export function StatusPicker({ id, currentStatus }: { id: string; currentStatus: string }) {
    const [status, setStatus] = useState(currentStatus);
    const [isUpdating, setIsUpdating] = useState(false);
    const router = useRouter();

    const statuses = [
        { value: 'NEW', label: 'New Opportunity', variant: 'neutral' as const },
        { value: 'CONTACTED', label: 'Contacted', variant: 'info' as const },
        { value: 'IN_PROGRESS', label: 'In Discussion', variant: 'warning' as const },
        { value: 'WON', label: 'Closed - Won', variant: 'success' as const },
        { value: 'LOST', label: 'Closed - Lost', variant: 'neutral' as const },
    ];

    const current = statuses.find(s => s.value === status) || statuses[0];

    async function handleChange(newStatus: string) {
        setIsUpdating(true);
        setStatus(newStatus);
        try {
            await updateLeadStatus(id, newStatus);
            router.refresh(); // Update the server component UI
        } catch (e) {
            console.error('Failed to update status', e);
        } finally {
            setIsUpdating(false);
        }
    }

    return (
        <div className="flex flex-col gap-2 p-6 bg-slate-900 rounded-[2rem] text-white shadow-xl">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Current Sales Stage</label>
            <div className="flex items-center gap-3">
                <select
                    value={status}
                    onChange={(e) => handleChange(e.target.value)}
                    disabled={isUpdating}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2 text-sm font-bold outline-none cursor-pointer transition-colors flex-1"
                >
                    {statuses.map(s => (
                        <option key={s.value} value={s.value} className="text-slate-900 font-bold">
                            {s.label}
                        </option>
                    ))}
                </select>
                <Badge variant={current.variant} className="py-2 px-4 shadow-lg">{current.label}</Badge>
            </div>
            {isUpdating && <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1 animate-pulse px-1">Syncing with HQ...</div>}
        </div>
    );
}
