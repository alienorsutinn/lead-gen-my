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
    const brokenWebsiteCount = leads.filter(l => l.websiteCheck?.status === 'broken').length;
    const noWebsitePct = Math.round((noWebsiteCount / leads.length) * 100) || 0;
    const brokenWebsitePct = Math.round((brokenWebsiteCount / leads.length) * 100) || 0;

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            {/* Header section */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Opportunities</h1>
                    <p className="text-lg text-gray-500 mt-2">Highest impact businesses to contact today</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/map" className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 shadow-sm transition-colors">
                        🗺️ View Map
                    </Link>
                    <ExportButton filters={{ ...searchParams }} />
                </div>
            </div>

            {/* Sticky Summary Bar */}
            <div className="sticky top-4 z-10 bg-white shadow-md border border-gray-100 rounded-xl p-4 mb-4 flex flex-wrap gap-8 items-center justify-between">
                <div className="flex gap-8">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">High Priority (A)</span>
                        <span className="text-2xl font-black text-green-600">{tierA}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Medium Priority (B)</span>
                        <span className="text-2xl font-black text-yellow-600">{tierB}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">No Website</span>
                        <span className="text-2xl font-black text-red-600">{noWebsitePct}%</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Broken URLs</span>
                        <span className="text-2xl font-black text-orange-600">{brokenWebsitePct}%</span>
                    </div>
                </div>
                <Link
                    href="/leads?tier=A&limit=10"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg hover:scale-105 active:scale-95"
                >
                    Show Today's Best 10
                </Link>
            </div>

            {/* Preset Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
                <Link href="/leads?tier=A&limit=20" className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full font-bold text-xs border border-indigo-100 hover:bg-indigo-100 transition-colors">
                    ✨ Quick Wins
                </Link>
                <Link href="/leads?minRating=4.5&minReviews=100" className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-full font-bold text-xs border border-yellow-100 hover:bg-yellow-100 transition-colors">
                    🏆 High Trust Businesses
                </Link>
                <Link href="/leads?opportunityType=no_website" className="px-4 py-2 bg-red-50 text-red-700 rounded-full font-bold text-xs border border-red-100 hover:bg-red-100 transition-colors">
                    🔥 Easy Sells (No Website)
                </Link>
                <Link href="/leads?minReviews=100&tier=A" className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full font-bold text-xs border border-slate-200 hover:bg-slate-200 transition-colors">
                    💎 Premium Targets
                </Link>
            </div>

            <UsageWidget />

            {/* Filters */}
            <form className="mb-6 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                <div className="flex flex-col gap-1 col-span-1 md:col-span-2 lg:col-span-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Business / Search</label>
                    <input name="search" placeholder="Search..." defaultValue={searchParams.search} className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Sales Stage</label>
                    <select name="status" defaultValue={searchParams.status} className="w-full p-2.5 border border-gray-200 rounded-xl outline-none cursor-pointer text-sm">
                        <option value="">All Stages</option>
                        <option value="NEW">New Opportunity</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="IN_PROGRESS">In Discussion</option>
                        <option value="WON">Closed - Won</option>
                        <option value="LOST">Closed - Lost</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Opportunity Type</label>
                    <select name="opportunityType" defaultValue={searchParams.opportunityType} className="w-full p-2.5 border border-gray-200 rounded-xl outline-none cursor-pointer text-sm">
                        <option value="">All Types</option>
                        <option value="no_website">No Website</option>
                        <option value="broken_website">Broken Website</option>
                        <option value="poor_mobile">Poor Mobile UX</option>
                        <option value="seo_opportunity">SEO Opportunity</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Tier</label>
                    <select name="tier" defaultValue={searchParams.tier} className="w-full p-2.5 border border-gray-200 rounded-xl outline-none cursor-pointer text-sm">
                        <option value="">Any Tier</option>
                        <option value="A">High Priority (A)</option>
                        <option value="B">Medium (B+)</option>
                        <option value="C">General (C)</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Min. Rating</label>
                    <select name="minRating" defaultValue={searchParams.minRating} className="w-full p-2.5 border border-gray-200 rounded-xl outline-none cursor-pointer text-sm">
                        <option value="">Any Rating</option>
                        <option value="4.0">4.0+ Stars</option>
                        <option value="4.5">4.5+ Stars</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Min. Reviews</label>
                    <select name="minReviews" defaultValue={searchParams.minReviews} className="w-full p-2.5 border border-gray-200 rounded-xl outline-none cursor-pointer text-sm">
                        <option value="">Any Count</option>
                        <option value="20">20+ Reviews</option>
                        <option value="100">100+ Reviews</option>
                        <option value="500">500+ Reviews</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Area</label>
                    <input name="area" placeholder="Location..." defaultValue={searchParams.area} className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                </div>

                <div className="flex items-end">
                    <button type="submit" className="w-full h-[42px] bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-md active:scale-95">
                        Apply
                    </button>
                </div>
            </form>


            {/* Main Workbench Table */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 text-xs font-bold uppercase text-gray-500">Business</th>
                            <th className="p-4 text-xs font-bold uppercase text-gray-500">Sales Stage</th>
                            <th className="p-4 text-xs font-bold uppercase text-gray-500">Digital Status</th>
                            <th className="p-4 text-xs font-bold uppercase text-gray-500 w-40">Growth Potential</th>
                            <th className="p-4 text-xs font-bold uppercase text-gray-500">Critical Gap</th>
                            <th className="p-4 text-xs font-bold uppercase text-gray-500 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {leads.map(lead => {
                            const score = lead.leadScores[0];
                            const verdict = lead.llmVerdicts[0];
                            const site = lead.websiteCheck;
                            const status = (lead as any).status || 'NEW';

                            // Status Badge Logic
                            let stageBadge = <Badge variant="neutral">New</Badge>;
                            if (status === 'CONTACTED') stageBadge = <Badge variant="info">Contacted</Badge>;
                            if (status === 'IN_PROGRESS') stageBadge = <Badge variant="warning">In Progress</Badge>;
                            if (status === 'WON') stageBadge = <Badge variant="success">Won</Badge>;
                            if (status === 'LOST') stageBadge = <Badge variant="neutral" className="opacity-50">Lost</Badge>;

                            // Digital Status Logic (Standardized)
                            let statusBadge = <Badge variant="success">Digital Ready</Badge>;
                            if (!lead.websiteUrl) statusBadge = <Badge variant="error">No Website</Badge>;
                            else if (site?.status === 'broken') statusBadge = <Badge variant="warning">Broken Website</Badge>;
                            else if (verdict?.needsIntervention) statusBadge = <Badge variant="warning">Mobile UX Issues</Badge>;

                            // Problem Extraction
                            const problem = (lead as any).primaryProblem || "Analysis in progress...";

                            // Score Color
                            const scoreVal = score?.score || 0;
                            const scoreColor = scoreVal > 75 ? 'bg-rose-500' : (scoreVal > 50 ? 'bg-amber-400' : 'bg-emerald-400');

                            // Score Breakdown Tooltip
                            let breakdownText = `Score: ${scoreVal}%`;
                            try {
                                if (score?.breakdown) {
                                    const bd = JSON.parse(score.breakdown);
                                    const factors = Object.entries(bd)
                                        .map(([k, v]) => `${k.replace(/_/g, ' ')}: +${v}`)
                                        .join('\n');
                                    breakdownText = `Growth Factors:\n${factors}\nTotal Potential: ${scoreVal}%`;
                                }
                            } catch (e) { }

                            const pitchText = verdict?.offerAngle?.replace(/_/g, ' ') || 'Strategic Growth';

                            return (
                                <tr key={lead.id} className={`hover:bg-gray-50/50 transition-colors group ${status === 'LOST' ? 'opacity-50 grayscale' : ''}`}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {score?.tier === 'A' && status !== 'LOST' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="High Priority Target" />}
                                            <div className="font-bold text-gray-900 leading-tight">{lead.name}</div>
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[180px]">{lead.address}</div>
                                    </td>
                                    <td className="p-4">{stageBadge}</td>
                                    <td className="p-4">{statusBadge}</td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1 cursor-help" title={breakdownText}>
                                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                <div className={`${scoreColor} h-full transition-all duration-700`} style={{ width: `${scoreVal}%` }}></div>
                                            </div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">{scoreVal}% Potential</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs text-slate-700 font-semibold leading-relaxed max-w-[250px] truncate">{problem}</td>
                                    <td className="p-4 text-right">
                                        <Link href={`/leads/${lead.id}`} className="inline-block bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-black transition-all shadow-sm">
                                            Open Brief
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {leads.length === 0 && (
                    <div className="p-20 text-center bg-slate-50/50">
                        <div className="max-w-md mx-auto">
                            <div className="text-4xl mb-4">🔍</div>
                            <h3 className="text-lg font-black text-slate-900">No Premium Targets Found</h3>
                            <p className="text-sm text-slate-500 mt-2 mb-6">
                                We couldn't find any leads matching these specific filters. Try expanding your search area or looking for any Tier.
                            </p>
                            <Link href="/leads" className="bg-white border-2 border-slate-200 px-6 py-2 rounded-xl text-sm font-bold text-slate-700 hover:border-indigo-600 hover:text-indigo-600 transition-all">
                                Clear All Filters
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 flex items-center justify-between">
                <span className="text-sm text-gray-500">Showing <strong>{leads.length}</strong> of {total} targets</span>
                <div className="flex gap-2">
                    {page > 1 && (
                        <Link href={`/leads?page=${page - 1}${searchParams.tier ? `&tier=${searchParams.tier}` : ''}`} className="px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                            Previous Page
                        </Link>
                    )}
                    <Link href={`/leads?page=${page + 1}${searchParams.tier ? `&tier=${searchParams.tier}` : ''}`} className="px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        Next Page
                    </Link>
                </div>
            </div>
        </div>
    );
}
