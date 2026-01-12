'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, XCircle, Info, LucideIcon } from 'lucide-react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    icon?: LucideIcon;
    className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    error: 'bg-rose-50 text-rose-700 border-rose-100',
    info: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    neutral: 'bg-slate-50 text-slate-700 border-slate-100',
};

const defaultIcons: Partial<Record<BadgeVariant, LucideIcon>> = {
    success: CheckCircle2,
    warning: AlertCircle,
    error: XCircle,
    info: Info,
};

export function Badge({ children, variant = 'neutral', icon, className = '' }: BadgeProps) {
    const Icon = icon || defaultIcons[variant];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border leading-none transition-all ${variantStyles[variant]} ${className}`}>
            {Icon && <Icon size={12} strokeWidth={2.5} />}
            {children}
        </span>
    );
}
