'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Power, PowerOff, Wrench } from 'lucide-react';
import ButtonComponent from '../ui/ButtonComponent';
import { useCsrf } from '@/context/CsrfContext';
import { useModal } from '@/context/ModalContext';
import { readMaintenanceMode, updateMaintenanceMode } from '@/service/maintenanceService';
import { ResponseApi } from '@/type/common/ResponseApi';
import { MaintenanceMode } from '@/type/maintenance';
import { formatUntil, toDatetimeLocal, toggleRole, upcomingOrEmpty, withSuper } from '@/utils/maintenanceUtils';
import { API_MSG_SUCCESS, handleResponseApi } from '@/utils/responseApiUtils';

const MAX_MESSAGE = 500;

// Switch maintenance mode on or off, choose who may keep working, say why and (optionally) when it ends.
export default function MaintenanceModeCard() {
    const { csrf, setCsrf } = useCsrf();
    const { showModal, showConfirm, contentModalError } = useModal();
    const [mode, setMode] = useState<MaintenanceMode | null>(null);
    const [message, setMessage] = useState<string>('');
    const [until, setUntil] = useState<string>('');
    const [roles, setRoles] = useState<string[]>(['SUPER']);
    const [busy, setBusy] = useState<boolean>(false);

    const load = useCallback(async () => {
        const res: Response = await readMaintenanceMode(setCsrf);
        const data: ResponseApi<MaintenanceMode> = await handleResponseApi(res);
        if (data.message === API_MSG_SUCCESS) {
            setMode(data.data);
            setMessage(data.data.message);
            setUntil(upcomingOrEmpty(data.data.until, toDatetimeLocal(new Date())));
            setRoles(withSuper(data.data.bypassRoles));
        }
    }, [setCsrf]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- loads the saved settings when the page opens
        load();
    }, [load]);

    const save = async (enabled: boolean) => {
        setBusy(true);
        try {
            const res: Response = await updateMaintenanceMode({ enabled, message, until, bypassRoles: roles }, csrf, setCsrf);
            const data: ResponseApi<MaintenanceMode> = await handleResponseApi(res);
            if (data.message !== API_MSG_SUCCESS) {
                showModal(contentModalError(data.message || 'Failed to save the maintenance settings'));
                return;
            }
            // The banner and the login page read the state when a page loads.
            window.location.reload();
        } finally {
            setBusy(false);
        }
    };

    const turnOn = () => showConfirm(
        <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Turn on maintenance mode?</h3>
            <p className="text-sm text-gray-500">
                Everyone except the roles you ticked ({roles.join(', ')}) is blocked right away and sees the maintenance page, including people
                who are signed in now.
            </p>
            <p className="text-sm text-gray-500">
                {until
                    ? <>It ends by itself around <strong>{formatUntil(until)}</strong>, or earlier when you turn it off.</>
                    : <>No end time is set, so it stays on until you turn it off here.</>}
            </p>
        </div>,
        () => save(true),
        'Turn on',
        'Cancel',
    );

    if (!mode) {
        return <div className="flex justify-center rounded-xl border border-gray-200 bg-white p-8"><Loader2 size={22} className="animate-spin text-brand-600" /></div>;
    }

    const endedByItself: boolean = mode.enabled && !mode.active;

    return (
        <div className={`rounded-xl border p-6 space-y-5 ${mode.active ? 'border-amber-300 bg-amber-50/40' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${mode.active ? 'bg-amber-100 text-amber-700' : 'bg-brand-50 text-brand-600'}`}>
                    <Wrench size={20} />
                </div>
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-gray-800">Maintenance mode</h2>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${mode.active ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-500'}`}>
                            {mode.active ? 'ON' : 'OFF'}
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                        While it is on, only the roles ticked below can sign in or use the app. Everyone else sees the maintenance page.
                    </p>
                    {endedByItself && (
                        <p className="mt-2 text-sm text-gray-600">It ended by itself at {formatUntil(mode.until)}. Turn it on again to start a new one.</p>
                    )}
                </div>
            </div>

            <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Roles that can keep working</p>
                <div className="flex flex-wrap gap-2">
                    {mode.roles.map((role) => {
                        const locked: boolean = role.id === 'SUPER';
                        const checked: boolean = roles.includes(role.id);
                        return (
                            <label
                                key={role.id}
                                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${checked ? 'border-brand-300 bg-brand-50 text-brand-800' : 'border-gray-200 bg-white text-gray-600'} ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                title={locked ? 'Always allowed: this is how maintenance is switched off again' : undefined}
                            >
                                <input type="checkbox" checked={checked} disabled={locked} onChange={() => setRoles((current) => toggleRole(current, role.id))} />
                                {role.name || role.id}{locked && <span className="text-xs text-gray-400">(always)</span>}
                            </label>
                        );
                    })}
                </div>
            </div>

            <div>
                <label htmlFor="maintenance-message" className="mb-1 flex justify-between text-sm font-medium text-gray-700">
                    <span>Message for everyone else</span>
                    <span className="text-xs font-normal text-gray-400">{message.length}/{MAX_MESSAGE}</span>
                </label>
                <textarea
                    id="maintenance-message"
                    rows={3}
                    maxLength={MAX_MESSAGE}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="For example: We are upgrading the database. Back at 18:00."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
            </div>

            <div>
                <label htmlFor="maintenance-until" className="mb-1 block text-sm font-medium text-gray-700">Expected end (optional)</label>
                <div className="flex flex-wrap items-center gap-2">
                    <input
                        id="maintenance-until"
                        type="datetime-local"
                        value={until}
                        min={toDatetimeLocal(new Date())}
                        onChange={(e) => setUntil(e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    {until && <button type="button" onClick={() => setUntil('')} className="text-xs text-gray-500 hover:text-gray-700 underline cursor-pointer">Clear</button>}
                </div>
                <p className="mt-1 text-xs text-gray-400">
                    Maintenance ends by itself at this time (server time). Leave it empty to keep maintenance on until you turn it off.
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                {mode.active ? (
                    <>
                        <ButtonComponent variant="danger" size="sm" disabled={busy} onClick={() => save(false)} className="w-auto! gap-1.5">
                            {busy ? <Loader2 size={14} className="animate-spin" /> : <PowerOff size={14} />} Turn off now
                        </ButtonComponent>
                        <ButtonComponent variant="outline" size="sm" disabled={busy} onClick={() => save(true)} className="w-auto!">
                            Save changes
                        </ButtonComponent>
                    </>
                ) : (
                    <ButtonComponent size="sm" disabled={busy} onClick={turnOn} className="w-auto! gap-1.5">
                        {busy ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />} Turn on maintenance
                    </ButtonComponent>
                )}
            </div>

            <p className="rounded-lg bg-white/70 px-3 py-2 text-xs text-gray-500">
                <strong>How it ends:</strong> press <em>Turn off now</em> here, or let it end by itself at the end time. People on the
                maintenance page are sent to the login page automatically. If nobody can sign in, run in the database:{' '}
                <code className="break-all">UPDATE configuration SET value = &apos;false&apos; WHERE id = &apos;MAINTENANCE_MODE&apos;;</code>
            </p>
        </div>
    );
}
