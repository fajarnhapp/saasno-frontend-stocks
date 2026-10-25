'use client';

import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast, Toast, ToastType } from '@/context/ToastContext';

const CONFIG: Record<ToastType, { icon: React.ReactNode; bar: string; bg: string; text: string }> = {
    success: {
        icon: <CheckCircle className="w-4 h-4 shrink-0 text-green-600" />,
        bar: 'bg-green-500',
        bg: 'bg-white border-green-200',
        text: 'text-gray-800',
    },
    error: {
        icon: <XCircle className="w-4 h-4 shrink-0 text-red-600" />,
        bar: 'bg-red-500',
        bg: 'bg-white border-red-200',
        text: 'text-gray-800',
    },
    warning: {
        icon: <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />,
        bar: 'bg-amber-400',
        bg: 'bg-white border-amber-200',
        text: 'text-gray-800',
    },
    info: {
        icon: <Info className="w-4 h-4 shrink-0 text-blue-500" />,
        bar: 'bg-blue-500',
        bg: 'bg-white border-blue-200',
        text: 'text-gray-800',
    },
};

function ToastItem({ toast }: { toast: Toast }) {
    const { dismissToast } = useToast();
    const cfg = CONFIG[toast.type];

    return (
        <div
            className={`relative flex items-start gap-3 rounded-xl border shadow-lg px-4 py-3 min-w-[280px] max-w-sm overflow-hidden animate-in slide-in-from-right-4 fade-in duration-300 ${cfg.bg}`}
        >
            {/* left color bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${cfg.bar}`} />

            <div className="ml-1 mt-0.5">{cfg.icon}</div>

            <p className={`flex-1 text-sm leading-snug ${cfg.text}`}>{toast.message}</p>

            <button
                onClick={() => dismissToast(toast.id)}
                className="ml-1 mt-0.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

export default function ToastContainer() {
    const { toasts } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-2 items-end pointer-events-none">
            {toasts.map(t => (
                <div key={t.id} className="pointer-events-auto">
                    <ToastItem toast={t} />
                </div>
            ))}
        </div>
    );
}
