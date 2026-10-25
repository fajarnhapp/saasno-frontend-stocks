'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Download, Eraser, FileClock, Loader2, Trash2 } from 'lucide-react';
import ButtonComponent from '../ui/ButtonComponent';
import MaintenanceModeCard from './MaintenanceModeCard';
import { useCsrf } from '@/context/CsrfContext';
import { useModal } from '@/context/ModalContext';
import { CleanupType, purgeAllDownloads, readMaintenance, runCleanup } from '@/service/maintenanceService';
import { ResponseApi } from '@/type/common/ResponseApi';
import { CleanupResult, MaintenanceSummary } from '@/type/maintenance';
import { formatBytes } from '@/utils/byteUtils';
import { API_MSG_SUCCESS, handleResponseApi } from '@/utils/responseApiUtils';

const keep = (days: number): string => (days > 0 ? `kept ${days} day${days === 1 ? '' : 's'}` : 'kept forever');

interface CardAction {
    label: string;
    onClick: () => void;
    disabled: boolean;
    loading: boolean;
    title?: string;
}

function StatCard({ icon, label, value, note, action }: { icon: React.ReactNode; label: string; value: string; note: string; action: CardAction }) {
    return (
        <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">{icon}</div>
            <div className="text-2xl font-semibold text-gray-900">{value}</div>
            <div className="text-sm font-medium text-gray-700">{label}</div>
            <div className="mt-0.5 text-xs text-gray-400">{note}</div>
            {/* Pushed to the bottom, so the buttons line up whatever the length of the note above them. */}
            <div className="mt-auto pt-4">
                <button
                    type="button"
                    onClick={action.onClick}
                    disabled={action.disabled}
                    title={action.title}
                    className="inline-flex items-center justify-center gap-1.5 self-start rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:bg-transparent disabled:hover:text-gray-700"
                >
                    {action.loading ? <Loader2 size={12} className="animate-spin" /> : <Eraser size={12} />}
                    {action.label}
                </button>
            </div>
        </div>
    );
}

