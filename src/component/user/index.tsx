"use client";

import { useEffect, useState } from "react";
import { useModal } from "@/context/ModalContext";
import UserCreateForm from "./UserCreateForm";
import UserTable from "./UserTable";
import UserFilterForm from "./UserFilterForm";
import { useCsrf } from "@/context/CsrfContext";
import { useLoading } from "@/context/LoadingCircleContext";
import { User } from "@/type/user";
import { UserFilter } from "@/type/filter/UserFilter";
import { BaseFilter, DEFAULT_FILTER } from "@/type/filter/BaseFilter";
import { BulkActionResult, bulkUserAction, createUser, deleteUser, readUser, resetPassword, resetTwoFactor } from "@/service/userService";
import UserBulkBar, { BULK_ACTIONS } from "./UserBulkBar";
import UserImportPanel from "./UserImportPanel";
import UserTrash from "./UserTrash";
import ButtonComponent from "../ui/ButtonComponent";
import { FileUp, Trash2 } from "lucide-react";
import { API_MSG_SUCCESS, handleResponseApi, handleResponseTable } from "@/utils/responseApiUtils";
import { ResponseTable } from "@/type/common/ResponseTable";
import { ResponseApi } from "@/type/common/ResponseApi";
import FilterAndAddButton from "../ui/FilterAndAddButton";
import LoadingContent from "../ui/LoadingContent";
import { useContentLoading } from "@/hooks/useContentLoading";
import { useDownloadQueue } from "@/context/DownloadQueueContext";
import { useT } from '@/context/LanguageContext';

