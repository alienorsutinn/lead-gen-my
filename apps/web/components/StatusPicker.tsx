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
            <div className="relative">
                <select
                    value={status}
                    onChange={(e) => handleChange(e.target.value)}
                    disabled={isUpdating}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                >
                    {statuses.map(s => (
                        <option key={s.value} value={s.value} className="text-slate-900 font-bold">
                            {s.label}
                        </option>
                    ))}
                </select>
                <div className="w-full">
                    <Badge variant={current.variant} className="w-full justify-between py-3 px-4 shadow-lg text-sm">
                        {current.label}
                        <span className="ml-2 text-[10px] opacity-60">▼</span>
                    </Badge>
                </div>
            </div>
            {isUpdating && <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1 animate-pulse px-1">Syncing with HQ...</div>}
        </div>
    );
}
