'use client';

import { useEffect, useState } from 'react';
import { useCsrf } from '@/context/CsrfContext';
import { useContentLoading } from '@/hooks/useContentLoading';
import { ResponseTable } from '@/type/common/ResponseTable';
import { BaseFilter, DEFAULT_FILTER } from '@/type/filter/BaseFilter';
import { ChangeLog, ChangeLogFilter } from '@/type/history';
import { Option } from '@/type/option';
import { readChangeLog } from '@/service/historyService';
import { formatDate } from '@/utils/formatterUtils';
import { handleResponseTable } from '@/utils/responseApiUtils';
import BadgeComponent from '../ui/BadgeComponent';
import ButtonComponent from '../ui/ButtonComponent';
import InputComponent from '../ui/InputComponent';
import LoadingContent from '../ui/LoadingContent';
import PaginationComponent from '../ui/PaginationComponent';
import SearchableDropdown from '../ui/SearchableDropdown';
import { TableBody, TableCell, TableComponent, TableHeader, TableRow } from '../ui/TableComponent';
import { useT } from '@/context/LanguageContext';

const TYPES: Option[] = [
    { label: 'User', value: 'USER' },
    { label: 'Person', value: 'PERSON' },
    { label: 'Role', value: 'ROLE' },
    { label: 'Configuration', value: 'CONFIGURATION' },
];

const ACTION_VARIANT: Record<string, 'green' | 'blue' | 'red'> = { CREATE: 'green', UPDATE: 'blue', DELETE: 'red' };

// What changed in users, people, roles and settings: field, old value, new value, who and when.
export default function ChangeHistoryComponent() {
    const t = useT();
    const { isFetching, withFetching } = useContentLoading();
    const { setCsrf } = useCsrf();
    const [hasLoadedOnce, setHasLoadedOnce] = useState<boolean>(false);
    const [rows, setRows] = useState<ChangeLog[]>([]);
    const [filter, setFilter] = useState<ChangeLogFilter>(DEFAULT_FILTER);
    const [typed, setTyped] = useState<ChangeLogFilter>({});
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalData, setTotalData] = useState<number>(0);

    useEffect((): void => {
        const fetchData = async (): Promise<void> => {
            await withFetching(async () => {
                const response: Response = await readChangeLog(filter, setCsrf);
                const data: ResponseTable<ChangeLog[]> = await handleResponseTable<ResponseTable<ChangeLog[]>>(response);
                setRows(data.data || []);
                const total = data.grandTotal || 0;
                setTotalData(total);
                setTotalPages(Math.ceil(total / (filter.limit || 10)));
            });
            setHasLoadedOnce(true);
        };
        fetchData();
    }, [filter, withFetching, setCsrf]);

    const search = () => setFilter({
        ...DEFAULT_FILTER,
        ...(typed.entityType ? { entityType: typed.entityType } : {}),
        ...(typed.entityLabel ? { entityLabel: typed.entityLabel } : {}),
        ...(typed.changedBy ? { changedBy: typed.changedBy } : {}),
    });
    const reset = () => { setTyped({}); setFilter(DEFAULT_FILTER); };

    return (
        <>
            <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4">
                <div className="w-full sm:w-48">
                    <SearchableDropdown
                        label={t('Type')}
                        placeholder={t('Any type')}
                        options={TYPES.map(o => ({ ...o, label: t(o.label) }))}
                        value={(() => { const found = TYPES.find(x => x.value === typed.entityType); return found ? t(found.label) : undefined; })()}
                        onChange={(opt) => setTyped({ ...typed, entityType: opt?.value || '' })}
                    />
                </div>
                <div className="w-full sm:w-56">
                    <InputComponent label={t('Record')} placeholder={t('Name of the record')} value={typed.entityLabel || ''} onChange={(e) => setTyped({ ...typed, entityLabel: e.target.value })} />
                </div>
                <div className="w-full sm:w-56">
                    <InputComponent label={t('Changed by')} placeholder={t('Username')} value={typed.changedBy || ''} onChange={(e) => setTyped({ ...typed, changedBy: e.target.value })} />
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
                            <div className="min-w-[900px]">
                                <TableComponent>
                                    <TableHeader>
                                        <TableRow>
                                            <TableCell isHeader>{t('Time')}</TableCell>
                                            <TableCell isHeader>{t('Record')}</TableCell>
                                            <TableCell isHeader>{t('Action')}</TableCell>
                                            <TableCell isHeader>{t('Field')}</TableCell>
                                            <TableCell isHeader>{t('Old value')}</TableCell>
                                            <TableCell isHeader>{t('New value')}</TableCell>
                                            <TableCell isHeader>{t('By')}</TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rows.map(row => (
                                            <TableRow key={row.id}>
                                                <TableCell>{formatDate(row.registered || '', 'DD/MM/YYYY HH:mm:ss')}</TableCell>
                                                <TableCell>
                                                    <span className="text-xs text-gray-400">{row.entityType}</span>
                                                    <br />{row.entityLabel || row.entityId}
                                                </TableCell>
                                                <TableCell><BadgeComponent variant={ACTION_VARIANT[row.action || ''] || 'gray'}>{row.action}</BadgeComponent></TableCell>
                                                <TableCell>{row.field || '-'}</TableCell>
                                                <TableCell><span className="block max-w-[14rem] break-words whitespace-pre-wrap">{row.oldValue ?? '-'}</span></TableCell>
                                                <TableCell><span className="block max-w-[14rem] break-words whitespace-pre-wrap">{row.newValue ?? '-'}</span></TableCell>
                                                <TableCell>{row.changedBy || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </TableComponent>
                            </div>
                        </div>
                    </div>
                    {rows.length === 0 && <div className="p-4 text-center text-gray-500">{t('No change recorded.')}</div>}
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
