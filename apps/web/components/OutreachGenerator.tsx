'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useToast } from './ui/Toast';

interface OutreachProps {
    placeName: string;
    offerAngle?: string;
    reasons?: string[];
}

export function OutreachGenerator({ placeName, offerAngle, reasons = [] }: OutreachProps) {
    const { toast } = useToast();
    const [platform, setPlatform] = useState<'whatsapp' | 'email' | 'instagram'>('whatsapp');
    const [messages, setMessages] = useState<Record<string, string>>({});
    const [copied, setCopied] = useState(false);

    const problem = reasons[0] || "online visibility";

    // Mapping Angle to copy
    const angleMap: Record<string, string> = {
        'website_redesign': "modernize your website for more mobile bookings",
        'landing_page': "create a high-converting landing page to capture more inquiries",
        'booking_whatsapp': "streamline your bookings directly with an automated WhatsApp system",
        'seo_basics': "improve your Google Search ranking to find more local customers",
        'unknown': "boost your business digital presence professionally"
    };

    const benefit = angleMap[offerAngle || 'unknown'] || angleMap['unknown'];

    // Initial templates
    const initialTemplates = {
        whatsapp: `Hi ${placeName}! Just saw your business on Google. You have great reviews! 🌟 I noticed a small issue with your ${problem} though. We build simple systems to fix this and ${benefit}. Setup is just RM800. Open to a quick chat?`,
        instagram: `Hey team @ ${placeName} 👋 Love your content! Noticed a small issue with your ${problem} on your bio link. We help local businesses fix this for just RM80/mo. DM if interested!`,
        email: `Subject: Helping ${placeName} with ${problem}\n\nHi,\n\nI'm a local developer and saw your listing. You have excellent reviews, but I noticed your ${problem} might be causing you to lose potential customers.\n\nWe specialize in helping businesses like yours ${benefit}.\n\nOur Pricing:\n- Setup: RM 800 - 2,000\n- Maintenance: RM 80 - 250/mo\n\nNo lock-in contracts. Would you be open to a 5-minute demo?\n\nBest,\n[Your Name]`
    };

    // Lazy init messages
    const currentMessage = messages[platform] !== undefined ? messages[platform] : initialTemplates[platform];

    const copyToClipboard = () => {
        navigator.clipboard.writeText(currentMessage);
        setCopied(true);
        toast(`Copied to clipboard for ${platform}`, 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                🚀 Ready-to-Send Outreach
            </h3>

            <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                {(['whatsapp', 'email', 'instagram'] as const).map(p => (
                    <button
                        key={p}
                        onClick={() => setPlatform(p)}
                        className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${platform === p ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {p.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="relative">
                <textarea
                    className="w-full h-48 p-4 border border-gray-200 rounded-xl mb-4 text-sm leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={currentMessage}
                    onChange={(e) => setMessages({ ...messages, [platform]: e.target.value })}
                />
            </div>

            <button
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold transition-all"
            >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? "Copied!" : "One-Click Copy Message"}
            </button>
            <p className="text-[10px] text-gray-400 mt-3 text-center">
                Tip: Personalize the message for better response rates.
            </p>
        </div>
    );
}
