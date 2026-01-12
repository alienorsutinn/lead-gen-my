import { prisma } from '@lead-gen-my/db';
import Link from 'next/link';

async function getStats() {
    try {
        const total = await prisma.place.count();
        const tierA = await prisma.leadScore.count({ where: { tier: 'A' } });
        const won = await prisma.place.count({ where: { status: 'WON' } });
        const newLeads = await prisma.place.count({ where: { status: 'NEW' } });

        return { total, tierA, won, newLeads };
    } catch (e) {
        return { total: 0, tierA: 0, won: 0, newLeads: 0 };
    }
}

export default async function Home() {
    const stats = await getStats();

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-indigo-900/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-4xl w-full text-center space-y-8">
                <div className="space-y-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold uppercase tracking-widest text-indigo-400">
                        v2.0 Beta
                    </span>
                    <h1 className="text-7xl font-black tracking-tight bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">
                        Lead<span className="text-indigo-500">Gen</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
                        AI-Powered Retrieval, Analysis, and Scoring Engine.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col items-center hover:bg-slate-800 transition-all">
                        <span className="text-4xl font-bold text-white mb-2">{stats.total}</span>
                        <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Total Database</span>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col items-center hover:bg-slate-800 transition-all">
                        <span className="text-4xl font-bold text-emerald-400 mb-2">{stats.tierA}</span>
                        <span className="text-xs uppercase tracking-wider text-emerald-500/50 font-bold">Premium Leads</span>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col items-center hover:bg-slate-800 transition-all">
                        <span className="text-4xl font-bold text-blue-400 mb-2">{stats.newLeads}</span>
                        <span className="text-xs uppercase tracking-wider text-blue-500/50 font-bold">New Inputs</span>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col items-center hover:bg-slate-800 transition-all">
                        <span className="text-4xl font-bold text-indigo-400 mb-2">{stats.won}</span>
                        <span className="text-xs uppercase tracking-wider text-indigo-500/50 font-bold">Deals Won</span>
                    </div>
                </div>

                <div className="pt-8">
                    <Link href="/leads" className="inline-flex items-center gap-3 bg-white text-slate-950 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 group">
                        Launch Workbench
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>
            </div>

            <footer className="absolute bottom-6 text-slate-600 text-xs font-mono">
                System Active • Worker Status: Online
            </footer>
        </div>
    )
}
