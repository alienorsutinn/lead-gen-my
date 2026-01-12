import { getLeads } from '../../actions/leads';
import { ExportButton } from '../../components/ExportButton';
import { UsageWidget } from '../../components/UsageWidget';
import Link from 'next/link';

export default async function LeadsPage({ searchParams }: { searchParams: any }) {
    const page = Number(searchParams.page) || 1;
    const limit = Number(searchParams.limit) || 50;
    const { data: leads, total } = await getLeads(page, limit, {
        search: searchParams.search,
        tier: searchParams.tier,
        hasWebsite: searchParams.hasWebsite === 'true' ? true : (searchParams.hasWebsite === 'false' ? false : undefined),
        minRating: searchParams.minRating ? Number(searchParams.minRating) : undefined,
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
            <div className="sticky top-4 z-10 bg-white shadow-md border border-gray-100 rounded-xl p-4 mb-8 flex flex-wrap gap-8 items-center justify-between">
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

            <UsageWidget />

            {/* Filters */}
            <form className="mb-6 flex flex-wrap gap-4 bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                <input name="search" placeholder="Search business name..." defaultValue={searchParams.search} className="flex-1 min-w-[200px] p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                <select name="tier" defaultValue={searchParams.tier} className="p-2 border border-gray-200 rounded-lg outline-none cursor-pointer">
                    <option value="">All Tiers</option>
                    <option value="A">Tier A only</option>
                    <option value="B">Tier B & Above</option>
                </select>
                <input type="hidden" name="limit" defaultValue={searchParams.limit || 50} />
                <button type="submit" className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-black transition-colors">
                    Search
                </button>
            </form>

            {/* Main Workbench Table */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 text-xs font-bold uppercase text-gray-500">Business</th>
                            <th className="p-4 text-xs font-bold uppercase text-gray-500">Digital Status</th>
                            <th className="p-4 text-xs font-bold uppercase text-gray-500 w-48">Opportunity Score</th>
                            <th className="p-4 text-xs font-bold uppercase text-gray-500">Primary Problem</th>
                            <th className="p-4 text-xs font-bold uppercase text-gray-500">Recommended Pitch</th>
                            <th className="p-4 text-xs font-bold uppercase text-gray-500 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {leads.map(lead => {
                            const score = lead.leadScores[0];
                            const verdict = lead.llmVerdicts[0];
                            const site = lead.websiteCheck;

                            // Digital Status Logic
                            let statusBadge = <span className="px-2 py-1 rounded-full text-[10px] bg-gray-100 text-gray-600">Good Website</span>;
                            if (!lead.websiteUrl) statusBadge = <span className="px-2 py-1 rounded-full text-[10px] bg-red-100 text-red-700 font-bold">No Website</span>;
                            else if (site?.status === 'broken') statusBadge = <span className="px-2 py-1 rounded-full text-[10px] bg-orange-100 text-orange-700 font-bold">Broken Link</span>;
                            else if (verdict?.needsIntervention) statusBadge = <span className="px-2 py-1 rounded-full text-[10px] bg-yellow-100 text-yellow-700 font-bold">Poor Mobile UX</span>;

                            // Problem Extraction
                            let problem = "Performing well";
                            if (!lead.websiteUrl) problem = "Currently invisible online (No website)";
                            else if (site?.status === 'broken') problem = "Broken website link driving customers away";
                            else if (verdict?.reasons) {
                                try {
                                    const parsed = JSON.parse(verdict.reasons);
                                    if (parsed.length > 0) problem = parsed[0];
                                } catch (e) { }
                            }

                            // Score Color
                            const scoreVal = score?.score || 0;
                            const scoreColor = scoreVal > 75 ? 'bg-red-500' : (scoreVal > 50 ? 'bg-orange-400' : 'bg-green-400');

                            // Score Breakdown Tooltip
                            let breakdownText = `Score: ${scoreVal}%`;
                            try {
                                if (score?.breakdown) {
                                    const bd = JSON.parse(score.breakdown);
                                    const factors = Object.entries(bd)
                                        .map(([k, v]) => `${k.replace(/_/g, ' ')}: +${v}`)
                                        .join('\n');
                                    breakdownText = `Lead Quality Factors:\n${factors}\nTotal Score: ${scoreVal}%`;
                                }
                            } catch (e) { }

                            const pitchText = verdict?.offerAngle?.replace(/_/g, ' ') || 'Digital Consultation';

                            return (
                                <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900 leading-tight">{lead.name}</div>
                                        <div className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[200px]">{lead.address}</div>
                                    </td>
                                    <td className="p-4">{statusBadge}</td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1 cursor-help" title={breakdownText}>
                                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                <div className={`${scoreColor} h-full transition-all`} style={{ width: `${scoreVal}%` }}></div>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-500">{scoreVal}% Opportunity</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs text-gray-700 font-medium">{problem}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100 uppercase tracking-tighter">
                                            {pitchText}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href={`/leads/${lead.id}`} className="bg-white border text-gray-700 px-3 py-1 rounded-md text-xs font-bold hover:bg-gray-50">
                                                Open Lead
                                            </Link>
                                            <button
                                                className="p-1 hover:bg-gray-100 rounded"
                                                title="Copy Pitch"
                                            >📋</button>
                                            <Link href={`/map`} className="p-1 hover:bg-gray-100 rounded" title="View Map">📍</Link>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {leads.length === 0 && (
                    <div className="p-12 text-center text-gray-400">
                        No opportunities found matching your filters.
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
