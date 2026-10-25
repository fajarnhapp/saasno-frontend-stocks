'use client';

import { Fragment, useEffect, useState } from 'react';
import { Pencil, X } from 'lucide-react';
import { useCsrf } from '@/context/CsrfContext';
import { useLoading } from '@/context/LoadingCircleContext';
import { useModal } from '@/context/ModalContext';
import { useContentLoading } from '@/hooks/useContentLoading';
import { createAnnouncement, deleteAnnouncement, readAnnouncement, updateAnnouncement } from '@/service/announcementService';
import { Announcement, AnnouncementFilter } from '@/type/announcement';
import { ResponseApi } from '@/type/common/ResponseApi';
import { ResponseTable } from '@/type/common/ResponseTable';
import { BaseFilter, DEFAULT_FILTER } from '@/type/filter/BaseFilter';
import { formatDate } from '@/utils/formatterUtils';
import { API_MSG_SUCCESS, handleResponseApi, handleResponseTable } from '@/utils/responseApiUtils';
import BadgeComponent from '../ui/BadgeComponent';
import FilterAndAddButton from '../ui/FilterAndAddButton';
import InlineEditorRow from '../ui/InlineEditorRow';
import LoadingContent from '../ui/LoadingContent';
import PaginationComponent from '../ui/PaginationComponent';
import { TableBody, TableCell, TableComponent, TableHeader, TableRow } from '../ui/TableComponent';
import AnnouncementForm from './AnnouncementForm';
import { useT } from '@/context/LanguageContext';

const LEVEL_VARIANT: Record<string, 'blue' | 'orange' | 'red'> = { INFO: 'blue', WARNING: 'orange', CRITICAL: 'red' };
const when = (value?: string | null) => (value ? formatDate(value, 'DD/MM/YYYY HH:mm') : '-');

