'use client';

import { useEffect, useState } from 'react';
import { Download, ShieldCheck, UserX } from 'lucide-react';
import { useCsrf } from '@/context/CsrfContext';
import { useT } from '@/context/LanguageContext';
import { useModal } from '@/context/ModalContext';
import { PrivacyStatus, readMyData, readPrivacyStatus, requestAccountDeletion } from '@/service/privacyService';
import { ResponseApi } from '@/type/common/ResponseApi';
import { formatDate } from '@/utils/formatterUtils';
import { API_MSG_SUCCESS, handleResponseApi } from '@/utils/responseApiUtils';
import ButtonComponent from '../ui/ButtonComponent';

// What the user can do about their own data: read the policy, download a copy of the data, ask for the account to be deleted.
export default function PrivacyCard() {
    const t = useT();
    const { csrf, setCsrf } = useCsrf();
    const { showConfirm, showModal, contentModalSuccess, contentModalError } = useModal();
    const [status, setStatus] = useState<PrivacyStatus | null>(null);
    const [version, setVersion] = useState<number>(0);
    const [busy, setBusy] = useState<boolean>(false);

    useEffect(() => {
        const load = async () => {
            const res: Response = await readPrivacyStatus(setCsrf);
            if (!res.ok) return;
            const data: ResponseApi<PrivacyStatus> = await handleResponseApi<ResponseApi<PrivacyStatus>>(res);
            setStatus(data.data || null);
        };
        load();
    }, [version, setCsrf]);

    const download = async () => {
        setBusy(true);
        try {
            const res: Response = await readMyData(setCsrf);
            if (!res.ok) {
                showModal(contentModalError(t('Failed to download your data.')));
                return;
            }
            const body: ResponseApi<unknown> = await res.json();
            const url: string = URL.createObjectURL(new Blob([JSON.stringify(body.data, null, 2)], { type: 'application/json' }));
            const link: HTMLAnchorElement = document.createElement('a');
            link.href = url;
            link.download = 'my-data.json';
            link.click();
            URL.revokeObjectURL(url);
        } finally {
            setBusy(false);
        }
    };

    const requestDeletion = () => showConfirm(
        <div className="flex flex-col gap-2">
            <h3 className="mb-2 text-lg font-semibold">{t('Delete my account')}</h3>
            <p className="mb-4">{t('Ask an administrator to delete your account? You are told if the request is not approved.')}</p>
        </div>,
        async () => {
            const res: Response = await requestAccountDeletion(csrf, setCsrf);
            const data: ResponseApi<unknown> = await handleResponseApi<ResponseApi<unknown>>(res);
            if (data.message === API_MSG_SUCCESS) {
                showModal(contentModalSuccess(t('Your request was sent to the administrators.')));
                setVersion(v => v + 1);
            } else {
                showModal(contentModalError(data.message || t('Failed to send the request.')));
            }
        }, 'Yes', 'Cancel');

    // The role may not use these features: then the card is left out.
    if (!status) {
        return null;
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <ShieldCheck className="h-4 w-4 text-brand-500" /> {t('Privacy')}
            </h3>
            <p className="mb-4 text-xs text-gray-400">
                <a href="/privacy" target="_blank" rel="noreferrer" className="text-brand-600 underline">{t('Privacy policy')}</a>
                {' · '}
                {status.builtIn
                    ? t('not published yet')
                    : status.acceptedVersion === status.version
                        ? t('you read version {version} on {date}', { version: status.version, date: status.acceptedAt ? formatDate(status.acceptedAt, 'DD/MM/YYYY') : '' })
                        : t('version {version} is waiting for you to read it', { version: status.version })}
            </p>
            <div className="flex flex-wrap gap-3">
                <ButtonComponent type="button" variant="outline" className="w-auto! gap-1.5" disabled={busy} onClick={download}>
                    <Download size={16} /> {t('Download my data')}
                </ButtonComponent>
                <ButtonComponent type="button" variant="secondary" className="w-auto! gap-1.5" disabled={status.deletionPending} onClick={requestDeletion}>
                    <UserX size={16} /> {status.deletionPending ? t('Deletion requested') : t('Delete my account')}
                </ButtonComponent>
            </div>
        </div>
    );
}
