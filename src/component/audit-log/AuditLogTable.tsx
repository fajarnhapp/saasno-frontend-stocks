'use client';

import { Fragment, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { AuditLog } from '@/type/log';
import { BaseFilter } from '@/type/filter/BaseFilter';
import { formatDate } from '@/utils/formatterUtils';
import { TableBody, TableCell, TableComponent, TableHeader, TableRow } from '../ui/TableComponent';
import PaginationComponent from '../ui/PaginationComponent';
import MethodBadge from '../ui/MethodBadge';
import RequestBodyView from './RequestBodyView';

type Properties = {
    rows: AuditLog[];
    filter: BaseFilter;
    totalPages: number;
    onPageChange: (f: BaseFilter) => Promise<void>;
    totalData: number;
};

const COLUMN_COUNT = 8;

function statusClass(status?: number): string {
    if (!status) return 'bg-gray-100 text-gray-700 border-gray-200';
    if (status < 300) return 'bg-green-100 text-green-700 border-green-200';
    if (status < 400) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (status < 500) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-red-100 text-red-700 border-red-200';
}

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</div>
            <div className="text-sm text-gray-800">{children}</div>
        </div>
    );
}

export default function AuditLogTable({ rows, filter, totalPages, onPageChange, totalData }: Properties) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    return (
        <>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[900px]">
                        <TableComponent>
                            <TableHeader>
                                <TableRow>
                                    <TableCell isHeader className="w-10"><span className="sr-only">Expand</span></TableCell>
                                    <TableCell isHeader>No</TableCell>
                                    <TableCell isHeader>Username</TableCell>
                                    <TableCell isHeader>Method</TableCell>
                                    <TableCell isHeader>URI</TableCell>
                                    <TableCell isHeader>IP</TableCell>
                                    <TableCell isHeader>Status</TableCell>
                                    <TableCell isHeader>Date</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row, idx) => {
                                    const isExpanded = expandedId === row.id;
                                    return (
                                        <Fragment key={row.id}>
                                            <TableRow
                                                onClick={() => setExpandedId(isExpanded ? null : row.id ?? null)}
                                                className={isExpanded ? 'bg-brand-50/60' : ''}
                                            >
                                                <TableCell>
                                                    {isExpanded
                                                        ? <ChevronDown className="h-4 w-4 text-brand-600" />
                                                        : <ChevronRight className="h-4 w-4 text-gray-400" />}
                                                </TableCell>
                                                <TableCell>{(idx + 1) + (filter.offset || 0)}</TableCell>
                                                <TableCell>{row.username || '-'}</TableCell>
                                                <TableCell><MethodBadge method={row.method} /></TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-xs break-all">{row.uri}</span>
                                                </TableCell>
                                                <TableCell><span className="font-mono text-xs">{row.clientIp}</span></TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${statusClass(row.statusCode)}`}>
                                                        {row.statusCode ?? '-'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{formatDate(row.registered || '', 'DD/MM/YYYY HH:mm:ss')}</TableCell>
                                            </TableRow>
                                            {isExpanded && (
                                                <tr className="bg-gray-50/70">
                                                    <td colSpan={COLUMN_COUNT} className="px-6 py-5">
                                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                            <DetailItem label="User ID">
                                                                <span className="font-mono text-xs break-all">{row.userId || '-'}</span>
                                                            </DetailItem>
                                                            <DetailItem label="Name">{row.personName || '-'}</DetailItem>
                                                        </div>
                                                        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                                                            <DetailItem label="Trace ID">
                                                                <span className="font-mono text-xs break-all">{row.traceId || '-'}</span>
                                                            </DetailItem>
                                                            <DetailItem label="Execution Time">{row.executionTimeMs ?? '-'} ms</DetailItem>
                                                            <DetailItem label="Error Message">
                                                                <span className={row.errorMessage ? 'text-red-600' : 'text-gray-400'}>
                                                                    {row.errorMessage || '-'}
                                                                </span>
                                                            </DetailItem>
                                                        </div>
                                                        <div className="mt-5 grid grid-cols-1 gap-4">
                                                            <DetailItem label="Request Param">
                                                                {row.requestParam
                                                                    ? <span className="font-mono text-xs break-all">{row.requestParam}</span>
                                                                    : <span className="text-gray-400">-</span>}
                                                            </DetailItem>
                                                            <DetailItem label="Request Body">
                                                                <div className="rounded-lg border border-gray-200 bg-white p-3">
                                                                    <RequestBodyView body={row.requestBody} />
                                                                </div>
                                                            </DetailItem>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })}
                            </TableBody>
                        </TableComponent>
                    </div>
                </div>
            </div>
            {rows && rows.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                    Audit log has no record.
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