export default function UserComponent() {
    const t = useT();

    const { showConfirm, showModal, contentModalSuccess, contentModalError } = useModal();
    const { handleLoading } = useLoading();
    const { isFetching, withFetching } = useContentLoading();
    const { csrf, setCsrf } = useCsrf();
    const { enqueue } = useDownloadQueue();
    const [refetch, setRefetch] = useState<boolean>(false);
    const [hasLoadedOnce, setHasLoadedOnce] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<string>('TABLE');
    const [users, setUsers] = useState<User[]>([]);
    const [filter, setFilter] = useState<UserFilter>(DEFAULT_FILTER);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalData, setTotalData] = useState<number>(0);
    const [selected, setSelected] = useState<string[]>([]);

    useEffect((): void => {
        const fetchData: () => Promise<void> = async (): Promise<void> => {
            await withFetching(async () => {
                const response: Response = await readUser(filter, setCsrf);
                const data: ResponseTable<User[]> = await handleResponseTable<ResponseTable<User[]>>(response);
                setUsers(data.data || []);
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

    const submit = async (request: User) => {
        const perfomCreate = async (): Promise<void> => {
            await handleLoading(async () => {
                const response: Response = await createUser(request, csrf, setCsrf);
                const data: ResponseApi<User> = await handleResponseApi<ResponseApi<User>>(response);
                if (data.message === API_MSG_SUCCESS) {
                    setViewMode('TABLE');
                    setRefetch(!refetch);
                    showModal(contentModalSuccess(data.data?.activationSent ? t('User created. An email with a link to choose a password was sent to them.') : t('User created, but no email was sent because email is not set up. Set it up, then use Reset password to send the link.')));
                } else {
                    showModal(contentModalError(`${data.message || t('Failed to create user.')}`));
                }
            });
        };

        showConfirm(
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold mb-2">{t('User create confirmation')}</h3>
                <p className="mb-4">{t('Are you sure you want to create this user?')}</p>
            </div>,
            async () => {
                await perfomCreate();
            },
            'Yes',
            'Cancel'
        );
    }

    const submitDelete = async (id: string) => {
        const perfomDelete = async (): Promise<void> => {
            await handleLoading(async () => {
                const response: Response = await deleteUser(id, csrf, setCsrf);
                const data: ResponseApi<User> = await handleResponseApi<ResponseApi<User>>(response);
                if (data.message === API_MSG_SUCCESS) {
                    setViewMode('TABLE');
                    setRefetch(!refetch);
                    showModal(contentModalSuccess(t('User moved to the trash')));
                } else {
                    showModal(contentModalError(`${data.message || t('Failed to delete user.')}`));
                }
            });
        };

        showConfirm(
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold mb-2">{t('Move to trash confirmation')}</h3>
                <p className="mb-4">{t('Move this user to the trash? They cannot sign in any more, and you can restore them from the Trash.')}</p>
            </div>,
            async () => {
                await perfomDelete();
            },
            'Yes',
            'Cancel'
        );
    }

    const submitResetPassword = async (username: string) => {
        const perfomReset = async (): Promise<void> => {
            await handleLoading(async () => {
                const response: Response = await resetPassword(username, csrf, setCsrf);
                const data: ResponseApi<User> = await handleResponseApi<ResponseApi<User>>(response);
                if (data.message === API_MSG_SUCCESS) {
                    showModal(contentModalSuccess(t('The user was signed out and received an email with a link to choose a new password.')));
                } else {
                    showModal(contentModalError(`${data.message || t('Failed to reset password.')}`));
                }
            });
        };

        showConfirm(
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold mb-2">{t('Reset password confirmation')}</h3>
                <p className="mb-4">Reset the password of user <b>{username}</b>? They get an email with a link to choose a new one.</p>
            </div>,
            async () => {
                await perfomReset();
            },
            'Yes',
            'Cancel'
        );
    }

    const submitResetTwoFactor = async (username: string) => {
        const perfomReset = async (): Promise<void> => {
            await handleLoading(async () => {
                const response: Response = await resetTwoFactor(username, csrf, setCsrf);
                const data: ResponseApi<User> = await handleResponseApi<ResponseApi<User>>(response);
                if (data.message === API_MSG_SUCCESS) {
                    setRefetch(!refetch);
                    showModal(contentModalSuccess(t('Two-factor authentication has been reset')));
                } else {
                    showModal(contentModalError(`${data.message || t('Failed to reset two-factor authentication.')}`));
                }
            });
        };

        showConfirm(
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold mb-2">{t('Reset two-factor confirmation')}</h3>
                <p className="mb-4">Turn off two-factor authentication for user <b>{username}</b>? Their recovery codes are deleted and they are signed out. They set it up again at the next login.</p>
            </div>,
            async () => {
                await perfomReset();
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

        const data = await enqueue('USER_EXPORT', format, filterParams);
        if (data.message !== API_MSG_SUCCESS) {
            showModal(contentModalError(`${data.message || t('Failed to create download job.')}`));
        }
    };

    const toggle = (id: string) => setSelected(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
    const toggleAll = (checked: boolean) => {
        const pageIds: string[] = users.map(u => u.id || '');
        setSelected(checked ? Array.from(new Set([...selected, ...pageIds])) : selected.filter(id => !pageIds.includes(id)));
    };

    const submitBulk = (action: string, roleId?: string) => {
        const label: string = t(BULK_ACTIONS.find(a => a.value === action)?.label || action);
        showConfirm(
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold mb-2">{t('Bulk action confirmation')}</h3>
                <p className="mb-4">{t('Apply "{action}" to {count} users?', { action: label, count: selected.length })}</p>
            </div>,
            async () => {
                await handleLoading(async () => {
                    const response: Response = await bulkUserAction(selected, action, roleId, csrf, setCsrf);
                    const data: ResponseApi<BulkActionResult> = await handleResponseApi<ResponseApi<BulkActionResult>>(response);
                    if (data.message === API_MSG_SUCCESS && data.data) {
                        const failed = data.data.items.filter(item => !item.ok);
                        showModal(
                            <div className="flex max-w-md flex-col gap-2">
                                <h3 className="text-lg font-semibold">{t('{ok} done, {failed} failed', { ok: data.data.succeeded, failed: data.data.failed })}</h3>
                                {failed.length > 0 && (
                                    <ul className="max-h-48 list-disc overflow-auto pl-5 text-sm text-red-600">
                                        {failed.map(item => <li key={item.id}>{item.username ? `${item.username}: ` : ''}{t(item.message)}</li>)}
                                    </ul>
                                )}
                            </div>
                        );
                        setSelected([]);
                        setRefetch(!refetch);
                    } else {
                        showModal(contentModalError(data.message || t('The action failed.')));
                    }
                });
            },
            'Yes',
            'Cancel'
        );
    };

    return (
        <>
            {/* ACTION BUTTON */}
            <FilterAndAddButton
                setViewMode={(mode) => { setSelected([]); setViewMode(mode); }}
                viewMode={viewMode}
                showDownload
                onDownload={handleDownload}
                extra={
                    <>
                        <div className="w-full sm:w-fit">
                            <ButtonComponent variant="outline" onClick={() => setViewMode(viewMode === 'IMPORT' ? 'TABLE' : 'IMPORT')}>
                                <div className="flex items-center justify-center gap-1.5 whitespace-nowrap"><FileUp size={16} /><span>{t('Import')}</span></div>
                            </ButtonComponent>
                        </div>
                        <div className="w-full sm:w-fit">
                            <ButtonComponent variant="outline" onClick={() => setViewMode(viewMode === 'TRASH' ? 'TABLE' : 'TRASH')}>
                                <div className="flex items-center justify-center gap-1.5 whitespace-nowrap"><Trash2 size={16} /><span>{viewMode === 'TRASH' ? t('Users') : t('Trash')}</span></div>
                            </ButtonComponent>
                        </div>
                    </>
                }
            />

            {/* FORM */}
            {viewMode === "FORM" && (
                <UserCreateForm
                    setViewMode={setViewMode}
                    submitCreate={submit}
                />
            )}

            {/* FILTER */}
            {viewMode === "FILTER" &&
                <UserFilterForm
                    filter={filter}
                    setViewMode={setViewMode}
                    setFilter={setFilter}
                />
            }

            {/* IMPORT */}
            {viewMode === "IMPORT" && <UserImportPanel onDone={() => setRefetch(!refetch)} />}

            {/* TRASH */}
            {viewMode === "TRASH" && <UserTrash onChanged={() => setRefetch(!refetch)} />}

            {/* BULK ACTIONS */}
            {viewMode !== "TRASH" && selected.length > 0 && (
                <UserBulkBar count={selected.length} onApply={submitBulk} onClear={() => setSelected([])} />
            )}

            {/* TABLE */}
            {viewMode === "TRASH" ? null : isFetching && !hasLoadedOnce ? (
                <LoadingContent />
            ) : (
                <UserTable
                    rows={users}
                    filter={filter}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    submitDelete={submitDelete}
                    submitResetPassword={submitResetPassword}
                    submitResetTwoFactor={submitResetTwoFactor}
                    totalData={totalData}
                    selected={selected}
                    onToggle={toggle}
                    onToggleAll={toggleAll}
                />
            )}
        </>
    );
}
