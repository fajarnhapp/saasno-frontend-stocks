'use client';

import { useEffect, useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { useCsrf } from '@/context/CsrfContext';
import { useT } from '@/context/LanguageContext';
import { useLoading } from '@/context/LoadingCircleContext';
import { useModal } from '@/context/ModalContext';
import { purgeUser, readUserTrash, restoreUser } from '@/service/userService';
import { ResponseApi } from '@/type/common/ResponseApi';
import { ResponseTable } from '@/type/common/ResponseTable';
import { BaseFilter, DEFAULT_FILTER } from '@/type/filter/BaseFilter';
import { UserFilter } from '@/type/filter/UserFilter';
import { User } from '@/type/user';
import { formatDate } from '@/utils/formatterUtils';
import { API_MSG_SUCCESS, handleResponseApi, handleResponseTable } from '@/utils/responseApiUtils';
import PaginationComponent from '../ui/PaginationComponent';
import { TableBody, TableCell, TableComponent, TableHeader, TableRow } from '../ui/TableComponent';

// Users that were deleted: they can be put back, or removed for good.
export default function UserTrash({ onChanged }: { onChanged: () => void }) {
    const t = useT();
    const { csrf, setCsrf } = useCsrf();
    const { handleLoading } = useLoading();
    const { showConfirm, showModal, contentModalSuccess, contentModalError } = useModal();
    const [rows, setRows] = useState<User[] | null>(null);
    const [filter, setFilter] = useState<UserFilter>({ ...DEFAULT_FILTER, order: 'deletedAt' });
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalData, setTotalData] = useState<number>(0);

    const [version, setVersion] = useState<number>(0);

    useEffect(() => {
        const load = async () => {
            const res: Response = await readUserTrash(filter, setCsrf);
            const data: ResponseTable<User[]> = await handleResponseTable<ResponseTable<User[]>>(res);
            setRows(data.data || []);
            const total = data.grandTotal || 0;
            setTotalData(total);
            setTotalPages(Math.ceil(total / (filter.limit || 10)));
        };
        load();
    }, [filter, version, setCsrf]);

    const act = (title: string, text: string, run: () => Promise<Response>, done: string) => showConfirm(
        <div className="flex flex-col gap-2">
            <h3 className="mb-2 text-lg font-semibold">{title}</h3>
            <p className="mb-4">{text}</p>
        </div>,
        async () => {
            await handleLoading(async () => {
                const res: Response = await run();
                const data: ResponseApi<User> = await handleResponseApi<ResponseApi<User>>(res);
                if (data.message === API_MSG_SUCCESS) {
                    showModal(contentModalSuccess(done));
                    setVersion(v => v + 1);
                    onChanged();
                } else {
                    showModal(contentModalError(data.message || t('Failed')));
                }
            });
        }, 'Yes', 'Cancel');

    return (
        <>
            <p className="mb-3 text-sm text-gray-500">{t('Deleted users cannot sign in. Restore a user to give the account back, or delete it for good.')}</p>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[700px]">
                        <TableComponent>
                            <TableHeader>
                                <TableRow>
                                    <TableCell isHeader>{t('Username')}</TableCell>
                                    <TableCell isHeader>{t('Name')}</TableCell>
                                    <TableCell isHeader>{t('Email')}</TableCell>
                                    <TableCell isHeader>{t('Deleted')}</TableCell>
                                    <TableCell isHeader>{t('By')}</TableCell>
                                    <TableCell isHeader>{t('Action')}</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(rows || []).map(row => (
                                    <TableRow key={row.id}>
                                        <TableCell>{row.username}</TableCell>
                                        <TableCell>{row.fullName || '-'}</TableCell>
                                        <TableCell>{row.email || '-'}</TableCell>
                                        <TableCell>{row.deletedAt ? formatDate(row.deletedAt, 'DD/MM/YYYY HH:mm') : '-'}</TableCell>
                                        <TableCell>{row.deletedBy || '-'}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <button title={t('Restore')} className="p-1 rounded border border-brand-500 bg-white text-brand-600 hover:bg-brand-600 hover:text-white cursor-pointer"
                                                    onClick={() => act(t('Restore user'), t('Give the account back to this user?'), () => restoreUser(row.id || '', csrf, setCsrf), t('User restored'))}>
                                                    <RotateCcw className="h-4 w-4" />
                                                </button>
                                                <button title={t('Delete for good')} className="p-1 rounded bg-red-500 text-white hover:bg-red-300 cursor-pointer"
                                                    onClick={() => act(t('Delete for good'), t('This removes the user, their details and contacts for good. It cannot be undone.'), () => purgeUser(row.id || '', csrf, setCsrf), t('User deleted for good'))}>
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </TableComponent>
                    </div>
                </div>
            </div>
            {rows && rows.length === 0 && <div className="p-4 text-center text-gray-500">{t('The trash is empty.')}</div>}
            {rows && rows.length > 0 && (
                <div className="mt-4 flex justify-center">
                    <PaginationComponent filterData={filter} totalPages={totalPages} limitPerPage={filter.limit || 10}
                        onPageChange={async (f: BaseFilter) => setFilter(f)} totalData={totalData} />
                </div>
            )}
        </>
    );
}
