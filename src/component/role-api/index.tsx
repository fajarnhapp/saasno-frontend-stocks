"use client";

import { useCallback, useEffect, useState } from "react";
import { useModal } from "@/context/ModalContext";
import { useCsrf } from "@/context/CsrfContext";
import { useLoading } from "@/context/LoadingCircleContext";
import { Api } from "@/type/api";
import { RoleApi } from "@/type/role-api";
import { RoleAssignmentResult } from "@/type/role-assignment";
import { Option } from "@/type/option";
import { MAX_FILTER } from "@/type/filter/BaseFilter";
import { API_MSG_SUCCESS, handleResponseApi, handleResponseTable } from "@/utils/responseApiUtils";
import { ResponseTable } from "@/type/common/ResponseTable";
import { readApi } from "@/service/apiService";
import { ResponseApi } from "@/type/common/ResponseApi";
import SearchableDropdown from "../ui/SearchableDropdown";
import Label from "../ui/Label";
import InputComponent from "../ui/InputComponent";
import { readRole } from "@/service/roleService";
import { Role } from "@/type/role";
import { readRoleApi, updateRoleApi } from "@/service/menuApiService";
import LoadingContent from "../ui/LoadingContent";
import PendingTag from "../ui/PendingTag";
import { useContentLoading } from "@/hooks/useContentLoading";
import { useAssignmentDraft } from "@/hooks/useAssignmentDraft";
import AssignmentSaveBar from "../ui/AssignmentSaveBar";

const METHOD_COLOR: Record<string, string> = {
    GET: 'text-green-600',
    POST: 'text-blue-600',
    PUT: 'text-amber-600',
    PATCH: 'text-amber-600',
    DELETE: 'text-red-600',
};

function apiLabel(api: Api): string {
    return api.name || `[${api.method || '-'}] ${api.path || '-'}`;
}

function apiTechnicalLabel(api: Api): string {
    return `[${api.method || '-'}] ${api.path || '-'}`;
}

