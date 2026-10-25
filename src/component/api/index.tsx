"use client";

import { useEffect, useState } from "react";
import ApiTable from "./ApiTable";
import ApiFilterForm from "./ApiFilterForm";
import { useModal } from "@/context/ModalContext";
import { useCsrf } from "@/context/CsrfContext";
import { useLoading } from "@/context/LoadingCircleContext";
import { Api } from "@/type/api";
import { ApiFilter } from "@/type/filter/ApiFiter";
import { BaseFilter, DEFAULT_FILTER } from "@/type/filter/BaseFilter";
import { API_MSG_SUCCESS, handleResponseApi, handleResponseTable } from "@/utils/responseApiUtils";
import { ResponseTable } from "@/type/common/ResponseTable";
import { ResponseApi } from "@/type/common/ResponseApi";
import { createApi, deleteApi, editApi, readApi } from "@/service/apiService";
import FilterAndAddButton from "../ui/FilterAndAddButton";
import ApiCreateForm from "./ApiCreateForm";
import LoadingContent from "../ui/LoadingContent";
import { useContentLoading } from "@/hooks/useContentLoading";
import { useDownloadQueue } from "@/context/DownloadQueueContext";

export default function ApiComponent() {
    const { showConfirm, showModal, contentModalSuccess, contentModalError } = useModal();
    const { handleLoading } = useLoading();
    const { isFetching, withFetching } = useContentLoading();
    const { csrf, setCsrf } = useCsrf();
    const { enqueue } = useDownloadQueue();
    const [refetch, setRefetch] = useState<boolean>(false);
    const [hasLoadedOnce, setHasLoadedOnce] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<string>('TABLE');
    const [apis, setApis] = useState<Api[]>([]);
    const [selectedApi, setSelectedApi] = useState<Api | null>(null);
    const [filter, setFilter] = useState<ApiFilter>(DEFAULT_FILTER);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalData, setTotalData] = useState<number>(0);

    useEffect((): void => {
        const fetchData: () => Promise<void> = async (): Promise<void> => {
            await withFetching(async () => {
                const response: Response = await readApi(filter, setCsrf);
                const data: ResponseTable<Api[]> = await handleResponseTable<ResponseTable<Api[]>>(response);
                setApis(data.data || []);
                const total = data.grandTotal || 0;
                setTotalData(total);
                setTotalPages(Math.ceil(total / (filter.limit || 10)));
            });
            setHasLoadedOnce(true);
        };
        fetchData();
    }, [filter, refetch, withFetching, setCsrf]);

    const handlePageChange: (newFilter: BaseFilter) => Promise<void> = async (newFilter: BaseFilter): Promise<void> => {
        setFilter(newFilter);
    };

    const submit = async (request: Api) => {
        const perfomCreate = async (): Promise<void> => {
            await handleLoading(async () => {
                const apiResponse: Response = await createApi(request, csrf, setCsrf);
                const data: ResponseApi<Api> = await handleResponseApi<ResponseApi<Api>>(apiResponse);
                if (data.message === API_MSG_SUCCESS) {
                    showModal(contentModalSuccess('Success create API'));
                    setViewMode('TABLE');
                    setRefetch(!refetch);
                    return;
                }
                showModal(contentModalError(`${data.message || 'Failed to create API.'}`));
            });
        };

        showConfirm(
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold mb-2">API create confirmation</h3>
                <p className="mb-4">Are you sure you want to create this API?</p>
            </div>,
            async () => {
                await perfomCreate();
            },
            'Yes',
            'Cancel'
        );
    }

    const handleEdit = (row: Api) => {
        setSelectedApi(row);
        setViewMode('FORM');
    };

    const openFormMode = (mode: string) => {
        setSelectedApi(null);
        setViewMode(mode);
    };

    const submitEdit = async (request: Api) => {
        const perfomEdit = async (): Promise<void> => {
            await handleLoading(async () => {
                const apiResponse: Response = await editApi(request, csrf, setCsrf);
                const data: ResponseApi<Api> = await handleResponseApi<ResponseApi<Api>>(apiResponse);
                if (data.message === API_MSG_SUCCESS) {
                    showModal(contentModalSuccess('Success update API'));
                    setSelectedApi(null);
                    setViewMode('TABLE');
                    setRefetch(!refetch);
                    return;
                }
                showModal(contentModalError(`${data.message || 'Failed to update API.'}`));
            });
        };

        showConfirm(
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold mb-2">API edit confirmation</h3>
                <p className="mb-4">Are you sure you want to update this API?</p>
            </div>,
            async () => {
                await perfomEdit();
            },
            'Yes',
            'Cancel'
        );
    }

    const submitDelete = async (id: string) => {
        const perfomDelete = async (): Promise<void> => {
            await handleLoading(async () => {
                const apiResponse: Response = await deleteApi(id, csrf, setCsrf);
                const data = await handleResponseApi<ResponseApi<Api>>(apiResponse);
                if (data.message === API_MSG_SUCCESS) {
                    showModal(contentModalSuccess('Success delete API'));
                    setViewMode('TABLE');
                    setRefetch(!refetch);
                    return;
                }
                showModal(contentModalError(`${data.message || 'Failed to delete API.'}`));
            });
        };

        showConfirm(
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold mb-2">API delete confirmation</h3>
                <p className="mb-4">Are you sure you want to delete this API?</p>
            </div>,
            async () => {
                await perfomDelete();
            },
            'Yes',
            'Cancel'
        );

    }

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

        const data = await enqueue('API_EXPORT', format, filterParams);
        if (data.message !== API_MSG_SUCCESS) {
            showModal(contentModalError(`${data.message || 'Failed to create download job.'}`));
        }
    };

    return (
        <>
            {/* ACTION BUTTON */}
            <FilterAndAddButton
                setViewMode={openFormMode}
                viewMode={viewMode}
                showDownload
                onDownload={handleDownload}
            />

            {/* FORM */}
            {viewMode === "FORM" && !selectedApi &&
                <ApiCreateForm
                    setViewMode={setViewMode}
                    submitCreate={submit}
                />
            }

            {/* FILTER */}
            {viewMode === "FILTER" &&
                <ApiFilterForm
                    filter={filter}
                    setViewMode={setViewMode}
                    setFilter={setFilter}
                />
            }

            {/* TABLE */}
            {isFetching && !hasLoadedOnce ? (
                <LoadingContent />
            ) : (
                <ApiTable
                    rows={apis}
                    filter={filter}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    submitDelete={submitDelete}
                    onEdit={handleEdit}
                    selectedId={viewMode === "FORM" ? selectedApi?.id : undefined}
                    editor={viewMode === "FORM" && selectedApi ? (
                        <ApiCreateForm
                            key={selectedApi.id}
                            setViewMode={setViewMode}
                            submitCreate={submit}
                            submitEdit={submitEdit}
                            selected={selectedApi}
                        />
                    ) : undefined}
                    totalData={totalData}
                />
            )}
        </>
    );
}
