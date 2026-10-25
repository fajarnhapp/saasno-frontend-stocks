"use client";

import { useEffect, useState } from "react";
import { useModal } from "@/context/ModalContext";
import RoleForm from "./RoleCreateForm";
import RoleTable from "./RoleTable";
import RoleFilterForm from "./RoleFilterForm";
import { useCsrf } from "@/context/CsrfContext";
import { useLoading } from "@/context/LoadingCircleContext";
import { Role } from "@/type/role";
import { RoleFilter } from "@/type/filter/RoleFilter";
import { BaseFilter, DEFAULT_FILTER } from "@/type/filter/BaseFilter";
import { createRole, deleteRole, editRole, readRole } from "@/service/roleService";
import { API_MSG_SUCCESS, handleResponseApi, handleResponseTable } from "@/utils/responseApiUtils";
import { ResponseTable } from "@/type/common/ResponseTable";
import { ResponseApi } from "@/type/common/ResponseApi";
import FilterAndAddButton from "../ui/FilterAndAddButton";
import LoadingContent from "../ui/LoadingContent";
import { useContentLoading } from "@/hooks/useContentLoading";
import { useDownloadQueue } from "@/context/DownloadQueueContext";

export default function RoleComponent() {

    const { showConfirm, showModal, contentModalSuccess, contentModalError } = useModal();
    const { handleLoading } = useLoading();
    const { isFetching, withFetching } = useContentLoading();
    const { csrf, setCsrf } = useCsrf();
    const { enqueue } = useDownloadQueue();
    const [refetch, setRefetch] = useState<boolean>(false);
    const [hasLoadedOnce, setHasLoadedOnce] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<string>('TABLE');
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [filter, setFilter] = useState<RoleFilter>(DEFAULT_FILTER);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalData, setTotalData] = useState<number>(0);

    useEffect((): void => {
        const fetchData: () => Promise<void> = async (): Promise<void> => {
            await withFetching(async () => {
                const response: Response = await readRole(filter, setCsrf);
                const data: ResponseTable<Role[]> = await handleResponseTable<ResponseTable<Role[]>>(response);
                setRoles(data.data || []);
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

    const submit = async (request: Role) => {
        const perfomCreate = async (): Promise<void> => {
            await handleLoading(async () => {
                const response: Response = await createRole(request, csrf, setCsrf);
                const data: ResponseApi<Role> = await handleResponseApi<ResponseApi<Role>>(response);
                if (data.message === API_MSG_SUCCESS) {
                    setViewMode('TABLE');
                    setRefetch(!refetch);
                    showModal(contentModalSuccess('Success create role'));
                } else {
                    showModal(contentModalError(`${data.message || 'Failed to create role.'}`));
                }
            });
        };

        showConfirm(
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold mb-2">Role create confirmation</h3>
                <p className="mb-4">Are you sure you want to create this role?</p>
            </div>,
            async () => {
                await perfomCreate();
            },
            'Yes',
            'Cancel'
        );
    }

    const handleEdit = (row: Role) => {
        setSelectedRole(row);
        setViewMode('FORM');
    };

    const openFormMode = (mode: string) => {
        setSelectedRole(null);
        setViewMode(mode);
    };

    const submitEdit = async (request: Role) => {
        const perfomEdit = async (): Promise<void> => {
            await handleLoading(async () => {
                const response: Response = await editRole(request, csrf, setCsrf);
                const data: ResponseApi<Role> = await handleResponseApi<ResponseApi<Role>>(response);
                if (data.message === API_MSG_SUCCESS) {
                    setSelectedRole(null);
                    setViewMode('TABLE');
                    setRefetch(!refetch);
                    showModal(contentModalSuccess('Success update role'));
                } else {
                    showModal(contentModalError(`${data.message || 'Failed to update role.'}`));
                }
            });
        };

        showConfirm(
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold mb-2">Role edit confirmation</h3>
                <p className="mb-4">Are you sure you want to update this role?</p>
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
                const response: Response = await deleteRole(id, csrf, setCsrf);
                const data: ResponseApi<Role> = await handleResponseApi<ResponseApi<Role>>(response);
                if (data.message === API_MSG_SUCCESS) {
                    setViewMode('TABLE');
                    setRefetch(!refetch);
                    showModal(contentModalSuccess('Success delete role'));
                } else {
                    showModal(contentModalError(`${data.message || 'Failed to delete role.'}`));
                }
            });
        };

        showConfirm(
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold mb-2">Role delete confirmation</h3>
                <p className="mb-4">Are you sure you want to delete this role?</p>
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

        const data = await enqueue('ROLE_EXPORT', format, filterParams);
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
            {viewMode === "FORM" && (
                <RoleForm
                    setViewMode={setViewMode}
                    submitCreate={submit}
                    submitEdit={submitEdit}
                    selected={selectedRole}
                />
            )}

            {/* FILTER */}
            {viewMode === "FILTER" &&
                <RoleFilterForm
                    filter={filter}
                    setViewMode={setViewMode}
                    setFilter={setFilter}
                />
            }

            {/* TABLE */}
            {isFetching && !hasLoadedOnce ? (
                <LoadingContent />
            ) : (
                <RoleTable
                    rows={roles}
                    filter={filter}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    submitDelete={submitDelete}
                    onEdit={handleEdit}
                    totalData={totalData}
                />
            )}
        </>
    );
}
