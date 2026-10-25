"use client";

import { useEffect, useState } from "react";
import { useCsrf } from "@/context/CsrfContext";
import { useModal } from "@/context/ModalContext";
import { useDownloadQueue } from "@/context/DownloadQueueContext";
import { AuditLog } from "@/type/log";
import { AuditLogFilter } from "@/type/filter/AuditLogFilter";
import { BaseFilter, DEFAULT_FILTER } from "@/type/filter/BaseFilter";
import { API_MSG_SUCCESS, handleResponseTable } from "@/utils/responseApiUtils";
import { ResponseTable } from "@/type/common/ResponseTable";
import { readAuditLog } from "@/service/auditLogService";
import FilterAndAddButton from "../ui/FilterAndAddButton";
import LoadingContent from "../ui/LoadingContent";
import { useContentLoading } from "@/hooks/useContentLoading";
import AuditLogTable from "./AuditLogTable";
import AuditLogFilterForm from "./AuditLogFilterForm";
import AuditLogChart from "./AuditLogChart";

export default function AuditLogComponent() {
    const { isFetching, withFetching } = useContentLoading();
    const { setCsrf } = useCsrf();
    const { showModal, contentModalError } = useModal();
    const { enqueue } = useDownloadQueue();
    const [hasLoadedOnce, setHasLoadedOnce] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<string>('TABLE');
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [filter, setFilter] = useState<AuditLogFilter>(DEFAULT_FILTER);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalData, setTotalData] = useState<number>(0);

    useEffect((): void => {
        const fetchData: () => Promise<void> = async (): Promise<void> => {
            await withFetching(async () => {
                const response: Response = await readAuditLog(filter, setCsrf);
                const data: ResponseTable<AuditLog[]> = await handleResponseTable<ResponseTable<AuditLog[]>>(response);
                setLogs(data.data || []);
                const total = data.grandTotal || 0;
                setTotalData(total);
                setTotalPages(Math.ceil(total / (filter.limit || 10)));
            });
            setHasLoadedOnce(true);
        };
        fetchData();
    }, [filter, withFetching, setCsrf]);

    const handlePageChange: (newFilter: BaseFilter) => Promise<void> = async (newFilter: BaseFilter): Promise<void> => {
        setFilter(newFilter);
    };

    const handleDownload = async (format: 'csv' | 'excel') => {
        const { limit, offset, ...rest } = filter;
        void limit;
        void offset;
        const filterParams: Record<string, string> = {};
        Object.entries(rest).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                filterParams[key] = String(value);
            }
        });

        const data = await enqueue('LOG_EXPORT', format, filterParams);
        if (data.message !== API_MSG_SUCCESS) {
            showModal(contentModalError(`${data.message || 'Failed to create download job.'}`));
        }
    };

    return (
        <>
            {/* ACTION BUTTON */}
            <FilterAndAddButton
                setViewMode={setViewMode}
                viewMode={viewMode}
                showAddButton={false}
                showDownload
                onDownload={handleDownload}
            />

            {/* FILTER */}
            {viewMode === "FILTER" &&
                <AuditLogFilterForm
                    filter={filter}
                    setViewMode={setViewMode}
                    setFilter={setFilter}
                />
            }

            {/* CHART */}
            <AuditLogChart />

            {/* TABLE */}
            {isFetching && !hasLoadedOnce ? (
                <LoadingContent />
            ) : (
                <AuditLogTable
                    rows={logs}
                    filter={filter}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    totalData={totalData}
                />
            )}
        </>
    );
}