export default function AnnouncementComponent() {
    const t = useT();
    const { showConfirm, showModal, contentModalSuccess, contentModalError } = useModal();
    const { handleLoading } = useLoading();
    const { isFetching, withFetching } = useContentLoading();
    const { csrf, setCsrf } = useCsrf();
    const [refetch, setRefetch] = useState<boolean>(false);
    const [hasLoadedOnce, setHasLoadedOnce] = useState<boolean>(false);
    const [creating, setCreating] = useState<boolean>(false);
    const [rows, setRows] = useState<Announcement[]>([]);
    const [selected, setSelected] = useState<Announcement | null>(null);
    const [filter, setFilter] = useState<AnnouncementFilter>(DEFAULT_FILTER);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalData, setTotalData] = useState<number>(0);

    useEffect((): void => {
        const fetchData = async (): Promise<void> => {
            await withFetching(async () => {
                const response: Response = await readAnnouncement(filter, setCsrf);
                const data: ResponseTable<Announcement[]> = await handleResponseTable<ResponseTable<Announcement[]>>(response);
                setRows(data.data || []);
                const total = data.grandTotal || 0;
                setTotalData(total);
                setTotalPages(Math.ceil(total / (filter.limit || 10)));
            });
            setHasLoadedOnce(true);
        };
        fetchData();
    }, [filter, refetch, withFetching, setCsrf]);

    const confirmThen = (title: string, text: string, run: () => Promise<void>) => showConfirm(
        <div className="flex flex-col gap-2">
            <h3 className="mb-2 text-lg font-semibold">{title}</h3>
            <p className="mb-4">{text}</p>
        </div>,
        run, 'Yes', 'Cancel');

    const save = (announcement: Announcement) => confirmThen(
        announcement.id ? 'Announcement edit confirmation' : 'Announcement create confirmation',
        announcement.id ? 'Are you sure you want to update this announcement?' : 'Are you sure you want to publish this announcement?',
        async () => {
            await handleLoading(async () => {
                const response: Response = announcement.id
                    ? await updateAnnouncement(announcement, csrf, setCsrf)
                    : await createAnnouncement(announcement, csrf, setCsrf);
                const data: ResponseApi<Announcement> = await handleResponseApi<ResponseApi<Announcement>>(response);
                if (data.message === API_MSG_SUCCESS) {
                    setCreating(false);
                    setSelected(null);
                    setRefetch(!refetch);
                    showModal(contentModalSuccess(t('Announcement saved')));
                } else {
                    showModal(contentModalError(data.message || t('Failed to save the announcement.')));
                }
            });
        });

    const remove = (id: string) => confirmThen('Announcement delete confirmation', 'Are you sure you want to delete this announcement?', async () => {
        await handleLoading(async () => {
            const response: Response = await deleteAnnouncement(id, csrf, setCsrf);
            const data: ResponseApi<Announcement> = await handleResponseApi<ResponseApi<Announcement>>(response);
            if (data.message === API_MSG_SUCCESS) {
                setRefetch(!refetch);
                showModal(contentModalSuccess(t('Announcement deleted')));
            } else {
                showModal(contentModalError(data.message || t('Failed to delete the announcement.')));
            }
        });
    });

    return (
        <>
            <FilterAndAddButton
                setViewMode={(mode) => { setSelected(null); setCreating(mode === 'FORM'); }}
                viewMode={creating ? 'FORM' : 'TABLE'}
                showFilterButton={false}
            />

            {creating && (
                <div className="mb-4">
                    <AnnouncementForm onSubmit={save} onCancel={() => setCreating(false)} />
                </div>
            )}

            {isFetching && !hasLoadedOnce ? (
                <LoadingContent />
            ) : (
                <>
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                        <div className="@container max-w-full overflow-x-auto">
                            <div className="min-w-[800px]">
                                <TableComponent>
                                    <TableHeader>
                                        <TableRow>
                                            <TableCell isHeader>{t('Title')}</TableCell>
                                            <TableCell isHeader>{t('Level')}</TableCell>
                                            <TableCell isHeader>{t('Shown')}</TableCell>
                                            <TableCell isHeader>{t('Status')}</TableCell>
                                            <TableCell isHeader>{t('By')}</TableCell>
                                            <TableCell isHeader>{t('Action')}</TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rows.map(row => (
                                            <Fragment key={row.id}>
                                                <TableRow className={selected?.id === row.id ? 'bg-brand-50/40' : ''}>
                                                    <TableCell>
                                                        <span className="font-medium">{row.title}</span>
                                                        <span className="block max-w-md truncate text-xs text-gray-500" title={row.message}>{row.message}</span>
                                                    </TableCell>
                                                    <TableCell><BadgeComponent variant={LEVEL_VARIANT[row.level || ''] || 'gray'}>{row.level}</BadgeComponent></TableCell>
                                                    <TableCell>{when(row.startsAt)} → {when(row.endsAt)}</TableCell>
                                                    <TableCell><BadgeComponent variant={row.active ? 'green' : 'gray'}>{row.active ? 'ON' : 'OFF'}</BadgeComponent></TableCell>
                                                    <TableCell>{row.createdBy || '-'}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => { setCreating(false); setSelected(row); }} title={t('Edit')}
                                                                className="p-1 rounded border border-brand-500 bg-white text-brand-600 hover:bg-brand-600 hover:text-white cursor-pointer">
                                                                <Pencil className="h-4 w-4" />
                                                            </button>
                                                            <button onClick={() => remove(row.id || '')} title={t('Delete')}
                                                                className="p-1 rounded border border-brand-500 bg-white text-brand-600 hover:bg-brand-600 hover:text-white cursor-pointer">
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                                {selected?.id === row.id && (
                                                    <InlineEditorRow colSpan={6}>
                                                        <AnnouncementForm key={row.id} initial={row} onSubmit={save} onCancel={() => setSelected(null)} />
                                                    </InlineEditorRow>
                                                )}
                                            </Fragment>
                                        ))}
                                    </TableBody>
                                </TableComponent>
                            </div>
                        </div>
                    </div>
                    {rows.length === 0 && <div className="p-4 text-center text-gray-500">{t('No announcement yet.')}</div>}
                    {rows.length > 0 && (
                        <div className="mt-4 flex justify-center">
                            <PaginationComponent filterData={filter} totalPages={totalPages} limitPerPage={filter.limit || 10}
                                onPageChange={async (f: BaseFilter) => setFilter(f)} totalData={totalData} />
                        </div>
                    )}
                </>
            )}
        </>
    );
}
