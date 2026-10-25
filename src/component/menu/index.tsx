"use client";

import { useEffect, useState } from "react";
import { useModal } from "@/context/ModalContext";
import MenuForm from "./MenuCreateForm";
import MenuFilterForm from "./MenuFilterForm";
import MenuTable from "./MenuTable";
import { useCsrf } from "@/context/CsrfContext";
import { useLoading } from "@/context/LoadingCircleContext";
import { Menu } from "@/type/menu";
import { MenuFilter } from "@/type/filter/MenuFilter";
import { BaseFilter, DEFAULT_FILTER } from "@/type/filter/BaseFilter";
import { createMenu, deleteMenu, editMenu, readMenu } from "@/service/menuService";
import { API_MSG_SUCCESS, handleResponseApi, handleResponseTable } from "@/utils/responseApiUtils";
import { ResponseTable } from "@/type/common/ResponseTable";
import { ResponseApi } from "@/type/common/ResponseApi";
import FilterAndAddButton from "../ui/FilterAndAddButton";
import LoadingContent from "../ui/LoadingContent";
import { useContentLoading } from "@/hooks/useContentLoading";
import { useDownloadQueue } from "@/context/DownloadQueueContext";

export default function MenuComponent() {
    const { showConfirm, showModal, contentModalSuccess, contentModalError } = useModal();
    const { handleLoading } = useLoading();
    const { isFetching, withFetching } = useContentLoading();
    const { csrf, setCsrf } = useCsrf();
    const { enqueue } = useDownloadQueue();
    const [refetch, setRefetch] = useState<boolean>(false);
    const [hasLoadedOnce, setHasLoadedOnce] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<string>('TABLE');
    const [menus, setMenus] = useState<Menu[]>([]);
    const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
    const [filter, setFilter] = useState<MenuFilter>(DEFAULT_FILTER);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalData, setTotalData] = useState<number>(0);

    useEffect((): void => {
        const fetchData: () => Promise<void> = async (): Promise<void> => {
            await withFetching(async () => {
                const response: Response = await readMenu(filter, setCsrf);
                const data: ResponseTable<Menu[]> = await handleResponseTable<ResponseTable<Menu[]>>(response);
                setMenus(data.data || []);
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

    const submit = async (request: Menu) => {
        const perfomCreate = async (): Promise<void> => {
            await handleLoading(async () => {
                const response: Response = await createMenu(request, csrf, setCsrf);
                const data: ResponseApi<Menu> = await handleResponseApi<ResponseApi<Menu>>(response);
                if (data.message === API_MSG_SUCCESS) {
                    setViewMode('TABLE');
                    setRefetch(!refetch);
                    showModal(contentModalSuccess('Success create menu'));
                } else {
                    showModal(contentModalError(`${data.message || 'Failed to create menu.'}`));
                }
            });
        };

        showConfirm(
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold mb-2">Menu create confirmation</h3>
                <p className="mb-4">Are you sure you want to create this menu?</p>
            </div>,
            async () => {
                await perfomCreate();
            },
            'Yes',
            'Cancel'
        );
    }

    const handleEdit = (row: Menu) => {
        setSelectedMenu(row);
        setViewMode('FORM');
    };

    const openFormMode = (mode: string) => {
        setSelectedMenu(null);
        setViewMode(mode);
    };

    const submitEdit = async (request: Menu) => {
        const perfomEdit = async (): Promise<void> => {
            await handleLoading(async () => {
                const response: Response = await editMenu(request, csrf, setCsrf);
                const data: ResponseApi<Menu> = await handleResponseApi<ResponseApi<Menu>>(response);
                if (data.message === API_MSG_SUCCESS) {
                    setSelectedMenu(null);
                    setViewMode('TABLE');
                    setRefetch(!refetch);
                    showModal(contentModalSuccess('Success update menu'));
                } else {
                    showModal(contentModalError(`${data.message || 'Failed to update menu.'}`));
                }
            });
        };

        showConfirm(
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold mb-2">Menu edit confirmation</h3>
                <p className="mb-4">Are you sure you want to update this menu?</p>
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
                const menuResponse: Response = await deleteMenu(id, csrf, setCsrf);
                const data: ResponseApi<Menu> = await handleResponseApi<ResponseApi<Menu>>(menuResponse);
                if (data.message === API_MSG_SUCCESS) {
                    setViewMode('TABLE');
                    setRefetch(!refetch);
                    showModal(contentModalSuccess('Success delete menu'));
                } else {
                    showModal(contentModalError(`${data.message || 'Failed to delete menu.'}`));
                }
            });
        };

        showConfirm(
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold mb-2">Menu delete confirmation</h3>
                <p className="mb-4">Are you sure you want to delete this menu?</p>
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

        const data = await enqueue('MENU_EXPORT', format, filterParams);
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
            {viewMode === "FORM" && !selectedMenu &&
                <MenuForm
                    setViewMode={setViewMode}
                    submitCreate={submit}
                />
            }

            {/* FILTER */}
            {viewMode === "FILTER" &&
                <MenuFilterForm
                    filter={filter}
                    setViewMode={setViewMode}
                    setFilter={setFilter}
                />
            }

            {/* TABLE */}
            {isFetching && !hasLoadedOnce ? (
                <LoadingContent />
            ) : (
                <MenuTable
                    rows={menus}
                    filter={filter}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    submitDelete={submitDelete}
                    onEdit={handleEdit}
                    selectedId={viewMode === "FORM" ? selectedMenu?.id : undefined}
                    editor={viewMode === "FORM" && selectedMenu ? (
                        <MenuForm
                            key={selectedMenu.id}
                            setViewMode={setViewMode}
                            submitCreate={submit}
                            submitEdit={submitEdit}
                            selected={selectedMenu}
                        />
                    ) : undefined}
                    totalData={totalData}
                />
            )}
        </>
    );
}
