'use client';

import { ReactNode, useState } from 'react';
import { useT } from '@/context/LanguageContext';
import ButtonComponent from './ButtonComponent';
import { Plus, Filter, ArrowLeft, X, Download } from 'lucide-react';

export interface FilterAndAddButtonProps {
    setViewMode: (mode: string) => void;
    viewMode: string;
    showAddButton?: boolean;
    showFilterButton?: boolean;
    // Extra buttons shown before the others (for example Import and Trash).
    extra?: ReactNode;
    showDownload?: boolean;
    onDownload?: (format: 'csv' | 'excel') => void;
}

export default function FilterAndAddButton({
    setViewMode,
    viewMode,
    showAddButton = true,
    showFilterButton = true,
    extra,
    showDownload = false,
    onDownload,
}: FilterAndAddButtonProps) {
    const t = useT();
    const [format, setFormat] = useState<'csv' | 'excel'>('csv');

    return (
        <div className="w-full mb-4 flex flex-col sm:flex-row sm:flex-wrap sm:justify-end gap-2">
            {extra}

            {showDownload && (
                <div className="flex w-full items-stretch overflow-hidden rounded-xl border border-gray-200 sm:w-fit">
                    <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value as 'csv' | 'excel')}
                        className="flex-1 cursor-pointer border-r border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none sm:flex-initial"
                    >
                        <option value="csv">CSV</option>
                        <option value="excel">Excel</option>
                    </select>
                    <button
                        type="button"
                        onClick={() => onDownload?.(format)}
                        className="flex shrink-0 cursor-pointer items-center justify-center gap-1.5 bg-white px-4 py-2 text-sm font-medium whitespace-nowrap text-brand-600 transition hover:bg-brand-600 hover:text-white"
                    >
                        <Download size={16} />
                        <span>{t('Download')}</span>
                    </button>
                </div>
            )}

            {showAddButton && (
                <div className="w-full sm:w-fit">
                    <ButtonComponent onClick={(): void => setViewMode(viewMode !== 'FORM' ? 'FORM' : 'TABLE')}>
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                            {viewMode === 'FORM' ? (
                                <>
                                    <ArrowLeft size={16} />
                                    <span>{t('Back')}</span>
                                </>
                            ) : (
                                <>
                                    <Plus size={16} />
                                    <span>{t('Add')}</span>
                                </>
                            )}
                        </div>
                    </ButtonComponent>
                </div>
            )}

            {showFilterButton && <div className="w-full sm:w-fit">
                <ButtonComponent
                    variant="outlineViolet"
                    onClick={(): void => setViewMode(viewMode !== 'FILTER' ? 'FILTER' : 'TABLE')}
                >
                    <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                        {viewMode === 'FILTER' ? (
                            <>
                                <X size={16} />
                                <span>{t('Close')}</span>
                            </>
                        ) : (
                            <>
                                <Filter size={16} />
                                <span>{t('Filter')}</span>
                            </>
                        )}
                    </div>
                </ButtonComponent>
            </div>}
        </div>
    );
}
