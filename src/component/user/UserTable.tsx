'use client';

import { TableComponent, TableBody, TableCell, TableHeader, TableRow } from '../ui/TableComponent';
import { BaseFilter } from '@/type/filter/BaseFilter';
import { UserFilter } from '@/type/filter/UserFilter';
import { User } from '@/type/user';
import { formatDate } from '@/utils/formatterUtils';
import { KeyRound, ShieldOff, X } from 'lucide-react';
import PaginationComponent from '../ui/PaginationComponent';
import BadgeComponent from '../ui/BadgeComponent';
import { useT } from '@/context/LanguageContext';

type Properties = {
    rows: User[];
    filter: BaseFilter;
    totalPages: number;
    onPageChange: (f: UserFilter) => Promise<void>;
    submitDelete: (id: string) => Promise<void>;
    submitResetPassword: (username: string) => Promise<void>;
    submitResetTwoFactor: (username: string) => Promise<void>;
    totalData: number;
    // The ticked rows (ids), for the bulk actions.
    selected: string[];
    onToggle: (id: string) => void;
    onToggleAll: (checked: boolean) => void;
};

const STATUS_VARIANT: Record<string, 'green' | 'gray' | 'red' | 'orange'> = {
    ACTIVED: 'green',
    INACTIVED: 'gray',
    BLOCKED: 'red',
    SUSPEND: 'orange',
    CLOSED: 'gray',
};

export default function UserTable({ rows, filter, totalPages, onPageChange, submitDelete, submitResetPassword, submitResetTwoFactor, totalData, selected, onToggle, onToggleAll }: Properties) {
    const t = useT();
    return (
        <>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[900px]">
                        <TableComponent>
                            <TableHeader>
                                <TableRow>
                                    <TableCell isHeader>
                                        <input type="checkbox" aria-label={t('Select all')} checked={rows.length > 0 && rows.every(r => selected.includes(r.id || ''))}
                                            onChange={(e) => onToggleAll(e.target.checked)} />
                                    </TableCell>
                                    <TableCell isHeader>No</TableCell>
                                    <TableCell isHeader>{t('Username')}</TableCell>
                                    <TableCell isHeader>{t('Name')}</TableCell>
                                    <TableCell isHeader>{t('Email')}</TableCell>
                                    <TableCell isHeader>{t('Roles')}</TableCell>
                                    <TableCell isHeader>{t('Status')}</TableCell>
                                    <TableCell isHeader>{t('Date')}</TableCell>
                                    <TableCell isHeader>{t('Action')}</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row, idx) => (
                                    <TableRow key={row.id}>
                                        <TableCell>
                                            <input type="checkbox" aria-label={t('Select {name}', { name: row.username || '' })} checked={selected.includes(row.id || '')}
                                                onChange={() => onToggle(row.id || '')} />
                                        </TableCell>
                                        <TableCell>{(idx + 1) + (filter.offset || 0)}</TableCell>
                                        <TableCell>{row.username}</TableCell>
                                        <TableCell>{row.fullName || '-'}</TableCell>
                                        <TableCell>{row.email || '-'}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {(row.roles || []).map(role => (
                                                    <BadgeComponent key={role.id} variant="blue">{role.name}</BadgeComponent>
                                                ))}
                                                {(row.roles || []).length === 0 && <span className="text-gray-400">-</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <BadgeComponent variant={STATUS_VARIANT[row.status || ''] || 'gray'}>
                                                {row.status}
                                            </BadgeComponent>
                                        </TableCell>
                                        <TableCell>{formatDate(row.registered || '', 'DD/MM/YYYY HH:mm:ss')}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        await submitResetPassword(row.username || '');
                                                    }}
                                                    className="p-1 rounded bg-brand-500 hover:bg-brand-200 cursor-pointer"
                                                    title={t('Reset password')}
                                                >
                                                    <KeyRound className="h-4 w-4" />
                                                </button>
                                                {row.twoFactorAuth && (
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            await submitResetTwoFactor(row.username || '');
                                                        }}
                                                        className="p-1 rounded bg-brand-500 hover:bg-brand-200 cursor-pointer"
                                                        title={t('Reset two-factor authentication')}
                                                    >
                                                        <ShieldOff className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        await submitDelete(row.id || '');
                                                    }}
                                                    className="p-1 rounded bg-red-500 hover:bg-red-200 cursor-pointer"
                                                    title={t('Delete user')}
                                                >
                                                    <X className="h-4 w-4" />
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
            {rows && rows.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                    {t('User has no record.')}
                </div>
            )}

            {rows && rows.length > 0 && (
                <div className="flex justify-center mt-4">
                    <PaginationComponent
                        filterData={filter}
                        totalPages={totalPages}
                        limitPerPage={filter.limit || 10}
                        onPageChange={onPageChange}
                        totalData={totalData}
                    />
                </div>
            )}
        </>
    );
}
