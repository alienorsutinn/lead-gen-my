'use client';

import { RunAnalysisButton } from '../../../components/RunAnalysisButton';
import { ReviewsList } from '../../../components/ReviewsList';

import { OutreachGenerator } from '../../../components/OutreachGenerator';
import Link from 'next/link';
import { Badge } from '../../../components/ui/Badge';
import { StatusPicker } from '../../../components/StatusPicker';
import { OpportunityNotes } from '../../../components/OpportunityNotes';
import { getOpportunityDetails } from '../../../actions/opportunities';
import { ArrowRight, MapPin, Phone, Star, AlertCircle, CheckCircle2, Globe, Clock, ShieldCheck, Mail, ExternalLink, Activity, Sparkles } from 'lucide-react';

// --- Components ---

function MetricCard({ label, value, subtext, status, icon: Icon }: { label: string, value: string | number, subtext?: string, status: 'good' | 'bad' | 'neutral', icon?: any }) {
    const colors = {
        good: 'text-teal-600 bg-teal-50 border-teal-100',
        bad: 'text-rose-600 bg-rose-50 border-rose-100',
        neutral: 'text-slate-600 bg-slate-50 border-slate-100'
    };

    return (
        <div className={`p-5 rounded-2xl border ${colors[status]} flex flex-col relative overflow-hidden group hover:shadow-md transition-all`}>
            <div className="flex justify-between items-start mb-2">
                <div className="text-[10px] uppercase font-bold tracking-widest opacity-70">{label}</div>
                {Icon && <Icon size={16} className="opacity-50" />}
            </div>
            <div className={`text-2xl font-black mb-1`}>
                {value}
            </div>
            {subtext && <div className="text-xs opacity-80 font-medium">{subtext}</div>}
        </div>
    );
}

