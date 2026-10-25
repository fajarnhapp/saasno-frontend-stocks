'use client';

import { useEffect, useState } from 'react';
import BadgeComponent from '../ui/BadgeComponent';
import { REASON_TEXT } from '../history/LoginHistoryComponent';
import { useCsrf } from '@/context/CsrfContext';
import { readMyLoginHistory } from '@/service/historyService';
import { ResponseApi } from '@/type/common/ResponseApi';
import { LoginHistory } from '@/type/history';
import { formatDate } from '@/utils/formatterUtils';
import { handleResponseApi } from '@/utils/responseApiUtils';
import { useT } from '@/context/LanguageContext';

// The latest sign-in attempts on the signed-in user's own account, so an unknown one can be noticed.
export default function RecentSignIns() {
    const t = useT();
    const { setCsrf } = useCsrf();
    const [rows, setRows] = useState<LoginHistory[] | null>(null);

    useEffect(() => {
        const load = async () => {
            const res: Response = await readMyLoginHistory(setCsrf);
            const data: ResponseApi<LoginHistory[]> = await handleResponseApi<ResponseApi<LoginHistory[]>>(res);
            setRows(res.ok ? data.data || [] : []);
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only; setCsrf is a stable context setter
    }, []);

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-1 text-sm font-semibold text-gray-800">{t('Recent sign-ins')}</h3>
            <p className="mb-3 text-xs text-gray-400">{t('The latest attempts on your account. If one is not you, change your password.')}</p>
            {rows === null && <div className="h-16 animate-pulse rounded bg-gray-100" />}
            {rows && rows.length === 0 && <p className="text-sm text-gray-400">{t('Nothing recorded yet.')}</p>}
            {rows && rows.length > 0 && (
                <ul className="divide-y divide-gray-100">
                    {rows.map(row => (
                        <li key={row.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
                            <BadgeComponent variant={row.success ? 'green' : 'red'}>{t(REASON_TEXT[row.reason || ''] || row.reason)}</BadgeComponent>
                            <span className="text-gray-700">{formatDate(row.registered || '', 'DD/MM/YYYY HH:mm')}</span>
                            <span className="text-gray-400">{row.ip || ''}</span>
                            <span className="min-w-0 flex-1 truncate text-xs text-gray-400" title={row.userAgent}>{row.userAgent || ''}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
