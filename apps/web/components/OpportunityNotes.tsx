'use client';

import { useState } from 'react';
import { addNote } from '../actions/opportunities';
import { useRouter } from 'next/navigation';

export function OpportunityNotes({ id, notes }: { id: string; notes: any[] }) {
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSaving(true);
        try {
            await addNote(id, content);
            setContent('');
            router.refresh();
        } catch (err) {
            console.error('Failed to save note', err);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm mt-10">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <span className="p-2 bg-slate-100 rounded-xl">📝</span> Internal Opportunity History
            </h3>

            <form onSubmit={handleSubmit} className="mb-10 space-y-4">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Log a call, meeting outcome, or internal note..."
                    className="w-full h-32 p-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 transition-all"
                />
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving || !content.trim()}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-lg transition-all active:scale-95"
                    >
                        {isSaving ? 'Logging Note...' : 'Log Note'}
                    </button>
                </div>
            </form>

            <div className="space-y-6">
                {notes.length > 0 ? notes.map((note) => (
                    <div key={note.id} className="p-6 bg-slate-50 rounded-2xl border-l-4 border-indigo-500 relative overflow-hidden group">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex justify-between">
                            <span>{new Date(note.createdAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">Logged by CRM Agent</span>
                        </div>
                        <p className="text-slate-800 font-bold leading-relaxed">{note.content}</p>
                    </div>
                )) : (
                    <div className="py-10 text-center text-slate-400 font-bold italic">
                        No internal history logged yet for this opportunity.
                    </div>
                )}
            </div>
        </div>
    );
}
