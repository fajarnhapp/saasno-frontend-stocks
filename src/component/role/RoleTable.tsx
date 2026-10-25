'use client';

import { TableComponent, TableBody, TableCell, TableHeader, TableRow } from '../ui/TableComponent';
import { BaseFilter } from '@/type/filter/BaseFilter';
import { RoleFilter } from '@/type/filter/RoleFilter';
import { Role } from '@/type/role';
import { formatDate } from '@/utils/formatterUtils';
import { Pencil, X } from 'lucide-react';
import PaginationComponent from '../ui/PaginationComponent';

type Properties = {
    rows: Role[];
    filter: BaseFilter;
    totalPages: number;
    onPageChange: (f: RoleFilter) => Promise<void>;
    submitDelete: (id: string) => Promise<void>;
    onEdit: (row: Role) => void;
    totalData: number;
};

export default function RoleTable({ rows, filter, totalPages, onPageChange, submitDelete, onEdit, totalData }: Properties) {
    return (
        <>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[600px]">
                        <TableComponent>
                            <TableHeader>
                                <TableRow>
                                    <TableCell isHeader>No</TableCell>
                                    <TableCell isHeader>Id</TableCell>
                                    <TableCell isHeader>Name</TableCell>
                                    <TableCell isHeader>Date</TableCell>
                                    <TableCell isHeader>Action</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row, idx) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{(idx + 1) + (filter.offset || 0)}</TableCell>
                                        <TableCell>{row.id}</TableCell>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>{formatDate(row.registered || '', 'DD/MM/YYYY HH:mm:ss')}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEdit(row);
                                                    }}
                                                    className="p-1 rounded border border-brand-500 bg-white text-brand-600 hover:bg-brand-600 hover:text-white cursor-pointer"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        await submitDelete(row.id || '');
                                                    }}
                                                    className="p-1 rounded border border-brand-500 bg-white text-brand-600 hover:bg-brand-600 hover:text-white cursor-pointer"
                                                    title="Cancel request"
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
                    Role has no record.
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
