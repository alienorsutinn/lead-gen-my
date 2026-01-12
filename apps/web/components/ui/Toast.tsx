'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border transition-all animate-in fade-in slide-in-from-right-4 duration-300 ${t.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' :
                                t.type === 'error' ? 'bg-rose-600 text-white border-rose-500' :
                                    t.type === 'warning' ? 'bg-amber-500 text-white border-amber-400' :
                                        'bg-indigo-600 text-white border-indigo-500'
                            }`}
                    >
                        {t.type === 'success' && <CheckCircle2 size={18} />}
                        {t.type === 'error' && <XCircle size={18} />}
                        {t.type === 'warning' && <AlertTriangle size={18} />}
                        {t.type === 'info' && <Info size={18} />}
                        <span className="text-sm font-bold">{t.message}</span>
                        <button
                            onClick={() => removeToast(t.id)}
                            className="ml-2 hover:opacity-70 transition-opacity"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
