import { OutreachGenerator } from '../../../components/OutreachGenerator';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '../../../components/ui/Badge';
import { StatusPicker } from '../../../components/StatusPicker';
import { LeadNotes } from '../../../components/LeadNotes';
import { getLeadDetails } from '../../../actions/leads';

export default async function LeadDetailsPage({ params }: { params: { id: string } }) {
    const lead = await getLeadDetails(params.id);

    if (!lead) return <div className="p-20 text-center font-bold">Lead Not Found</div>;

    const score = (lead as any).leadScores?.[0];
    const verdict = (lead as any).llmVerdicts?.[0];
    const mobileAudit = (lead as any).psiAudits?.find((a: any) => a.strategy === 'mobile');
    const screenshots = (lead as any).screenshots || [];
    const mobileScreenshot = screenshots.find((s: any) => s.viewport === 'mobile');
    const desktopScreenshot = screenshots.find((s: any) => s.viewport === 'desktop');

    let reasons: string[] = [];
    try {
        if (verdict?.reasons) {
            reasons = JSON.parse(verdict.reasons);
        }
    } catch (e) { }


    // Logic for Health Indicators
    const getHealthIndicator = (label: string, val: number | null | undefined) => {
        let variant: 'success' | 'warning' | 'error' | 'neutral' = 'neutral';
        let statusText = 'Not Analyzed';

        if (val !== null && val !== undefined) {
            if (val >= 90) { variant = 'success'; statusText = 'Excellent'; }
            else if (val >= 50) { variant = 'warning'; statusText = 'Needs Focus'; }
            else { variant = 'error'; statusText = 'Urgent Gaps'; }
        }

        return (
            <div className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm w-full">
                <Badge variant={variant} className="w-full justify-center py-1.5">{statusText}</Badge>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
            </div>
        );
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Nav Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 px-8 sticky top-0 z-50 flex justify-between items-center">
                <Link href="/leads" className="text-sm font-bold text-slate-900 flex items-center gap-2 hover:text-indigo-600 transition-colors">
                    ← Back to Workbench
                </Link>
                <div className="flex items-center gap-4">
                    <Badge variant="info" className="scale-110">Sales Brief</Badge>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Target Ref: {lead.id.slice(0, 8)}
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-5xl p-6 space-y-8 mt-4">

                {/* SECTION 1 — Business Strategy Snapshot */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-wrap justify-between items-center gap-8">
                    <div className="flex-1 min-w-[300px]">
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">{lead.name}</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Location</label>
                                <p className="text-slate-700 font-bold text-lg leading-relaxed">{lead.address}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Connect</label>
                                <p className="text-indigo-600 font-black text-lg">
                                    {lead.phone || "No contact line found"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 min-w-[200px]">
                        <StatusPicker id={lead.id} currentStatus={(lead as any).status || 'NEW'} />
                        <a href={lead.googleMapsUrl || "#"} target="_blank" className="w-full bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-bold flex justify-center items-center gap-2 hover:bg-slate-50 transition-all shadow-sm hover:-translate-y-1 active:translate-y-0">
                            View on G-Maps ↗
                        </a>
                        {lead.websiteUrl && (
                            <a href={lead.websiteUrl} target="_blank" className="w-full text-center py-4 text-slate-500 font-bold hover:text-indigo-600 transition-colors">
                                Verify Live Site ↗
                            </a>
                        )}
                    </div>
                </div>

                {/* SECTION 2 — Strategic Growth Anchor */}
                <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <span className="text-[12rem] font-black tracking-tighter italic whitespace-nowrap">GROWTH</span>
                    </div>
                    <div className="relative z-10 max-w-3xl">
                        <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block">Strategy Anchor</span>
                        <h2 className="text-4xl font-black mb-10 leading-tight">
                            "{(lead as any).primaryProblem || "This business has digital gaps that are limiting their local growth"}"
                        </h2>

                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest text-white/60">Key Growth Barriers</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {reasons.length > 0 ? reasons.slice(0, 4).map((r, i) => (
                                    <div key={i} className="bg-white/10 backdrop-blur-md p-5 rounded-[1.5rem] border border-white/20 flex gap-4 items-center">
                                        <div className="bg-white/20 h-8 w-8 shrink-0 rounded-full flex items-center justify-center font-black text-sm">{i + 1}</div>
                                        <p className="font-bold text-lg leading-snug">{r}</p>
                                    </div>
                                )) : (
                                    <div className="bg-white/10 backdrop-blur-md p-5 rounded-[1.5rem] border border-white/20 flex gap-4 items-center">
                                        <div className="bg-white/20 h-8 w-8 shrink-0 rounded-full flex items-center justify-center font-black text-sm">!</div>
                                        <p className="font-bold text-lg leading-snug">Manual review recommended for specific local competition gap.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">

                    {/* SECTION 3 — Performance Intelligence */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                <span className="p-2 bg-slate-100 rounded-xl">📊</span> Digital Health Summary
                            </h3>

                            <div className="grid grid-cols-3 gap-4 mb-10">
                                {getHealthIndicator('Speed', mobileAudit?.performance)}
                                {getHealthIndicator('Visibility', mobileAudit?.seo)}
                                {getHealthIndicator('Experience', mobileAudit?.accessibility)}
                            </div>

                            <div className="space-y-10">
                                {mobileScreenshot && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                📱 Current User Experience
                                            </div>
                                            <Badge variant="neutral">Mobile View</Badge>
                                        </div>
                                        <div className="group relative">
                                            <div className="border-[14px] border-slate-900 rounded-[3.5rem] overflow-hidden w-[320px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] mx-auto md:mx-0 transition-transform group-hover:scale-[1.02] duration-500">
                                                <img
                                                    src={`/api/screenshots/${mobileScreenshot.pngPath.split('screenshots/')[1]}`}
                                                    alt="Mobile Proof"
                                                    className="w-full h-auto"
                                                />
                                            </div>
                                            <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 max-w-[180px] hidden md:block">
                                                <p className="text-[10px] font-bold text-slate-500 italic">"This is how customers see your business on their phones today."</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SECTION 4 — Modernization Roadmap */}
                        <div className="bg-indigo-50 border border-indigo-100 rounded-[2.5rem] p-10 relative overflow-hidden">
                            <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between items-center">
                                <div className="space-y-6 text-center md:text-left flex-1">
                                    <Badge variant="info" className="uppercase tracking-widest scale-110 px-4 py-1.5 ml-1">Strategic Roadmap</Badge>
                                    <h3 className="text-4xl font-black text-slate-900 leading-tight">
                                        {verdict?.offerAngle?.replace(/_/g, ' ') || 'Digital Experience Overhaul'}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto md:mx-0">
                                        {['High-Speed Delivery', 'Mobile-First Design', 'SEO Foundation', 'Auto-Booking Ready'].map(feat => (
                                            <div key={feat} className="text-[10px] font-black text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl flex items-center gap-2">
                                                <span className="text-indigo-500">✔</span> {feat}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-indigo-100 text-center min-w-[240px] transform hover:scale-105 transition-transform">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Standard Investment</label>
                                    <div className="text-3xl font-black text-slate-900 tracking-tight">RM 800 - 2,000</div>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1">Single Setup Fee</p>
                                    <div className="mt-5 pt-5 border-t border-slate-100 italic">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Success Management</div>
                                        <div className="text-xl font-black text-indigo-600">RM 80 - 250<span className="text-xs text-slate-400 ml-1">/mo</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5 — Outreach */}
                    <div className="sticky top-24">
                        <OutreachGenerator
                            placeName={lead.name}
                            offerAngle={verdict?.offerAngle || 'unknown'}
                            reasons={reasons}
                        />
                    </div>
                </div>

                <LeadNotes id={lead.id} notes={(lead as any).leadNotes || []} />
            </div>
        </div>
    );
}
