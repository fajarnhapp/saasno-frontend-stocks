"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useModal } from "@/context/ModalContext";
import { useCsrf } from "@/context/CsrfContext";
import { useLoading } from "@/context/LoadingCircleContext";
import { readAllSessions, readMySessions, revokeAllSessions, revokeAnySession, revokeMySession, revokeOtherSessions } from "@/service/sessionService";
import { ResponseApi } from "@/type/common/ResponseApi";
import { SessionInfo } from "@/type/session";
import { API_MSG_SUCCESS, handleResponseApi } from "@/utils/responseApiUtils";
import { formatDate } from "@/utils/formatterUtils";
import BadgeComponent from "../ui/BadgeComponent";
import ButtonComponent from "../ui/ButtonComponent";
import { useT } from '@/context/LanguageContext';

// "Chrome di Windows" dari teks User-Agent; cukup untuk mengenali perangkat, bukan pengurai lengkap.
function deviceName(agent?: string | null): string {
    if (!agent) return 'Unknown device';
    const browser = /Edg\//.test(agent) ? 'Edge' : /OPR\//.test(agent) ? 'Opera' : /Chrome\//.test(agent) ? 'Chrome' : /Firefox\//.test(agent) ? 'Firefox' : /Safari\//.test(agent) ? 'Safari' : 'Browser';
    const system = /Android/.test(agent) ? 'Android' : /iPhone|iPad/.test(agent) ? 'iOS' : /Windows/.test(agent) ? 'Windows' : /Mac OS/.test(agent) ? 'macOS' : /Linux/.test(agent) ? 'Linux' : '';
    return system ? `${browser} on ${system}` : browser;
}

// List of signed-in devices. scope "mine" = own devices (Profile); "all" = every user's devices (Session page).
export default function SessionList({ scope }: { scope: 'mine' | 'all' }) {
    const t = useT();
    const { showConfirm, showModal, contentModalSuccess, contentModalError } = useModal();
    const { handleLoading } = useLoading();
    const { csrf, setCsrf } = useCsrf();
    const [rows, setRows] = useState<SessionInfo[] | null>(null);
    const [error, setError] = useState<string>('');

    const fetchRows = useCallback(async (): Promise<SessionInfo[] | null> => {
        const response: Response = scope === 'all' ? await readAllSessions(setCsrf) : await readMySessions(setCsrf);
        const data: ResponseApi<SessionInfo[]> = await handleResponseApi<ResponseApi<SessionInfo[]>>(response);
        if (data.message === API_MSG_SUCCESS) {
            setError('');
            return data.data || [];
        }
        setError(data.message || t('Failed to load sessions.'));
        return null;
    }, [scope, setCsrf, t]);

    useEffect((): void => {
        const load = async (): Promise<void> => {
            setRows(await fetchRows());
        };
        load();
    }, [fetchRows]);

    const act = (action: () => Promise<Response>, success: string): void => {
        handleLoading(async () => {
            const response: Response = await action();
            const data: ResponseApi<unknown> = await handleResponseApi<ResponseApi<unknown>>(response);
            if (data.message === API_MSG_SUCCESS) {
                setRows(await fetchRows());
                showModal(contentModalSuccess(success));
            } else {
                showModal(contentModalError(`${data.message || t('Failed to sign out the device.')}`));
            }
        });
    };

    const revoke = (s: SessionInfo): void => showConfirm(
        <div className="flex flex-col gap-2"><h3 className="text-lg font-semibold mb-2">{t('Sign out device')}</h3>
            <p className="mb-4">{s.username} on {deviceName(s.userAgent)} ({s.ip || 'unknown IP'}) will be signed out and must log in again. Continue?</p></div>,
        () => act(() => (scope === 'all' ? revokeAnySession(s.handle, csrf, setCsrf) : revokeMySession(s.handle, csrf, setCsrf)), 'Device signed out.'),
        t('Sign out'), 'Cancel');

    const others = (rows || []).filter((r) => !r.current).length;

    const revokeUser = (s: SessionInfo): void => showConfirm(
        <div className="flex flex-col gap-2"><h3 className="text-lg font-semibold mb-2">{t('Sign out all devices of this user')}</h3>
            <p className="mb-4">{t('Every device of {name} will be signed out and must log in again. Continue?', { name: s.username })}</p></div>,
        () => act(() => revokeAllSessions(s.userId, csrf, setCsrf), 'Devices signed out.'),
        t('Sign out all'), 'Cancel');

    return (
        <div>
            {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {rows === null ? <p className="text-sm text-gray-400">{t('Loading...')}</p> : rows.length === 0 ? <p className="text-sm text-gray-400">{t('No active sessions.')}</p> : (
                <ul className="flex flex-col divide-y divide-gray-100">
                    {rows.map((s, index) => (
                        <Fragment key={s.handle}>
                        {scope === 'all' && (index === 0 || rows[index - 1].userId !== s.userId) && (
                            <li className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 px-3 py-2">
                                <span className="text-sm font-semibold text-gray-700">{s.username}</span>
                                {rows.some((r) => r.userId === s.userId && !r.current) && (
                                    <button type="button" onClick={() => revokeUser(s)}
                                        className="cursor-pointer text-xs text-brand-600 underline hover:text-brand-800">
                                        {t('Sign out all devices of this user')}
                                    </button>
                                )}
                            </li>
                        )}
                        <li className="flex flex-wrap items-center justify-between gap-3 py-3">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-gray-800">
                                    <span>{deviceName(s.userAgent)}</span>
                                    {s.current && <BadgeComponent variant="green">{t('This device')}</BadgeComponent>}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {s.ip || t('Unknown IP')} · signed in {formatDate(s.registered, 'DD/MM/YYYY HH:mm')} · valid until {formatDate(s.expired, 'DD/MM/YYYY HH:mm')}
                                </div>
                            </div>
                            {!s.current && (
                                <button type="button" onClick={() => revoke(s)} title={t('Sign out')}
                                    className="flex cursor-pointer items-center gap-1 rounded border border-brand-500 bg-white px-2 py-1 text-xs text-brand-600 hover:bg-brand-600 hover:text-white">
                                    <LogOut className="h-3.5 w-3.5" /> Sign out
                                </button>
                            )}
                        </li>
                        </Fragment>
                    ))}
                </ul>
            )}
            {scope === 'all' && others > 0 && (
                <div className="mt-3 sm:w-fit">
                    <ButtonComponent variant="outlineViolet" onClick={() => showConfirm(
                        <div className="flex flex-col gap-2"><h3 className="text-lg font-semibold mb-2">{t('Sign out all sessions')}</h3>
                            <p className="mb-4">{t('{count} session(s) of every user will be signed out and must log in again. Your own session stays. Continue?', { count: others })}</p></div>,
                        () => act(() => revokeAllSessions(undefined, csrf, setCsrf), 'All sessions signed out.'), t('Sign out all'), 'Cancel')}>
                        {t('Sign out all sessions')}
                    </ButtonComponent>
                </div>
            )}
            {scope === 'mine' && others > 0 && (
                <div className="mt-3 sm:w-fit">
                    <ButtonComponent variant="outlineViolet" onClick={() => showConfirm(
                        <div className="flex flex-col gap-2"><h3 className="text-lg font-semibold mb-2">{t('Sign out all other devices')}</h3><p className="mb-4">{others} other device(s) will be signed out. This device stays signed in.</p></div>,
                        () => act(() => revokeOtherSessions(csrf, setCsrf), 'Other devices signed out.'), 'Sign out all', 'Cancel')}>
                        {t('Sign out all other devices')}
                    </ButtonComponent>
                </div>
            )}
        </div>
    );
}
