'use client';

import { useEffect, useState } from 'react';
import { Copy, KeyRound, Trash2 } from 'lucide-react';
import { useCsrf } from '@/context/CsrfContext';
import { useT } from '@/context/LanguageContext';
import { useModal } from '@/context/ModalContext';
import { createToken, readTokens, revokeToken } from '@/service/tokenService';
import { ResponseApi } from '@/type/common/ResponseApi';
import { ApiToken } from '@/type/token';
import { formatDate } from '@/utils/formatterUtils';
import { API_MSG_SUCCESS, handleResponseApi } from '@/utils/responseApiUtils';
import ButtonComponent from '../ui/ButtonComponent';
import InputComponent from '../ui/InputComponent';

const DAYS = ['30', '90', '180', '365'];

// Tokens that let another system call the API as this user. Shown only when the role may use them; the token itself is visible once.
export default function ApiTokensCard() {
    const t = useT();
    const { csrf, setCsrf } = useCsrf();
    const { showConfirm, showModal, contentModalSuccess, contentModalError } = useModal();
    const [tokens, setTokens] = useState<ApiToken[] | null>(null);
    const [allowed, setAllowed] = useState<boolean>(true);
    const [name, setName] = useState<string>('');
    const [days, setDays] = useState<string>('90');
    const [fresh, setFresh] = useState<ApiToken | null>(null);
    const [busy, setBusy] = useState<boolean>(false);

    const [version, setVersion] = useState<number>(0);

    useEffect(() => {
        const load = async () => {
            const res: Response = await readTokens(setCsrf);
            if (res.status === 403) {
                setAllowed(false);
                return;
            }
            const data: ResponseApi<ApiToken[]> = await handleResponseApi<ResponseApi<ApiToken[]>>(res);
            setTokens(data.data || []);
        };
        load();
    }, [version, setCsrf]);

    if (!allowed) {
        return null;
    }

    const create = async () => {
        setBusy(true);
        try {
            const res: Response = await createToken(name, Number(days), csrf, setCsrf);
            const data: ResponseApi<ApiToken> = await handleResponseApi<ResponseApi<ApiToken>>(res);
            if (data.message === API_MSG_SUCCESS && data.data) {
                setFresh(data.data);
                setName('');
                setVersion(v => v + 1);
            } else {
                showModal(contentModalError(data.message || t('Failed to create the token')));
            }
        } finally {
            setBusy(false);
        }
    };

    const revoke = (token: ApiToken) => showConfirm(
        <div className="flex flex-col gap-2">
            <h3 className="mb-2 text-lg font-semibold">{t('Revoke token')}</h3>
            <p className="mb-4">{t('Systems using "{name}" stop working right away. This cannot be undone.', { name: token.name || '' })}</p>
        </div>,
        async () => {
            const res: Response = await revokeToken(token.id || '', csrf, setCsrf);
            const data: ResponseApi<unknown> = await handleResponseApi<ResponseApi<unknown>>(res);
            if (data.message === API_MSG_SUCCESS) {
                showModal(contentModalSuccess(t('Token revoked')));
                setVersion(v => v + 1);
            } else {
                showModal(contentModalError(data.message || t('Failed to revoke the token')));
            }
        }, 'Yes', 'Cancel');

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(fresh?.token || '');
        } catch {
            // Without clipboard access the token can still be selected by hand.
        }
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <KeyRound className="h-4 w-4 text-brand-500" /> {t('API tokens')}
            </h3>
            <p className="mb-4 text-xs text-gray-400">{t('A token lets another system use the API as you, with your permissions. Keep it secret, like a password.')}</p>

            {fresh?.token && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    <p className="mb-2 font-semibold">{t('Copy your new token now. It is not shown again.')}</p>
                    <div className="flex items-center gap-2">
                        <code className="min-w-0 flex-1 break-all rounded bg-white px-2 py-1 text-xs text-gray-800">{fresh.token}</code>
                        <button type="button" title={t('Copy')} onClick={copy} className="rounded p-1.5 hover:bg-amber-100 cursor-pointer"><Copy size={16} /></button>
                    </div>
                    <button type="button" className="mt-2 text-xs underline cursor-pointer" onClick={() => setFresh(null)}>{t('I have saved it')}</button>
                </div>
            )}

            {tokens === null && <div className="h-12 animate-pulse rounded bg-gray-100" />}
            {tokens && tokens.length === 0 && <p className="mb-3 text-sm text-gray-400">{t('No token yet.')}</p>}
            {tokens && tokens.length > 0 && (
                <ul className="mb-4 divide-y divide-gray-100">
                    {tokens.map(token => (
                        <li key={token.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 text-sm">
                            <span className="font-medium text-gray-800">{token.name}</span>
                            <code className="text-xs text-gray-500">{token.prefix}…</code>
                            <span className="text-xs text-gray-400">{t('Expires')} {token.expiresAt ? formatDate(token.expiresAt, 'DD/MM/YYYY') : '-'}</span>
                            <span className="text-xs text-gray-400">{t('Last used')} {token.lastUsedAt ? formatDate(token.lastUsedAt, 'DD/MM/YYYY HH:mm') : t('never')}</span>
                            <button type="button" title={t('Revoke token')} onClick={() => revoke(token)} className="ml-auto rounded p-1.5 text-red-600 hover:bg-red-50 cursor-pointer">
                                <Trash2 size={16} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <div className="flex flex-wrap items-end gap-3">
                <div className="w-full sm:w-64">
                    <InputComponent id="token-name" label={t('Name')} placeholder={t('For example: deploy robot')} value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <label className="text-sm text-gray-700">
                    <span className="mb-2 block font-medium">{t('Valid for')}</span>
                    <select value={days} onChange={(e) => setDays(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 outline-none">
                        {DAYS.map(d => <option key={d} value={d}>{t('{days} days', { days: d })}</option>)}
                    </select>
                </label>
                <ButtonComponent type="button" className="w-auto!" disabled={busy || name.trim() === ''} onClick={create}>{t('Create token')}</ButtonComponent>
            </div>
        </div>
    );
}
