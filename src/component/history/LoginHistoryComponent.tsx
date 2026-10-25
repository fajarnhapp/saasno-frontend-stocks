'use client';

import { useEffect, useState } from 'react';
import { useCsrf } from '@/context/CsrfContext';
import { useContentLoading } from '@/hooks/useContentLoading';
import { ResponseTable } from '@/type/common/ResponseTable';
import { BaseFilter, DEFAULT_FILTER } from '@/type/filter/BaseFilter';
import { LoginHistory, LoginHistoryFilter } from '@/type/history';
import { readLoginHistory } from '@/service/historyService';
import { formatDate } from '@/utils/formatterUtils';
import { handleResponseTable } from '@/utils/responseApiUtils';
import BadgeComponent from '../ui/BadgeComponent';
import ButtonComponent from '../ui/ButtonComponent';
import InputComponent from '../ui/InputComponent';
import LoadingContent from '../ui/LoadingContent';
import PaginationComponent from '../ui/PaginationComponent';
import { TableBody, TableCell, TableComponent, TableHeader, TableRow } from '../ui/TableComponent';
import { useT } from '@/context/LanguageContext';

// Readable text for the reason codes the backend records.
export const REASON_TEXT: Record<string, string> = {
    PASSWORD: 'Signed in',
    OTP: 'Signed in (authenticator code)',
    RECOVERY_CODE: 'Signed in (recovery code)',
    WRONG_PASSWORD: 'Wrong password',
    UNKNOWN_USER: 'Unknown username',
    LOCKED: 'Account locked',
    INACTIVE: 'Account inactive',
    NETWORK: 'Network not allowed',
    WRONG_OTP: 'Wrong authenticator code',
    WRONG_RECOVERY_CODE: 'Wrong recovery code',
};

// All sign-in attempts of all users, newest first.
export default function LoginHistoryComponent() {
    const t = useT();
    const { isFetching, withFetching } = useContentLoading();
    const { setCsrf } = useCsrf();
    const [hasLoadedOnce, setHasLoadedOnce] = useState<boolean>(false);
    const [rows, setRows] = useState<LoginHistory[]>([]);
    const [filter, setFilter] = useState<LoginHistoryFilter>(DEFAULT_FILTER);
    const [typed, setTyped] = useState<LoginHistoryFilter>({});
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalData, setTotalData] = useState<number>(0);

    useEffect((): void => {
        const fetchData = async (): Promise<void> => {
            await withFetching(async () => {
                const response: Response = await readLoginHistory(filter, setCsrf);
                const data: ResponseTable<LoginHistory[]> = await handleResponseTable<ResponseTable<LoginHistory[]>>(response);
                setRows(data.data || []);
                const total = data.grandTotal || 0;
                setTotalData(total);
                setTotalPages(Math.ceil(total / (filter.limit || 10)));
            });
            setHasLoadedOnce(true);
        };
        fetchData();
    }, [filter, withFetching, setCsrf]);

    const search = () => setFilter({ ...DEFAULT_FILTER, ...(typed.username ? { username: typed.username } : {}), ...(typed.ip ? { ip: typed.ip } : {}) });
    const reset = () => { setTyped({}); setFilter(DEFAULT_FILTER); };

    return (
        <>
            <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4">
                <div className="w-full sm:w-56">
                    <InputComponent label={t('Username')} placeholder={t('Username')} value={typed.username || ''} onChange={(e) => setTyped({ ...typed, username: e.target.value })} />
                </div>
                <div className="w-full sm:w-56">
                    <InputComponent label={t('IP address')} placeholder={t('IP address')} value={typed.ip || ''} onChange={(e) => setTyped({ ...typed, ip: e.target.value })} />
                </div>
                <ButtonComponent variant="secondary" type="button" onClick={reset} className="w-auto!">{t('Reset')}</ButtonComponent>
                <ButtonComponent type="button" onClick={search} className="w-auto!">{t('Search')}</ButtonComponent>
            </div>

            {isFetching && !hasLoadedOnce ? (
                <LoadingContent />
            ) : (
                <>
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                        <div className="max-w-full overflow-x-auto">
                            <div className="min-w-[800px]">
                                <TableComponent>
                                    <TableHeader>
                                        <TableRow>
                                            <TableCell isHeader>{t('Time')}</TableCell>
                                            <TableCell isHeader>{t('Username')}</TableCell>
                                            <TableCell isHeader>{t('Result')}</TableCell>
                                            <TableCell isHeader>{t('IP address')}</TableCell>
                                            <TableCell isHeader>{t('Device')}</TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rows.map(row => (
                                            <TableRow key={row.id}>
                                                <TableCell>{formatDate(row.registered || '', 'DD/MM/YYYY HH:mm:ss')}</TableCell>
                                                <TableCell>{row.username}</TableCell>
                                                <TableCell>
                                                    <BadgeComponent variant={row.success ? 'green' : 'red'}>{t(REASON_TEXT[row.reason || ''] || row.reason)}</BadgeComponent>
                                                </TableCell>
                                                <TableCell>{row.ip || '-'}</TableCell>
                                                <TableCell><span className="block max-w-xs truncate" title={row.userAgent}>{row.userAgent || '-'}</span></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </TableComponent>
                            </div>
                        </div>
                    </div>
                    {rows.length === 0 && <div className="p-4 text-center text-gray-500">{t('No sign-in recorded.')}</div>}
                    {rows.length > 0 && (
                        <div className="mt-4 flex justify-center">
                            <PaginationComponent
                                filterData={filter}
                                totalPages={totalPages}
                                limitPerPage={filter.limit || 10}
                                onPageChange={async (f: BaseFilter) => setFilter(f)}
                                totalData={totalData}
                            />
                        </div>
                    )}
                </>
            )}
        </>
    );
}
