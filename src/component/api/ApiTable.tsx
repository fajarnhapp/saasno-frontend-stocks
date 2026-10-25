import { Api } from "@/type/api";
import { BaseFilter } from "@/type/filter/BaseFilter";
import { TableBody, TableCell, TableComponent, TableHeader, TableRow } from "../ui/TableComponent";
import { formatDate } from "@/utils/formatterUtils";
import { Fragment, ReactNode } from 'react';
import PaginationComponent from "../ui/PaginationComponent";
import InlineEditorRow from '../ui/InlineEditorRow';
import { Pencil, X } from "lucide-react";
import MethodBadge from "../ui/MethodBadge";
import PathLink from "../ui/PathLink";

type Properties = {
    rows: Api[];
    filter: BaseFilter;
    totalPages: number;
    onPageChange: (f: BaseFilter) => Promise<void>;
    submitDelete: (id: string) => Promise<void>;
    onEdit: (row: Api) => void;
    // The edit form opens right under the row being edited, so it appears where the user clicked.
    selectedId?: string;
    editor?: ReactNode;
    totalData: number;
};

export default function ApiTable({ rows, filter, totalPages, onPageChange, submitDelete, onEdit, totalData, selectedId, editor }: Properties) {
    return (
        <>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="@container max-w-full overflow-x-auto">
                    <div className="min-w-[760px]">
                        <TableComponent>
                            <TableHeader>
                                <TableRow>
                                    <TableCell isHeader>No</TableCell>
                                    <TableCell isHeader>Name</TableCell>
                                    <TableCell isHeader>ID</TableCell>
                                    <TableCell isHeader>Method</TableCell>
                                    <TableCell isHeader>Path</TableCell>
                                    <TableCell isHeader>Date</TableCell>
                                    <TableCell isHeader>Action</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row, idx) => (
                                    <Fragment key={row.id}>
                                        <TableRow className={selectedId === row.id ? 'bg-brand-50/40' : ''}>
                                        <TableCell>{(idx + 1) + (filter.offset || 0)}</TableCell>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>{row.id}</TableCell>
                                        <TableCell><MethodBadge method={row.method} /></TableCell>
                                        <TableCell><PathLink path={row.path} /></TableCell>
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
                                    {selectedId === row.id && editor && (
                                        <InlineEditorRow colSpan={7}>{editor}</InlineEditorRow>
                                    )}
                                    </Fragment>
                                ))}
                            </TableBody>
                        </TableComponent>
                    </div>
                </div>
            </div>
            {rows && rows.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                    API has no record.
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