function UxFrictionAudit({ audit }: { audit: any }) {
    if (!audit) return null;

    let contactMethods: string[] = [];
    try {
        contactMethods = JSON.parse(audit.contactMethods || '[]');
    } catch (e) { }

    const isSlow = audit.ttcAboveFoldMs && audit.ttcAboveFoldMs > 3000;
    const isBuried = audit.clicksToContact && audit.clicksToContact > 1;

    return (
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Activity size={20} /></span>
                Buyer Friction Analysis
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <MetricCard
                            label="Time to Contact"
                            value={audit.ttcAboveFoldMs ? `${(audit.ttcAboveFoldMs / 1000).toFixed(1)}s` : 'N/A'}
                            status={isSlow ? 'bad' : 'good'}
                            subtext="Should be < 2s"
                            icon={Clock}
                        />
                        <MetricCard
                            label="Clicks to Call"
                            value={audit.clicksToContact ?? 'N/A'}
                            status={isBuried ? 'bad' : 'good'}
                            subtext={isBuried ? 'Hidden in menu' : 'Visible'}
                            icon={Phone}
                        />
                    </div>

                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block">Detected Channels</label>
                        <div className="flex flex-wrap gap-2">
                            {contactMethods.length > 0 ? contactMethods.map((m: string) => (
                                <span key={m} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 shadow-sm capitalize">
                                    {m}
                                </span>
                            )) : <span className="text-xs text-rose-500 font-bold flex items-center gap-1"><AlertCircle size={12} /> No contact methods detected!</span>}
                        </div>
                    </div>
                </div>

                <div className="relative group">
                    {audit.evidencePngPath ? (
                        <div className="border-4 border-slate-100 rounded-2xl overflow-hidden shadow-inner relative aspect-video bg-slate-100">
                            <div className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 z-10 rounded-md shadow-sm">EVIDENCE</div>
                            {/* Assuming we serve from /evidence or similar, but simplified here to point to api or just placeholder if local file system access is specific */}
                            <img
                                src={`/api/screenshots/${audit.evidencePngPath.split('/').pop()}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                alt="Friction Evidence"
                            />
                        </div>
                    ) : (
                        <div className="h-full min-h-[160px] bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
                            <Activity size={24} className="opacity-20" />
                            Evidence Pending
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CompetitorTable({ benchmark }: { benchmark: any }) {
    if (!benchmark) return null;

    let comps = [];
    let stats: any = {};
    try {
        comps = JSON.parse(benchmark.competitors || '[]');
        stats = JSON.parse(benchmark.stats || '{}');
    } catch (e) { }

    return (
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="p-2 bg-orange-50 text-orange-600 rounded-xl"><Globe size={20} /></span>
                Competitive Landscape
            </h3>

            <div className="flex gap-4 mb-6">
                <Badge variant={stats.ratingPercentile > 50 ? 'warning' : 'success'}>
                    Top {stats.ratingPercentile}% by Rating
                </Badge>
                <div className="text-xs font-bold text-slate-500 flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-full">
                    <MapPin size={12} /> {stats.density} Competitors Nearby
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-[10px] uppercase bg-slate-50 text-slate-500 font-bold tracking-wider">
                        <tr>
                            <th className="px-4 py-3">Competitor</th>
                            <th className="px-4 py-3">Rating</th>
                            <th className="px-4 py-3">Reviews</th>
                            <th className="px-4 py-3 text-right">Distance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {comps.slice(0, 5).map((c: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3 font-bold text-slate-800">{c.name}</td>
                                <td className="px-4 py-3 text-orange-500 font-bold flex items-center gap-1">
                                    <Star size={12} fill="currentColor" /> {c.rating?.toFixed(1)}
                                </td>
                                <td className="px-4 py-3 text-slate-500">{c.reviews}</td>
                                <td className="px-4 py-3 text-right text-slate-400">{c.distance?.toFixed(1)} km</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


function RecommendationEngine({ flow }: { flow: any }) {
    if (!flow) return null;

    const colors = {
        'GBP_CONVERSION': 'from-blue-600 to-indigo-600 text-white',
        'LEAD_CAPTURE': 'from-orange-500 to-rose-600 text-white',
        'SCALE': 'from-emerald-500 to-teal-600 text-white'
    };

    const titles = {
        'GBP_CONVERSION': 'Trust & Visibility Pack',
        'LEAD_CAPTURE': 'Lead Capture System',
        'SCALE': 'Growth & Scale Engine'
    };

    let reasons: string[] = [];
    let actions: string[] = [];
    try {
        reasons = JSON.parse(flow.reasons || '[]');
        actions = JSON.parse(flow.actions || '[]');
    } catch (e) { }

    const bgGradient = colors[flow.offerType as keyof typeof colors] || colors['SCALE'];

    return (
        <div className={`rounded-[2rem] p-1 bg-gradient-to-br ${bgGradient} shadow-xl shadow-indigo-200/50 relative overflow-hidden h-full group`}>
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="bg-white/95 backdrop-blur-sm rounded-[1.9rem] p-8 h-full flex flex-col relative z-10 transition-transform duration-500">
                <div className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg w-fit mb-4 flex items-center gap-2 shadow-lg shadow-slate-900/20">
                    <Sparkles className="text-yellow-400 w-3 h-3" /> Recommended Strategy
                </div>

                <h2 className="text-2xl font-black text-slate-900 mb-6 leading-tight">{titles[flow.offerType as keyof typeof titles]}</h2>

                <div className="flex gap-4 mb-8">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Vis Score</span>
                        <span className="text-xl font-bold text-slate-900">{flow.visibilityScore}</span>
                    </div>
                    <div className="w-px bg-slate-100"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Conv Score</span>
                        <span className="text-xl font-bold text-slate-900">{flow.conversionScore}</span>
                    </div>
                    <div className="w-px bg-slate-100"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Ops Score</span>
                        <span className="text-xl font-bold text-slate-900">{flow.opsScore}</span>
                    </div>
                </div>

                <div className="space-y-6 flex-grow">
                    <div>
                        <h4 className="text-xs font-black uppercase text-indigo-500 mb-3 tracking-wide">Analysis</h4>
                        <ul className="space-y-2">
                            {reasons.map((r: string, i: number) => (
                                <li key={i} className="text-sm text-slate-600 flex items-start gap-2.5">
                                    <AlertCircle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                    <span className="leading-snug">{r}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                        <h4 className="text-xs font-black uppercase text-emerald-600 mb-3 tracking-wide">The Fix (7 Days)</h4>
                        <ul className="space-y-2">
                            {actions.map((a: string, i: number) => (
                                <li key={i} className="text-sm font-bold text-slate-700 flex items-start gap-2.5">
                                    <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                    <span className="leading-snug">{a}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default async function OpportunityDetailsPage({ params }: { params: { slug: string } }) {
    // Determine if it's an ID or Slug is handled by the action now
    const opportunity = await getOpportunityDetails(params.slug);

    if (!opportunity) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h1 className="text-xl font-bold text-slate-900">Opportunity Not Found</h1>
                <Link href="/opportunities" className="text-indigo-600 hover:underline mt-4 block">Back to Workbench</Link>
            </div>
        </div>
    );

    const verdict = (opportunity as any).llmVerdicts?.[0];
    const uxAudit = (opportunity as any).uxAudits?.[0];
    const competitorBenchmark = (opportunity as any).competitorBenchmarks?.[0];
    const recommendation = (opportunity as any).opsRecommendations?.[0];
    const scoreData = (opportunity as any).opportunities?.[0];
    const reviews = (opportunity as any).reviews || [];

    // Helper for parsing JSON safely
    const parse = (json: string | null) => {
        try { return json ? JSON.parse(json) : {}; } catch { return {}; }
    };

    const googleMapsUrl = opportunity.googleMapsUrl || (opportunity.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(opportunity.address)}` : '#');

    return (
        <div className="bg-slate-50 min-h-screen pb-20 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Nav Header */}
            <header className="bg-white border-b border-slate-100 py-4 px-6 md:px-8 sticky top-0 z-50 flex justify-between items-center shadow-sm/50 backdrop-blur-md bg-white/80">
                <Link href="/opportunities" className="text-sm font-bold text-slate-500 flex items-center gap-2 hover:text-indigo-600 transition-colors group">
                    <span className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-indigo-50 transition-colors"><ArrowRight className="rotate-180" size={14} /></span>
                    Back to Workbench
                </Link>
                <div className="flex items-center gap-4">
                    <div className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-full">
                        ID: {(opportunity as any).slug || opportunity.id.slice(0, 8)}
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-6xl p-6 md:p-8 space-y-10">

                {/* HERO SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Activity size={120} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex flex-wrap items-center gap-3 mb-8">
                                <StatusPicker id={opportunity.id} currentStatus={(opportunity as any).status || 'NEW'} />
                                {scoreData?.value && (
                                    <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-green-100 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                        Value: {scoreData.value}
                                    </span>
                                )}
                                {opportunity.websiteUrl ? (
                                    <a href={opportunity.websiteUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors flex items-center gap-1">
                                        <ExternalLink size={12} /> Website
                                    </a>
                                ) : (
                                    <span className="px-3 py-1 bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-100">No Website</span>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
                                {opportunity.name}
                            </h1>

                            <div className="flex flex-col md:flex-row gap-6 text-sm text-slate-500 font-medium">
                                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:text-indigo-600 transition-colors group/link max-w-md">
                                    <MapPin size={18} className="text-indigo-500 mt-0.5 group-hover/link:scale-110 transition-transform" />
                                    <span className="leading-relaxed border-b border-transparent group-hover/link:border-indigo-200">{opportunity.address || 'Address not available'}</span>
                                </a>
                                {opportunity.phone && (
                                    <a href={`tel:${opportunity.phone}`} className="flex items-center gap-2 hover:text-indigo-600 transition-colors group/link">
                                        <Phone size={18} className="text-indigo-500 group-hover/link:scale-110 transition-transform" />
                                        {opportunity.phone}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 h-full">
                        {recommendation ? (
                            <RecommendationEngine flow={recommendation} />
                        ) : (
                            <div className="h-full min-h-[300px] bg-slate-100 rounded-[2rem] border border-slate-200 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-slate-50 opacity-50 patterned-grid"></div>
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-400">
                                        <Activity size={32} />
                                    </div>
                                    <div className="font-bold text-slate-600 text-lg">Analysis Pending</div>
                                    <p className="text-sm text-slate-400 mt-2 max-w-[200px] mx-auto">Run the analyzer worker to generate a strategy</p>

                                    <RunAnalysisButton placeId={opportunity.id} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* MAIN CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                    {/* LEFT COLUMN: DATA & AUDITS */}
                    <div className="space-y-8">
                        {uxAudit ? (
                            <UxFrictionAudit audit={uxAudit} />
                        ) : (
                            <div className="p-10 border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[2rem] text-center text-slate-400 flex flex-col items-center justify-center">
                                <Activity size={32} className="mb-3 opacity-20" />
                                <span className="font-medium">No UX Audit Data</span>
                            </div>
                        )}

                        {competitorBenchmark ? (
                            <CompetitorTable benchmark={competitorBenchmark} />
                        ) : (
                            <div className="p-10 border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[2rem] text-center text-slate-400 flex flex-col items-center justify-center">
                                <Globe size={32} className="mb-3 opacity-20" />
                                <span className="font-medium">No Competitor Data</span>
                            </div>
                        )}
                        <ReviewsList reviews={reviews} />
                    </div>

                    {/* RIGHT COLUMN: ACTION & NOTES */}
                    <div className="space-y-8 lg:sticky lg:top-28">
                        <div className="bg-white rounded-[2rem] p-1 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <OutreachGenerator
                                placeName={opportunity.name}
                                offerAngle={verdict?.offerAngle || recommendation?.offerType || 'Growth'}
                                reasons={recommendation ? parse(recommendation.reasons) : []}
                            />
                        </div>

                        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                    Internal Notes
                                </h3>
                            </div>
                            <div className="p-2">
                                <OpportunityNotes id={opportunity.id} notes={(opportunity as any).notes || []} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
