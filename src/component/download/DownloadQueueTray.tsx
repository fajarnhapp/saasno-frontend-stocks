'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Clock, Download, FileSpreadsheet, FileText, Loader2, Trash2, X } from 'lucide-react';
import { useDownloadQueue } from '@/context/DownloadQueueContext';
import { downloadFileUrl } from '@/service/downloadService';
import { formatTimeAgo } from '@/utils/formatterUtils';
import { DownloadJob } from '@/type/download';

const TYPE_LABELS: Record<string, string> = {
    USER_EXPORT: 'User Data',
    ROLE_EXPORT: 'Role Data',
    MENU_EXPORT: 'Menu Data',
    API_EXPORT: 'API Data',
    LOG_EXPORT: 'Audit Log',
};

export default function DownloadQueueTray() {
    const { jobs, dismiss, clearAll } = useDownloadQueue();
    // Defaultnya tertutup (hanya strip judul) supaya tidak menutupi kontrol lain yang juga
    // sering ada di pojok kanan bawah (mis. dropdown limit pagination) — mirip Google Drive,
    // yang juga berupa bar tipis dan baru melebar saat diklik.
    const [collapsed, setCollapsed] = useState(true);

    if (jobs.length === 0) {
        return null;
    }

    const activeCount = jobs.filter((job) => job.status === 'QUEUED' || job.status === 'PROCESSING').length;

    return (
        <div className="fixed bottom-4 right-4 z-[45] w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
            <button
                type="button"
                onClick={() => setCollapsed((v) => !v)}
                className="flex w-full items-center justify-between gap-2 bg-gray-50 px-4 py-3 text-left cursor-pointer hover:bg-gray-100 transition"
            >
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <Download size={16} className="text-brand-600" />
                    Download
                    {activeCount > 0 && (
                        <span className="inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                            {activeCount} running
                        </span>
                    )}
                </span>
                {collapsed ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
            </button>

            {!collapsed && (
                <>
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                        {jobs.map((job) => (
                            <DownloadJobRow key={job.id} job={job} onDismiss={() => dismiss(job.id)} />
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={clearAll}
                        className="flex w-full items-center justify-center gap-1.5 border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                    >
                        <Trash2 size={13} /> Clear all
                    </button>
                </>
            )}
        </div>
    );
}

function DownloadJobRow({ job, onDismiss }: { job: DownloadJob; onDismiss: () => void }) {
    const label = TYPE_LABELS[job.type] || job.type;
    const FormatIcon = job.format === 'excel' ? FileSpreadsheet : FileText;

    return (
        <div className="flex items-start gap-3 px-4 py-3">
            <div className="mt-0.5 shrink-0">
                <FormatIcon size={18} className="text-gray-400" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800">{label}</p>
                <div className="mt-1 flex items-center gap-1.5 text-xs">
                    <StatusIndicator job={job} />
                </div>
                {job.status === 'FAILED' && job.errorMessage && (
                    <p className="mt-1 text-xs text-red-500">{job.errorMessage}</p>
                )}
            </div>
            <button
                type="button"
                onClick={onDismiss}
                className="shrink-0 text-gray-300 hover:text-gray-500 transition cursor-pointer"
                title="Remove from list"
            >
                <X size={14} />
            </button>
        </div>
    );
}

function StatusIndicator({ job }: { job: DownloadJob }) {
    switch (job.status) {
        case 'QUEUED':
            return (
                <span className="flex items-center gap-1 text-gray-400">
                    <Clock size={12} /> Waiting in queue
                </span>
            );
        case 'PROCESSING':
            return (
                <span className="flex items-center gap-1 text-brand-600">
                    <Loader2 size={12} className="animate-spin" /> Processing...
                </span>
            );
        case 'FAILED':
            return (
                <span className="flex items-center gap-1 text-red-500">
                    <AlertCircle size={12} /> Failed
                </span>
            );
        case 'DONE':
            return (
                <a
                    href={downloadFileUrl(job.id)}
                    className="flex items-center gap-1 font-medium text-green-600 hover:text-green-700 hover:underline"
                >
                    <CheckCircle2 size={12} /> Done — {formatTimeAgo(job.registered || '')}, download now
                </a>
            );
        default:
            return null;
    }
}
