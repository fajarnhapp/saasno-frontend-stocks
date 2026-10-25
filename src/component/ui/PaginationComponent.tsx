'use client';

import { BaseFilter } from "@/type/filter/BaseFilter";
import { useState } from "react";
import { useT } from "@/context/LanguageContext";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface Properties<T extends BaseFilter> {
    filterData: T;
    totalPages: number;
    limitPerPage: number;
    onPageChange: (newFilter: T) => Promise<void>;
    pagesToShow?: number;
    totalData?: number;
    limitOptions?: number[];
}

export default function PaginationComponent<T extends BaseFilter>({
    filterData,
    totalPages,
    limitPerPage,
    onPageChange,
    pagesToShow = 3,
    totalData = 0,
    limitOptions = [10, 20, 50, 100],
}: Properties<T>) {
    const t = useT();
    const [currentPage, setCurrentPage] = useState(1);

    // Reset ke halaman 1 saat totalData berubah (mis. filter berubah) — di-adjust langsung
    // saat render (bukan lewat effect) mengikuti pola resmi React untuk "adjust state on prop change".
    const [prevTotalData, setPrevTotalData] = useState(totalData);
    if (totalData !== prevTotalData) {
        setPrevTotalData(totalData);
        setCurrentPage(1);
    }

    const pagesAroundCurrent = Array.from(
        { length: Math.min(pagesToShow, totalPages) },
        (_, i) => i + Math.max(currentPage - 1, 1)
    );

    const handlePagination = async (page: number) => {
        if (page < 1 || page > totalPages || page === currentPage) return;
        setCurrentPage(page);
        const newFilter: T = {
            ...filterData,
            offset: (page - 1) * limitPerPage,
        };
        await onPageChange(newFilter);
    };

    const handleLimitChange = async (newLimit: number) => {
        setCurrentPage(1);
        const newFilter: T = {
            ...filterData,
            limit: newLimit,
            offset: 0,
        };
        await onPageChange(newFilter);
    };

    const fromData = totalData === 0 ? 0 : (currentPage - 1) * limitPerPage + 1;
    const toData = Math.min(currentPage * limitPerPage, totalData);

    return (
        <div className="grid w-full gap-4 grid-cols-1 md:grid-cols-3 items-center rounded-xl">

            {/* Pojok Kiri: Info Data */}
            <div className="text-center md:text-left text-sm text-gray-500">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600">
                    {t('Showing {from} - {to} of {total} data', { from: fromData, to: toData, total: totalData })}
                </span>
            </div>

            {/* Tengah: Tombol Paginasi */}
            <div className="flex w-full justify-center">
                <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-200/60">

                    {/* First Page */}
                    <button
                        onClick={() => handlePagination(1)}
                        disabled={currentPage === 1}
                        title="First Page"
                        className="p-2 h-9 w-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-600 disabled:cursor-not-allowed cursor-pointer transition"
                    >
                        <ChevronsLeft size={16} />
                    </button>

                    {/* Previous Page */}
                    <button
                        onClick={() => handlePagination(currentPage - 1)}
                        disabled={currentPage === 1}
                        title="Previous Page"
                        className="p-2 h-9 w-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-600 disabled:cursor-not-allowed cursor-pointer transition"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {/* Pages */}
                    {currentPage > 2 && <span className="px-1 text-gray-400 text-sm font-medium">...</span>}

                    {pagesAroundCurrent.map((page) =>
                        page <= totalPages ? (
                            <button
                                key={page}
                                onClick={() => handlePagination(page)}
                                className={`h-9 w-9 flex items-center justify-center rounded-lg text-sm font-semibold transition ${currentPage === page
                                    ? "bg-brand-500 text-white shadow-sm shadow-brand-500/20"
                                    : "text-gray-600 hover:bg-white hover:text-brand-500 border border-transparent hover:border-gray-200 cursor-pointer"
                                    }`}
                            >
                                {page}
                            </button>
                        ) : null
                    )}

                    {currentPage < totalPages - 1 && <span className="px-1 text-gray-400 text-sm font-medium">...</span>}

                    {/* Next Page */}
                    <button
                        onClick={() => handlePagination(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        title="Next Page"
                        className="p-2 h-9 w-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-600 disabled:cursor-not-allowed cursor-pointer transition"
                    >
                        <ChevronRight size={16} />
                    </button>

                    {/* Last Page */}
                    <button
                        onClick={() => handlePagination(totalPages)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        title="Last Page"
                        className="p-2 h-9 w-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-600 disabled:cursor-not-allowed cursor-pointer transition"
                    >
                        <ChevronsRight size={16} />
                    </button>
                </div>
            </div>

            {/* Pojok Kanan: Dropdown Limit */}
            <div className="flex items-center justify-center md:justify-end gap-2 text-sm text-gray-500">
                <span className="text-xs font-medium text-gray-500">{t('Show')}</span>
                <select
                    value={limitPerPage}
                    onChange={(e) => handleLimitChange(Number(e.target.value))}
                    className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 outline-none cursor-pointer hover:border-brand-300 focus:border-brand-500"
                >
                    {limitOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                <span className="text-xs font-medium text-gray-500">{t('/ page')}</span>
            </div>

        </div>
    );
}