// Housekeeping: how much old data there is, a button to clean it now (the same cleanup runs by itself every night), and one to delete every download.
export default function MaintenanceComponent() {
    const { csrf, setCsrf } = useCsrf();
    const { showModal, showConfirm, contentModalError, contentModalSuccess } = useModal();
    const [summary, setSummary] = useState<MaintenanceSummary | null>(null);
    const [busy, setBusy] = useState<CleanupType | 'all' | 'purge' | null>(null);

    const load = useCallback(async () => {
        const res: Response = await readMaintenance(setCsrf);
        const data: ResponseApi<MaintenanceSummary> = await handleResponseApi(res);
        if (data.message === API_MSG_SUCCESS) {
            setSummary(data.data);
        }
    }, [setCsrf]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- loads the figures from the API when the page opens
        load();
    }, [load]);

    // What each cleanup removes, for the confirmation and for the result.
    const WHAT: Record<CleanupType, (m: MaintenanceSummary) => { title: string; text: string }> = {
        'downloads': (m) => ({ title: 'Clean up old downloads?', text: `Deletes downloads (and their files) older than ${m.downloadRetentionDays} day(s), for every user.` }),
        'audit-logs': (m) => ({ title: 'Clean up old audit log entries?', text: `Deletes audit log entries older than ${m.auditLogRetentionDays} day(s). This cannot be undone.` }),
        'notifications': (m) => ({ title: 'Clean up old notifications?', text: `Deletes read notifications older than ${m.notificationRetentionDays} day(s), and any notification older than a month.` }),
    };

    const describe = (r: CleanupResult, type?: CleanupType): string => {
        if (type === 'downloads') return `Removed ${r.downloads} download(s).`;
        if (type === 'audit-logs') return `Removed ${r.auditLogs} audit log entrie(s).`;
        if (type === 'notifications') return `Removed ${r.notifications} notification(s).`;
        return `Removed ${r.downloads} download(s), ${r.auditLogs} audit log entrie(s) and ${r.notifications} notification(s).`;
    };

    // One kind of data when a type is given, everything otherwise.
    const cleanup = (type?: CleanupType) => showConfirm(
        <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">{type && summary ? WHAT[type](summary).title : 'Clean up all old data now?'}</h3>
            <p className="text-sm text-gray-500">
                {type && summary
                    ? WHAT[type](summary).text
                    : 'Removes downloads, audit log entries and notifications older than their retention period. This is what runs every night.'}
            </p>
        </div>,
        async () => {
            setBusy(type ?? 'all');
            try {
                const res: Response = await runCleanup(csrf, setCsrf, type);
                const data: ResponseApi<CleanupResult> = await handleResponseApi(res);
                if (data.message !== API_MSG_SUCCESS) {
                    showModal(contentModalError(data.message || 'Cleanup failed'));
                    return;
                }
                showModal(contentModalSuccess(describe(data.data, type)));
                await load();
            } finally {
                setBusy(null);
            }
        },
        'Clean up',
        'Cancel',
    );

    const purge = () => showConfirm(
        <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">Delete all download jobs?</h3>
            <p className="text-sm text-gray-500">
                Deletes the downloads and files of <strong>every user</strong>, whatever their age. People will have to export again.
                This cannot be undone.
            </p>
        </div>,
        async () => {
            setBusy('purge');
            try {
                const res: Response = await purgeAllDownloads(csrf, setCsrf);
                const data: ResponseApi<number> = await handleResponseApi(res);
                if (data.message !== API_MSG_SUCCESS) {
                    showModal(contentModalError(data.message || 'Failed to delete the downloads'));
                    return;
                }
                showModal(contentModalSuccess(`Deleted ${data.data} download job(s).`));
                await load();
            } finally {
                setBusy(null);
            }
        },
        'Yes, delete all',
        'Cancel',
    );

    if (!summary) {
        return <div className="flex justify-center p-10"><Loader2 size={24} className="animate-spin text-brand-600" /></div>;
    }

    return (
        <div className="grid items-start gap-5 lg:grid-cols-2">
            {/* Left: what is stored, and the cleanups. */}
            <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard icon={<Download size={18} />} label="Download jobs" value={summary.downloadJobs.toLocaleString()}
                        note={`${formatBytes(summary.downloadBytes)} on disk, ${keep(summary.downloadRetentionDays)}`}
                        action={{ label: 'Clean up', onClick: () => cleanup('downloads'), disabled: busy !== null, loading: busy === 'downloads' }} />
                    <StatCard icon={<FileClock size={18} />} label="Audit log entries" value={summary.auditLogs.toLocaleString()}
                        note={keep(summary.auditLogRetentionDays)}
                        action={{
                            label: 'Clean up', onClick: () => cleanup('audit-logs'), loading: busy === 'audit-logs',
                            disabled: busy !== null || summary.auditLogRetentionDays <= 0,
                            title: summary.auditLogRetentionDays <= 0 ? 'Audit logs are kept forever. Set AUDIT_LOG_RETENTION_DAYS in Configuration first.' : undefined,
                        }} />
                    <StatCard icon={<Bell size={18} />} label="Notifications" value={summary.notifications.toLocaleString()}
                        note={`read ones ${keep(summary.notificationRetentionDays)}`}
                        action={{ label: 'Clean up', onClick: () => cleanup('notifications'), disabled: busy !== null, loading: busy === 'notifications' }} />
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
                    <div>
                        <h2 className="text-base font-semibold text-gray-800">Clean up old data</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Runs by itself every night. Clean one kind of data with its own button above, or run all of them here. How long each kind of data is kept is set in{' '}
                            <Link href="/system/configuration" className="font-medium text-brand-600 hover:text-brand-700">Configuration</Link>{' '}
                            (<code className="text-xs">DOWNLOAD_RETENTION_DAYS</code>, <code className="text-xs">AUDIT_LOG_RETENTION_DAYS</code>,{' '}
                            <code className="text-xs">NOTIFICATION_RETENTION_DAYS</code>).
                        </p>
                    </div>
                    <ButtonComponent size="sm" onClick={() => cleanup()} disabled={busy !== null} className="w-auto! gap-1.5">
                        {busy === 'all' ? <><Loader2 size={14} className="animate-spin" /> Cleaning...</> : <><Eraser size={14} /> Run all cleanups now</>}
                    </ButtonComponent>
                </div>

                <div className="rounded-xl border border-red-100 bg-red-50/30 p-6 space-y-4">
                    <div>
                        <h2 className="text-base font-semibold text-red-700">Delete all download jobs</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Removes every download (and its file) of every user at once, regardless of age. Normally the nightly cleanup is enough.
                        </p>
                    </div>
                    <ButtonComponent variant="danger" size="sm" onClick={purge} disabled={busy !== null || summary.downloadJobs === 0} className="w-auto! gap-1.5">
                        {busy === 'purge' ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : <><Trash2 size={14} /> Delete all downloads</>}
                    </ButtonComponent>
                </div>
            </div>

            {/* Right: maintenance mode, the same width as the cleanups. On a narrow screen it comes first, because it is the one to reach quickly. */}
            <div className="order-first lg:order-none lg:sticky lg:top-0">
                <MaintenanceModeCard />
            </div>
        </div>
    );
}
