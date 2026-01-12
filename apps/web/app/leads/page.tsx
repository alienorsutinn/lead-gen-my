import { getLeads } from '../../actions/leads';
import { ExportButton } from '../../components/ExportButton';
import { UsageWidget } from '../../components/UsageWidget';
import Link from 'next/link';
import { Badge } from '../../components/ui/Badge';



export default async function LeadsPage({ searchParams }: { searchParams: any }) {
    const page = Number(searchParams.page) || 1;
    const limit = Number(searchParams.limit) || 50;
    const { data: leads, total } = await getLeads(page, limit, {
        search: searchParams.search,
        tier: searchParams.tier,
        opportunityType: searchParams.opportunityType,
        area: searchParams.area,
        minRating: searchParams.minRating ? Number(searchParams.minRating) : undefined,
        minReviews: searchParams.minReviews ? Number(searchParams.minReviews) : undefined,
        limit
    });

    // Summary Metrics
    const tierA = leads.filter(l => l.leadScores[0]?.tier === 'A').length;
    const tierB = leads.filter(l => l.leadScores[0]?.tier === 'B').length;
    const noWebsiteCount = leads.filter(l => !l.websiteUrl).length;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
            <div className="container mx-auto p-8 max-w-[1600px]">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Workbench
                        </h1>
                        <p className="text-lg text-slate-400 mt-2 font-light">
                            High-impact opportunities prioritized by AI.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/map" className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 border border-slate-700/50 rounded-xl hover:bg-slate-700 transition-all font-medium text-sm text-slate-300 hover:text-white group">
                            <span>🗺️</span>
                            <span>Map View</span>
                        </Link>
                        <ExportButton filters={{ ...searchParams }} />
                    </div>
                </header>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl flex flex-col items-start hover:bg-slate-800/60 transition-colors cursor-default">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">High Priority</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-emerald-400">{tierA}</span>
                            <span className="text-sm font-medium text-emerald-400/80">Hot Leads</span>
                        </div>
                    </div>
                    <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl flex flex-col items-start hover:bg-slate-800/60 transition-colors cursor-default">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Medium Priority</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-amber-400">{tierB}</span>
                            <span className="text-sm font-medium text-amber-400/80">Warm Leads</span>
                        </div>
                    </div>
                    <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl flex flex-col items-start hover:bg-slate-800/60 transition-colors cursor-default">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">No Website</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-rose-400">{noWebsiteCount}</span>
                            <span className="text-sm font-medium text-rose-400/80">Opportunities</span>
                        </div>
                    </div>
                    <Link href="/leads?tier=A" className="bg-gradient-to-br from-indigo-600 to-violet-600 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all group">
                        <span className="text-lg font-bold text-white mb-1 group-hover:underline decoration-2 underline-offset-4">
                            Work High Priority
                        </span>
                        <span className="text-xs text-indigo-100 opacity-80">
                            Focus on the top {tierA} leads
                        </span>
                    </Link>
                </div>

                {/* Filters Row */}
                <div className="bg-slate-800/30 border border-slate-700/50 p-2 rounded-2xl mb-8 flex flex-wrap lg:flex-nowrap gap-2 items-center">
                    <div className="relative flex-grow min-w-[300px]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            name="search"
                            defaultValue={searchParams.search}
                            placeholder="Search businesses..."
                            className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-200"
                        />
                    </div>

                    {/* Quick Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0 px-2 scrollbar-hide">
                        <Link href="/leads?tier=A" className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold border transition-all ${searchParams.tier === 'A' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                            💎 Top Tier
                        </Link>
                        <Link href="/leads?opportunityType=no_website" className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold border transition-all ${searchParams.opportunityType === 'no_website' ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                            🌐 No Website
                        </Link>
                        <Link href="/leads?status=NEW" className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold border transition-all ${searchParams.status === 'NEW' ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                            🆕 New Only
                        </Link>
                    </div>
                </div>

                {/* Main List */}
                <div className="space-y-4">
                    {leads.map(lead => {
                        const score = lead.leadScores[0];
                        const verdict = lead.llmVerdicts[0];
                        const status = (lead as any).status || 'NEW';

                        // Score color
                        const scoreVal = score?.score || 0;
                        const scoreClass = scoreVal > 75 ? 'bg-emerald-500' : (scoreVal > 50 ? 'bg-amber-500' : 'bg-slate-500');

                        // Problem Text Handling
                        const rawProblem = (lead as any).primaryProblem;
                        const isAnalysisInProgress = !rawProblem;
                        const problemText = rawProblem || "Analysis in progress...";

                        return (
                            <div key={lead.id} className="group relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800 hover:border-slate-600 transition-all duration-300 flex flex-col md:flex-row gap-6 items-start md:items-center">

                                {/* Score Indicator */}
                                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-lg ${scoreClass} bg-opacity-90`}>
                                        {scoreVal}
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Score</span>
                                </div>

                                {/* Main Info */}
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-xl font-bold text-slate-100 truncate">{lead.name}</h3>
                                        {score?.tier === 'A' && <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wide border border-emerald-500/30">Top Pick</span>}
                                        <Badge variant={status === 'WON' ? 'success' : 'neutral'} className="text-[10px]">{status}</Badge>
                                    </div>
                                    <p className="text-slate-400 text-sm mb-3 flex items-center gap-1">
                                        <span className="inline-block w-4 text-center">📍</span> {lead.address}
                                    </p>

                                    {/* Problem / Insight */}
                                    <div className="flex items-start gap-2">
                                        <span className="text-xs font-bold text-indigo-400 mt-0.5 uppercase tracking-wide px-2 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/20">Insight</span>
                                        <p className={`text-sm leading-relaxed ${isAnalysisInProgress ? 'text-slate-500 italic' : 'text-slate-300'}`}>
                                            {problemText}
                                            {isAnalysisInProgress && (
                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-slate-700 text-slate-400 not-italic" title="Our AI workers are currently analyzing this lead's digital footprint. Check back in a few minutes.">
                                                    ℹ️ Waiting for AI
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex-shrink-0 flex flex-col gap-3 w-full md:w-auto">
                                    <Link href={`/leads/${lead.id}`} className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-900 rounded-xl font-bold text-sm hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/20">
                                        View Strategy
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </Link>
                                    {lead.websiteUrl && (
                                        <a href={lead.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-center font-medium text-slate-500 hover:text-indigo-400 transition-colors flex items-center justify-center gap-1">
                                            Visit Website <span className="text-[10px]">↗</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                <div className="mt-12 flex items-center justify-between border-t border-slate-800 pt-6">
                    <span className="text-sm text-slate-500 font-medium">Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total}</span>
                    <div className="flex gap-2">
                        {page > 1 && (
                            <Link href={`/leads?page=${page - 1}`} className="px-5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-all">
                                Previous
                            </Link>
                        )}
                        <Link href={`/leads?page=${page + 1}`} className="px-5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-all">
                            Next
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
