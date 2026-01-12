'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface OutreachProps {
    placeName: string;
    offerAngle?: string;
    reasons?: string[];
}

export function OutreachGenerator({ placeName, offerAngle, reasons = [] }: OutreachProps) {
    const [platform, setPlatform] = useState<'whatsapp' | 'email' | 'instagram'>('whatsapp');
    const [copied, setCopied] = useState(false);

    const problem = reasons[0] || "website availability";

    // Mapping Angle to copy
    const angleMap: Record<string, string> = {
        'website_redesign': "modernize your website for more bookings",
        'landing_page': "create a high-converting landing page",
        'booking_whatsapp': "streamline your bookings directly from WhatsApp",
        'seo_basics': "improve your Google visibility",
        'unknown': "boost your digital presence"
    };

    const benefit = angleMap[offerAngle || 'unknown'] || angleMap['unknown'];

    const templates = {
        whatsapp: `Hi ${placeName}, just saw your business on Google. noticed you could really ${benefit}. We build simple systems for RM800 setup. Open to chat?`,
        instagram: `Hey team @ ${placeName} 👋 Love the reviews! Noticed a small issue with your ${problem} though. We help local biz fix this for just RM80/mo. DM if interested!`,
        email: `Subject: Quick question for ${placeName}\n\nHi,\n\nI'm a local developer and saw your listing. You have great reviews, but your ${problem} might be losing you customers.\n\nWe specialize in helping businesses ${benefit}.\n\nOur Pricing:\n- Setup: RM 800 - 2000\n- Maintenance: RM 80 - 250/mo\n\nNo lock-in contracts. Would you be open to a 5-min demo?\n\nBest,\n[Your Name]`
    };

    const message = templates[platform];

    const copyToClipboard = () => {
        navigator.clipboard.writeText(message);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-semibold mb-3">Outreach Message</h3>

            <div className="flex gap-2 mb-4">
                {(['whatsapp', 'email', 'instagram'] as const).map(p => (
                    <button
                        key={p}
                        onClick={() => setPlatform(p)}
                        className={`px-3 py-1 rounded text-sm capitalize ${platform === p ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        {p}
                    </button>
                ))}
            </div>

            <textarea
                className="w-full h-32 p-2 border rounded mb-2 text-sm"
                value={message}
                readOnly
            />

            <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 text-sm"
            >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy to Clipboard"}
            </button>
        </div>
    );
}
