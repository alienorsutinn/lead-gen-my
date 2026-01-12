import { getLeadDetails } from '../../../actions/leads';
import { OutreachGenerator } from '../../../components/OutreachGenerator';
import Link from 'next/link';
import Image from 'next/image';

export default async function LeadDetailsPage({ params }: { params: { id: string } }) {
    const lead = await getLeadDetails(params.id);

    if (!lead) return <div>Lead not found</div>;

    const score = lead.leadScores[0];
    const verdict = lead.llmVerdicts[0];
    const mobileAudit = lead.psiAudits.find(a => a.strategy === 'mobile');
    const screenshots = lead.screenshots;

    const reasons = (verdict?.reasons as any as string[]) || [];

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <Link href="/leads" className="text-gray-500 hover:text-gray-700">← Back to Dashboard</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{lead.name}</h1>
                                <p className="text-gray-600">{lead.address}</p>
                                <a href={lead.websiteUrl || '#'} target="_blank" className="text-blue-600 underline mt-2 block">
                                    {lead.websiteUrl || "No Website By URL"}
                                </a>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-black text-slate-800">{score?.score || 0}</div>
                                <div className="text-sm text-gray-500">Tier {score?.tier || '-'}</div>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-semibold block">Rating:</span> {lead.rating} ({lead.userRatingCount})
                            </div>
                            <div>
                                <span className="font-semibold block">Phone:</span> {lead.phone}
                            </div>
                            <div>
                                <span className="font-semibold block">Primary Type:</span> {lead.primaryType}
                            </div>
                        </div>
                    </div>

                    {/* Screenshots */}
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <h2 className="text-xl font-semibold mb-4">Visual Evidence</h2>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {screenshots.length === 0 && <span className="text-gray-400 italic">No screenshots captured.</span>}
                            {screenshots.map(s => (
                                <div key={s.id} className="relative group shrink-0">
                                    <div className="mb-1 text-xs font-bold uppercase text-gray-500">{s.viewport}</div>
                                    <div className={`border rounded overflow-hidden ${s.viewport === 'mobile' ? 'w-48' : 'w-96'}`}>
                                        {/* Use local API route for image serving */}
                                        {/* path is stored as absolute path by worker... need to make it relative for API */}
                                        {/* Worker path: apps/worker/storage/screenshots/... */}
                                        {/* We just need the suffix after 'screenshots/' */}
                                        <img
                                            src={`/api/screenshots/${s.pngPath.split('screenshots/')[1]}`}
                                            alt={s.viewport}
                                            className="w-full h-auto"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PSI & Metrics */}
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <h2 className="text-xl font-semibold mb-4">Performance & Tech</h2>
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <div className="p-3 bg-gray-50 rounded">
                                <div className="text-2xl font-bold">{mobileAudit?.performance || '-'}</div>
                                <div className="text-xs text-gray-500">Perf</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded">
                                <div className="text-2xl font-bold">{mobileAudit?.seo || '-'}</div>
                                <div className="text-xs text-gray-500">SEO</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded">
                                <div className="text-2xl font-bold">{mobileAudit?.accessibility || '-'}</div>
                                <div className="text-xs text-gray-500">Access</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded">
                                <div className={`text-2xl font-bold ${lead.websiteCheck?.https ? 'text-green-600' : 'text-red-500'}`}>
                                    {lead.websiteCheck?.https ? 'Yes' : 'No'}
                                </div>
                                <div className="text-xs text-gray-500">HTTPS</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Verdict */}
                    <div className={`p-6 rounded-lg shadow border ${verdict?.needsIntervention ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                        <h2 className="text-xl font-semibold mb-2">Verdict</h2>
                        <p className="font-medium text-lg capitalize mb-4">
                            {verdict?.needsIntervention ? "Intervention Needed" : "Looks Good"}
                        </p>

                        <div className="space-y-2">
                            {reasons.slice(0, 5).map((r: string, i: number) => (
                                <div key={i} className="flex gap-2 text-sm">
                                    <span className="text-red-500">•</span> {r}
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-red-100">
                            <div className="text-xs font-bold uppercase text-gray-500 mb-1">Offer Angle</div>
                            <div className="bg-white px-3 py-1 rounded border inline-block font-mono text-sm">
                                {verdict?.offerAngle || 'Unknown'}
                            </div>
                        </div>
                    </div>

                    {/* Generator */}
                    <OutreachGenerator
                        placeName={lead.name}
                        offerAngle={verdict?.offerAngle || 'unknown'}
                        reasons={reasons}
                    />
                </div>
            </div>
        </div>
    );
}
