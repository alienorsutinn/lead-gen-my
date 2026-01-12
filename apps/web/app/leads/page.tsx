import { getLeads } from '../../actions/leads';
import { ExportButton } from '../../components/ExportButton';
import { UsageWidget } from '../../components/UsageWidget';
import Link from 'next/link';

export default async function LeadsPage({ searchParams }: { searchParams: any }) {
    const page = Number(searchParams.page) || 1;
    const { data: leads, total } = await getLeads(page, 50, {
        search: searchParams.search,
        tier: searchParams.tier,
        hasWebsite: searchParams.hasWebsite === 'true' ? true : undefined,
        minRating: searchParams.minRating ? Number(searchParams.minRating) : undefined
    });

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Leads ({total})</h1>
                <div className="flex gap-4 items-center">
                    <ExportButton filters={{
                        search: searchParams.search,
                        tier: searchParams.tier,
                        hasWebsite: searchParams.hasWebsite === 'true' ? true : (searchParams.hasWebsite === 'false' ? false : undefined),
                        minRating: searchParams.minRating
                    }} />
                    <Link href="/map" className="bg-green-600 text-white p-2 rounded hover:bg-green-700 flex items-center gap-2">
                        View Map
                    </Link>
                    <Link href="/" className="text-blue-600 underline">Back Home</Link>
                </div>
            </div>

            <UsageWidget />

            {/* Filter Controls (Basic Form for now, enhances with JS usually) */}
            <form className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4 bg-gray-50 p-4 rounded">
                <input name="search" placeholder="Search..." defaultValue={searchParams.search} className="p-2 border rounded" />
                <select name="tier" defaultValue={searchParams.tier} className="p-2 border rounded">
                    <option value="">All Tiers</option>
                    <option value="A">Tier A</option>
                    <option value="B">Tier B</option>
                    <option value="C">Tier C</option>
                </select>
                <select name="hasWebsite" defaultValue={searchParams.hasWebsite} className="p-2 border rounded">
                    <option value="">Any Website Status</option>
                    <option value="true">Has Website</option>
                    <option value="false">No Website</option>
                </select>
                <input name="minRating" type="number" step="0.1" placeholder="Min Rating" defaultValue={searchParams.minRating} className="p-2 border rounded" />
                <button type="submit" className="bg-blue-600 text-white p-2 rounded">Filter</button>
            </form>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Rating</th>
                            <th className="p-3 text-left">Website</th>
                            <th className="p-3 text-left">Score</th>
                            <th className="p-3 text-left">Tier</th>
                            <th className="p-3 text-left">Intervention?</th>
                            <th className="p-3 text-left">Angle</th>
                            <th className="p-3 text-left">Reason</th>
                            <th className="p-3 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map(lead => {
                            const score = lead.leadScores[0];
                            const verdict = lead.llmVerdicts[0];
                            const site = lead.websiteCheck;

                            // Extract Top Reason
                            let topReason = '-';
                            if (verdict?.reasons) {
                                try {
                                    const parsed = JSON.parse(verdict.reasons);
                                    if (Array.isArray(parsed) && parsed.length > 0) topReason = parsed[0];
                                } catch (e) { }
                            } else if (score?.breakdown) {
                                // Fallback to breakdown if no LLM verdict yet
                                try {
                                    const bd = JSON.parse(score.breakdown);
                                    if (bd.no_website) topReason = "No website";
                                    else if (bd.llm_flagged) topReason = "AI intervention";
                                    else if (bd.low_seo) topReason = "Poor SEO";
                                } catch (e) { }
                            }

                            return (
                                <tr key={lead.id} className="border-t hover:bg-gray-50">
                                    <td className="p-3">
                                        <div className="font-semibold">{lead.name}</div>
                                        <div className="text-xs text-gray-500 truncate w-48">{lead.address}</div>
                                    </td>
                                    <td className="p-3">{lead.rating} ({lead.userRatingCount})</td>
                                    <td className="p-3 text-sm">
                                        {(() => {
                                            if (!lead.websiteUrl) return <span className="text-red-600 font-bold">No website</span>;
                                            if (!site) return <span className="text-gray-400">Pending</span>;
                                            return (
                                                <span className={site.status === 'ok' ? 'text-green-600' : 'text-orange-500'}>
                                                    {site.status === 'broken' ? 'Broken' : site.status}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td className="p-3 font-bold">{score?.score || '-'}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${score?.tier === 'A' ? 'bg-green-100 text-green-800' :
                                            score?.tier === 'B' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'
                                            }`}>
                                            {score?.tier || '-'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {verdict?.needsIntervention ? (
                                            <span className="text-red-600 font-bold">YES</span>
                                        ) : (
                                            <span className="text-gray-400">No</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-sm italic">{verdict?.offerAngle?.replace(/_/g, ' ') || '-'}</td>
                                    <td className="p-3 text-xs text-gray-600 max-w-[150px] truncate" title={topReason}>
                                        {topReason}
                                    </td>
                                    <td className="p-3">
                                        <Link href={`/leads/${lead.id}`} className="text-blue-600 hover:underline">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex gap-2">
                {page > 1 && <Link href={`/leads?page=${page - 1}`} className="p-2 border rounded">Prev</Link>}
                <Link href={`/leads?page=${page + 1}`} className="p-2 border rounded">Next</Link>
            </div>
        </div>
    );
}
