'use client';
import { OutreachGenerator } from '../../../components/OutreachGenerator';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '../../../components/ui/Badge';
import { StatusPicker } from '../../../components/StatusPicker';
import { LeadNotes } from '../../../components/LeadNotes';
import { getLeadDetails } from '../../../actions/leads';
import { useState } from 'react';

// Client component wrapper for interactivity
function MockMicroSite({ name, phone }: { name: string, phone: string }) {
    return (
        <div className="mx-auto w-[280px] bg-white rounded-[2rem] overflow-hidden border-[8px] border-slate-900 shadow-2xl relative transform hover:scale-105 transition-transform duration-500">
            <div className="bg-indigo-600 p-6 text-center pt-8 pb-6">
                <h3 className="text-white font-bold text-lg leading-tight mb-2">{name}</h3>
                <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map(i => <span key={i} className="text-yellow-400 text-xs">★</span>)}
                </div>
            </div>
            <div className="p-4 space-y-4 bg-slate-50 h-[260px]">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-center">
                    <p className="text-xs font-bold text-slate-700 mb-2">Need a quick quote?</p>
                    <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs">
                        <span>WhatsApp Us</span>
                    </button>
                    <p className="text-[9px] text-slate-400 mt-1">Replies in ~5 mins</p>
                </div>
                <button className="w-full bg-slate-900 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 text-xs">
                    Call No: {phone || "012-345 6789"}
                </button>
                <div className="grid grid-cols-3 gap-1 mt-2">
                    {[1, 2, 3].map(i => <div key={i} className="aspect-square bg-slate-200 rounded-lg animate-pulse"></div>)}
                </div>
            </div>
            {/* Fake Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-5 bg-slate-900 rounded-b-lg"></div>
        </div>
    );
}

function ScreenshotViewer({ mobile, desktop, lead }: { mobile: any, desktop: any, lead: any }) {
    const [view, setView] = useState<'mobile' | 'desktop'>('mobile');
    const hasWebsite = lead.websiteUrl && !lead.websiteUrl.includes('facebook') && !lead.websiteUrl.includes('instagram');

    if (!mobile && !desktop && !hasWebsite) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                        ✨ Proposed Solution
                    </div>
                    <Badge variant="info">Mockup</Badge>
                </div>
                <div className="group relative flex justify-center py-6">
                    <MockMicroSite name={lead.name} phone={lead.phone} />
                    <div className="absolute bottom-10 right-0 bg-white/90 backdrop-blur text-slate-800 p-4 rounded-xl shadow-xl border border-indigo-100 max-w-[180px] hidden md:block">
                        <p className="text-xs font-bold text-indigo-600">"Missed calls cost you money. This simple page captures leads 24/7."</p>
                    </div>
                </div>
            </div>
        );
    }

    const activeShot = view === 'mobile' ? mobile : desktop;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    {view === 'mobile' ? '📱 Mobile Experience' : '💻 Desktop Experience'}
                </div>
                <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                    <button
                        onClick={() => setView('mobile')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${view === 'mobile' ? 'bg-indigo-600 shadow-sm text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Mobile
                    </button>
                    <button
                        onClick={() => setView('desktop')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${view === 'desktop' ? 'bg-indigo-600 shadow-sm text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Desktop
                    </button>
                </div>
            </div>

            <div className="group relative transition-all duration-500">
                <div className={`
                    border-[8px] border-slate-800 overflow-hidden shadow-2xl mx-auto md:mx-0 transition-all duration-500 bg-slate-900
                    ${view === 'mobile' ? 'w-[280px] rounded-[2.5rem]' : 'w-full rounded-xl'}
                `}>
                    {activeShot ? (
                        <img
                            src={`/api/screenshots/${activeShot.pngPath.split('screenshots/')[1]}`}
                            alt={`${view} Proof`}
                            className="w-full h-auto opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                    ) : (
                        <div className="bg-slate-900 h-64 flex items-center justify-center text-slate-500 font-bold italic text-sm">
                            No {view} screenshot captured.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default async function LeadDetailsPage({ params }: { params: { id: string } }) {
    const lead = await getLeadDetails(params.id);

    if (!lead) return <div className="p-20 text-center font-bold text-white">Lead Not Found</div>;

    const verdict = (lead as any).llmVerdicts?.[0];
    const mobileAudit = (lead as any).psiAudits?.find((a: any) => a.strategy === 'mobile');
    const screenshots = (lead as any).screenshots || [];
    const mobileScreenshot = screenshots.find((s: any) => s.viewport === 'mobile');
    const desktopScreenshot = screenshots.find((s: any) => s.viewport === 'desktop');

    // Parse Socials
    let socials: any = {};
    try {
        if ((lead as any).socials) {
            socials = JSON.parse((lead as any).socials);
        }
    } catch (e) { }

    let reasons: string[] = [];
    try {
        if (verdict?.reasons) {
            reasons = JSON.parse(verdict.reasons);
        }
    } catch (e) { }


    // Logic for Health Indicators
    const getHealthIndicator = (label: string, val: number | null | undefined) => {
        let variant: 'success' | 'warning' | 'error' | 'neutral' = 'neutral';
        let statusText = 'N/A';
        let scoreColor = 'text-slate-500';

        if (val !== null && val !== undefined) {
            statusText = val.toString();
            if (val >= 90) { variant = 'success'; statusText = 'Excellent'; scoreColor = 'text-emerald-400'; }
            else if (val >= 50) { variant = 'warning'; statusText = 'Needs Focus'; scoreColor = 'text-amber-400'; }
            else { variant = 'error'; statusText = 'Urgent Gaps'; scoreColor = 'text-rose-400'; }
        }

        return (
            <div className="flex flex-col items-center gap-1.5 p-4 bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 shadow-sm w-full">
                <span className={`text-3xl font-black ${scoreColor}`}>{val ?? '-'}</span>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
            </div>
        );
    };

    return (
        <div className="bg-slate-950 min-h-screen pb-20 text-slate-200 selection:bg-indigo-500 selection:text-white font-sans">

            {/* Nav Header */}
            <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 py-4 px-8 sticky top-0 z-50 flex justify-between items-center">
                <Link href="/leads" className="text-sm font-bold text-slate-400 flex items-center gap-2 hover:text-white transition-colors group">
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Workbench
                </Link>
                <div className="flex items-center gap-6">
                    <div className="flex gap-4 mr-4 border-r border-slate-800 pr-6">
                        {socials.facebook && <a href={socials.facebook} target="_blank" className="text-slate-500 hover:text-[#1877F2] transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" /></svg></a>}
                        {socials.instagram && <a href={socials.instagram} target="_blank" className="text-slate-500 hover:text-[#E4405F] transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.25-1.69 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.25-.15-4.77-1.69-4.92-4.92-.06-1.27-.07-1.65-.07-4.85 0-3.2.01-3.58.07-4.85.15-3.25 1.69-4.77 4.92-4.92 1.27-.06 1.65-.07 4.85-.07m0-2.16c-3.26 0-3.67.01-4.95.07-4.35.2-6.78 2.62-6.98 6.98-.06 1.28-.07 1.69-.07 4.95 0 3.26.01 3.67.07 4.95.2 4.35 2.62 6.78 6.98 6.98 1.28.06 1.69.07 4.95.07 3.26 0 3.67-.01 4.95-.07 4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95 0-3.26-.01-3.67-.07-4.95-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0z" /><path d="M12 5.84c-3.4 0-6.16 2.76-6.16 6.16s2.76 6.16 6.16 6.16 6.16-2.76 6.16-6.16-2.76-6.16-6.16-6.16m0 10.16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4m6.4-11.8c0 .79-.64 1.44-1.44 1.44-.79 0-1.44-.64-1.44-1.44 0-.79.64-1.44 1.44-1.44.79 0 1.44.64 1.44 1.44z" /></svg></a>}
                        {socials.linkedin && <a href={socials.linkedin} target="_blank" className="text-slate-500 hover:text-[#0A66C2] transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg></a>}
                    </div>
                    <Badge variant="info" className="scale-105 shadow-glow">Sales Brief</Badge>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        ID: {lead.id.slice(0, 8)}
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-6xl p-6 space-y-8 mt-4">

                {/* SECTION 1 — Business Strategy Snapshot */}
                <div className="bg-slate-900 rounded-[2rem] p-8 md:p-10 shadow-2xl border border-slate-800 flex flex-wrap lg:flex-nowrap justify-between items-start gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

                    <div className="flex-1 min-w-[300px] relative z-10">
                        <StatusPicker id={lead.id} currentStatus={(lead as any).status || 'NEW'} />
                        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-tight my-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            {lead.name}
                        </h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">HQ Location</label>
                                <p className="text-slate-300 font-medium text-lg leading-relaxed">{lead.address}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Direct Line</label>
                                <p className="text-white font-bold text-lg font-mono tracking-wide">
                                    {lead.phone || "No contact line found"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 min-w-[220px] relative z-10 w-full lg:w-auto">
                        <a href={lead.googleMapsUrl || "#"} target="_blank" className="w-full bg-slate-800 text-slate-200 border border-slate-700 px-6 py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-slate-700 hover:text-white transition-all hover:scale-105 active:scale-95">
                            <span>🗺️</span> View on G-Maps
                        </a>
                        {lead.websiteUrl && (
                            <a href={lead.websiteUrl} target="_blank" className="w-full bg-slate-800 text-slate-200 border border-slate-700 px-6 py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-slate-700 hover:text-white transition-all hover:scale-105 active:scale-95">
                                <span>🌐</span> Verify Live Site
                            </a>
                        )}
                        <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                            <div className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">AI Verdict</div>
                            <p className="text-xs font-medium text-indigo-200 leading-relaxed">
                                High potential target. Digital presence gaps indicate strong upsell opportunity.
                            </p>
                        </div>
                    </div>
                </div>

                {/* SECTION 2 — Strategic Growth Anchor */}
                <div className="bg-indigo-600 rounded-[2rem] p-8 md:p-12 text-white shadow-2xl shadow-indigo-900/50 relative overflow-hidden group">
                    <div className="absolute -top-20 -right-20 p-10 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
                        <span className="text-[15rem] font-black tracking-tighter italic whitespace-nowrap">GROWTH</span>
                    </div>
                    <div className="relative z-10 max-w-4xl">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="bg-white/20 backdrop-blur px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Strategy Anchor</span>
                            <span className="bg-indigo-500 border border-indigo-400 px-2 py-0.5 rounded text-[10px] font-bold">HIGH CONFIDENCE</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black mb-10 leading-tight">
                            "{(lead as any).primaryProblem || "This business has critical digital gaps limiting their local market share."}"
                        </h2>

                        <div className="space-y-6">
                            <label className="text-xs font-black uppercase tracking-widest text-indigo-200 flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-indigo-400"></span>
                                Key Growth Barriers
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {reasons.length > 0 ? reasons.slice(0, 4).map((r, i) => (
                                    <div key={i} className="bg-indigo-900/30 backdrop-blur-md p-5 rounded-2xl border border-indigo-500/30 flex gap-4 items-start hover:bg-indigo-900/50 transition-colors">
                                        <div className="bg-white/20 h-6 w-6 shrink-0 rounded-full flex items-center justify-center font-black text-[10px] mt-0.5">{i + 1}</div>
                                        <p className="font-bold text-base leading-snug">{r}</p>
                                    </div>
                                )) : (
                                    <div className="bg-indigo-900/30 backdrop-blur-md p-5 rounded-2xl border border-indigo-500/30 flex gap-4 items-center">
                                        <div className="bg-white/20 h-6 w-6 shrink-0 rounded-full flex items-center justify-center font-black text-[10px]">!</div>
                                        <p className="font-bold text-base leading-snug">Manual review recommended for specific local competition gap.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* SECTION 3 — Performance Intelligence */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-xl">
                            <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                                <span className="p-2 bg-slate-800 rounded-xl border border-slate-700">📊</span> Digital Health Summary
                            </h3>

                            <div className="grid grid-cols-3 gap-4 mb-10">
                                {getHealthIndicator('Speed', mobileAudit?.performance)}
                                {getHealthIndicator('Visibility', mobileAudit?.seo)}
                                {getHealthIndicator('Experience', mobileAudit?.accessibility)}
                            </div>

                            <div className="space-y-10">
                                <ScreenshotViewer mobile={mobileScreenshot} desktop={desktopScreenshot} lead={lead} />
                            </div>
                        </div>

                        {/* Reviews Section - NEW */}
                        <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-xl">
                            <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                                <span className="p-2 bg-slate-800 rounded-xl border border-slate-700">🗣️</span> Customer Voice
                            </h3>

                            {(lead as any).reviews && (lead as any).reviews.length > 0 ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(lead as any).reviews.map((review: any) => {
                                            let reviewImages: string[] = [];
                                            try {
                                                if (review.images) {
                                                    reviewImages = JSON.parse(review.images);
                                                }
                                            } catch (e) { }

                                            return (
                                                <div key={review.id} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="font-bold text-slate-200">{review.authorName}</div>
                                                        <div className="flex items-center gap-1 text-yellow-400">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={i < review.rating ? "currentColor" : "none"} stroke="currentColor" className="w-4 h-4">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.545.044.75.77.38 1.141l-4.244 4.243a.563.563 0 00-.15.53l.825 4.793a.562.562 0 01-.85.679l-4.11-2.426a.563.563 0 00-.518 0l-4.11 2.426a.562.562 0 01-.85-.679l.825-4.793a.563.563 0 00-.15-.53L3.74 10.088c-.37-.37.165-1.097.71-1.141l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                                                </svg>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-slate-400 italic mb-4 leading-relaxed">"{review.text}"</p>

                                                    {reviewImages.length > 0 && (
                                                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                                                            {reviewImages.map((img, idx) => (
                                                                <div key={idx} className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border border-slate-600">
                                                                    <img src={img} alt="Review" className="object-cover w-full h-full" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="text-[10px] font-black uppercase text-slate-600 tracking-widest">{review.publishTime}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                                    <span className="text-4xl mb-4 block">😶</span>
                                    <p className="text-slate-500 font-medium">No reviews analyzed for this lead yet.</p>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Right Column: Roadmap & Outreach */}
                    <div className="space-y-8 sticky top-24">
                        {/* Modernization Roadmap */}
                        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <Badge variant="info" className="uppercase tracking-widest mb-4">Strategic Roadmap</Badge>
                                <h3 className="text-3xl font-black text-white leading-tight mb-6">
                                    {verdict?.offerAngle?.replace(/_/g, ' ') || 'Digital Experience Overhaul'}
                                </h3>
                                <div className="space-y-3 mb-8">
                                    {['High-Speed Delivery', 'Mobile-First Design', 'SEO Foundation', 'Auto-Booking Ready'].map(feat => (
                                        <div key={feat} className="text-xs font-bold text-slate-300 bg-slate-800/50 border border-slate-700 px-4 py-3 rounded-xl flex items-center gap-3">
                                            <span className="text-emerald-400">✔</span> {feat}
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl text-center shadow-lg">
                                    <label className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1 block">Setup Investment</label>
                                    <div className="text-3xl font-black text-white tracking-tight">RM 1.2k - 2.5k</div>
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <label className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1 block">Monthly Management</label>
                                        <div className="text-xl font-black text-white">RM 150<span className="text-xs text-white/60 ml-1">/mo</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 5 — Outreach */}
                        <div>
                            <OutreachGenerator
                                placeName={lead.name}
                                offerAngle={verdict?.offerAngle || 'unknown'}
                                reasons={reasons}
                            />
                        </div>

                        <LeadNotes id={lead.id} notes={(lead as any).leadNotes || []} />
                    </div>
                </div>
            </div>
        </div>
    );
}
