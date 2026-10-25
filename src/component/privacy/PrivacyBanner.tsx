'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useCsrf } from '@/context/CsrfContext';
import { useT } from '@/context/LanguageContext';
import { acceptPolicy, PrivacyStatus, readPrivacyStatus } from '@/service/privacyService';
import { ResponseApi } from '@/type/common/ResponseApi';
import { handleResponseApi } from '@/utils/responseApiUtils';

// Above every page while the signed-in user has not read the current version of the privacy policy.
export default function PrivacyBanner() {
    const t = useT();
    const { csrf, setCsrf } = useCsrf();
    const [status, setStatus] = useState<PrivacyStatus | null>(null);
    const [busy, setBusy] = useState<boolean>(false);

    useEffect(() => {
        const load = async () => {
            try {
                const res: Response = await readPrivacyStatus(setCsrf);
                if (!res.ok) return;
                const data: ResponseApi<PrivacyStatus> = await handleResponseApi<ResponseApi<PrivacyStatus>>(res);
                setStatus(data.data || null);
            } catch {
                // The banner is a reminder; when it cannot load, nothing is lost.
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only; setCsrf is a stable context setter
    }, []);

    if (!status?.needsAcceptance) {
        return null;
    }

    const accept = async () => {
        setBusy(true);
        try {
            const res: Response = await acceptPolicy(csrf, setCsrf);
            if (res.ok) setStatus({ ...status, needsAcceptance: false });
        } finally {
            setBusy(false);
        }
    };

    return (
        <div role="status" className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-sky-200 bg-sky-50 px-4 py-2 text-sm text-sky-800">
            <ShieldCheck size={16} className="shrink-0" />
            <span className="min-w-0 flex-1">{t('The privacy policy has changed. Please read it.')}</span>
            <a href="/privacy" target="_blank" rel="noreferrer" className="font-semibold underline">{t('Read the policy')}</a>
            <button type="button" disabled={busy} onClick={accept} className="rounded-md bg-sky-700 px-3 py-1 text-white hover:bg-sky-800 disabled:opacity-50 cursor-pointer">
                {t('I have read it')}
            </button>
        </div>
    );
}