export default function RoleApiComponent() {
    const { showConfirm, showModal, contentModalSuccess, contentModalError } = useModal();
    const { handleLoading } = useLoading();
    const { isFetching: loadingOptions, withFetching: withOptionsFetching } = useContentLoading();
    const { isFetching: loadingAssignments, withFetching: withAssignmentsFetching } = useContentLoading();
    const { csrf, setCsrf } = useCsrf();
    const [apis, setApis] = useState<Api[]>([]);
    const { draft, toAdd, toRemove, isDirty, load, assign, unassign, discard } = useAssignmentDraft();
    const [selectedRoleId, setSelectedRoleId] = useState<string>("");
    const [roleOptions, setRoleOptions] = useState<Option[]>([]);
    const [search, setSearch] = useState<string>("");
    const [assignedSearch, setAssignedSearch] = useState<string>("");

    const availableApis = apis.filter(a => a.id && !draft.includes(a.id));
    const assignedApis = apis.filter(a => a.id && draft.includes(a.id));

    const matchesQuery = (a: Api, query: string) =>
        apiLabel(a).toLowerCase().includes(query) || apiTechnicalLabel(a).toLowerCase().includes(query);

    const filteredAvailable = search.trim()
        ? availableApis.filter(a => matchesQuery(a, search.toLowerCase()))
        : availableApis;

    const filteredAssigned = assignedSearch.trim()
        ? assignedApis.filter(a => matchesQuery(a, assignedSearch.toLowerCase()))
        : assignedApis;

    useEffect((): void => {
        const fetchData: () => Promise<void> = async (): Promise<void> => {
            await withOptionsFetching(async () => {
                const roleRes: Response = await readRole(MAX_FILTER, setCsrf);
                const roleData: ResponseTable<Role[]> = await handleResponseTable<ResponseTable<Role[]>>(roleRes);
                setRoleOptions((roleData.data || []).map(r => ({ label: r.name || "", value: r.id || "" })));

                const apiRes: Response = await readApi(MAX_FILTER, setCsrf);
                const apiData: ResponseTable<Api[]> = await handleResponseTable<ResponseTable<Api[]>>(apiRes);
                setApis(apiData.data || []);
            });
        };
        fetchData();
    }, [withOptionsFetching, setCsrf]);

    const refreshAssignments = useCallback(async (roleId: string) => {
        const res: Response = await readRoleApi({ 'role.id': roleId, offset: 0, limit: 999999 }, setCsrf);
        const data: ResponseTable<RoleApi[]> = await handleResponseTable<ResponseTable<RoleApi[]>>(res);
        load((data.data || []).filter(a => a.roleId === roleId).map(a => a.apiId || '').filter(Boolean));
    }, [setCsrf, load]);

    useEffect((): void => {
        if (!selectedRoleId) {
            // Clears stale fetched data when selection is cleared; assignments come from an
            // async fetch below, not something derivable from selectedRoleId at render time.
            load([]);
            return;
        }
        const fetchData: () => Promise<void> = async (): Promise<void> => {
            await withAssignmentsFetching(async () => {
                await refreshAssignments(selectedRoleId);
            });
        };
        fetchData();
    }, [selectedRoleId, withAssignmentsFetching, refreshAssignments, load]);

    const changeRole = (roleId: string) => {
        const apply = () => {
            setSelectedRoleId(roleId);
            setSearch('');
            setAssignedSearch('');
        };
        if (isDirty && roleId !== selectedRoleId) {
            showConfirm(<span>You have unsaved changes. Discard them and switch role?</span>, apply, 'Discard', 'Cancel');
            return;
        }
        apply();
    };

    const handleSave = () => {
        if (!selectedRoleId || !isDirty) return;
        showConfirm(
            <span>
                Apply changes to this role?
                {toAdd.length > 0 && <><br /><b>{toAdd.length}</b> API(s) will be assigned.</>}
                {toRemove.length > 0 && <><br /><b>{toRemove.length}</b> API(s) will be unassigned.</>}
            </span>,
            async () => {
                await handleLoading(async () => {
                    const response: Response = await updateRoleApi({ roleId: selectedRoleId, assign: toAdd, unassign: toRemove }, csrf, setCsrf);
                    const data: ResponseApi<RoleAssignmentResult> = await handleResponseApi<ResponseApi<RoleAssignmentResult>>(response);

                    if (data.message === API_MSG_SUCCESS) {
                        await refreshAssignments(selectedRoleId);
                        showModal(contentModalSuccess(`Role API changes were saved: ${data.data?.assigned?.length || 0} assigned, ${data.data?.unassigned?.length || 0} unassigned.`));
                    } else {
                        showModal(contentModalError(data.message || 'Failed to save role API changes.'));
                    }
                });
            },
            'Save',
            'Cancel'
        );
    };

    return (
        <div className="my-8">
            <div className="w-full mb-4 rounded-2xl border border-gray-200 bg-white px-5 py-7">
                {loadingOptions ? (
                    <LoadingContent />
                ) : (
                    <>
                        {/* Role selector */}
                        <div className="w-full px-2.5 xl:w-1/2 mb-6">
                            <SearchableDropdown
                                label="Select Role"
                                options={roleOptions}
                                value={roleOptions.find(option => option.value === selectedRoleId)?.label || ''}
                                onChange={(e) => changeRole(e?.value || "")}
                            />
                        </div>

                        {loadingAssignments ? (
                            <LoadingContent message="Loading assigned APIs..." />
                        ) : (
                            <div className="flex flex-col md:flex-row gap-4 w-full">
                                {/* Available APIs */}
                                <div className="w-full md:w-1/2 px-2.5">
                                    <Label>Available APIs</Label>
                                    {selectedRoleId && (
                                        <div className="mb-2">
                                            <InputComponent
                                                placeholder="Search by name, method, or path..."
                                                value={search}
                                                onChange={e => setSearch(e.target.value)}
                                            />
                                        </div>
                                    )}
                                    <ul className="rounded-lg bg-gray-50 p-2 max-h-96 overflow-y-auto">
                                        {selectedRoleId && filteredAvailable.map(api => (
                                            <li
                                                key={api.id}
                                                className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded gap-2"
                                            >
                                                <span className="min-w-0 truncate">
                                                    <span className="block text-sm text-gray-800 truncate">
                                                        {apiLabel(api)}
                                                        {toRemove.includes(api.id || '') && <PendingTag type="remove" />}
                                                    </span>
                                                    <span className="font-mono text-xs text-gray-500 truncate">
                                                        <span className={`font-semibold mr-1 ${METHOD_COLOR[api.method || ''] || 'text-gray-600'}`}>
                                                            {api.method}
                                                        </span>
                                                        {api.path}
                                                    </span>
                                                </span>
                                                <button
                                                    className="shrink-0 w-7 h-7 flex items-center justify-center bg-brand-500 text-white rounded hover:bg-brand-600 cursor-pointer text-lg leading-none"
                                                    onClick={() => assign(api.id || "")}
                                                    title="Assign"
                                                >
                                                    +
                                                </button>
                                            </li>
                                        ))}
                                        {(!selectedRoleId || filteredAvailable.length === 0) && (
                                            <li className="text-gray-400 text-center py-4 text-sm">
                                                {!selectedRoleId ? 'Select a role first' : 'No APIs available'}
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                {/* Assigned APIs */}
                                <div className="w-full md:w-1/2 px-2.5">
                                    <Label>Assigned APIs ({assignedApis.length})</Label>
                                    {selectedRoleId && (
                                        <div className="mb-2">
                                            <InputComponent
                                                placeholder="Search assigned by name, method, or path..."
                                                value={assignedSearch}
                                                onChange={e => setAssignedSearch(e.target.value)}
                                            />
                                        </div>
                                    )}
                                    <ul className="rounded-lg bg-gray-50 p-2 max-h-96 overflow-y-auto">
                                        {filteredAssigned.map(api => (
                                            <li
                                                key={api.id}
                                                className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded gap-2"
                                            >
                                                <span className="min-w-0 truncate">
                                                    <span className="block text-sm text-gray-800 truncate">
                                                        {apiLabel(api)}
                                                        {toAdd.includes(api.id || '') && <PendingTag type="add" />}
                                                    </span>
                                                    <span className="font-mono text-xs text-gray-500 truncate">
                                                        <span className={`font-semibold mr-1 ${METHOD_COLOR[api.method || ''] || 'text-gray-600'}`}>
                                                            {api.method}
                                                        </span>
                                                        {api.path}
                                                    </span>
                                                </span>
                                                <button
                                                    className="shrink-0 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer text-lg leading-none"
                                                    onClick={() => unassign(api.id || "")}
                                                    title="Unassign"
                                                >
                                                    −
                                                </button>
                                            </li>
                                        ))}
                                        {filteredAssigned.length === 0 && (
                                            <li className="text-gray-400 text-center py-4 text-sm">
                                                {!selectedRoleId
                                                    ? 'Select a role first'
                                                    : assignedApis.length === 0
                                                        ? 'No APIs assigned yet'
                                                        : 'No results'}
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {selectedRoleId && !loadingAssignments && (
                            <AssignmentSaveBar
                                addCount={toAdd.length}
                                removeCount={toRemove.length}
                                onDiscard={discard}
                                onSave={handleSave}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
