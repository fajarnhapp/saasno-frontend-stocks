"use client";

import { useCallback, useEffect, useState } from "react";
import { useModal } from "@/context/ModalContext";
import { useCsrf } from "@/context/CsrfContext";
import { useLoading } from "@/context/LoadingCircleContext";
import { Menu } from "@/type/menu";
import { RoleMenu } from "@/type/role-menu";
import { RoleAssignmentResult } from "@/type/role-assignment";
import { Option } from "@/type/option";
import { MAX_FILTER } from "@/type/filter/BaseFilter";
import { readRole } from "@/service/roleService";
import { API_MSG_SUCCESS, handleResponseApi, handleResponseTable } from "@/utils/responseApiUtils";
import { ResponseApi } from "@/type/common/ResponseApi";
import { ResponseTable } from "@/type/common/ResponseTable";
import { Role } from "@/type/role";
import { readMenu } from "@/service/menuService";
import { readRoleMenu, updateRoleMenu } from "@/service/roleMenuService";
import SearchableDropdown from "../ui/SearchableDropdown";
import Label from "../ui/Label";
import InputComponent from "../ui/InputComponent";
import LoadingContent from "../ui/LoadingContent";
import { useContentLoading } from "@/hooks/useContentLoading";
import { useAssignmentDraft } from "@/hooks/useAssignmentDraft";
import AssignmentSaveBar from "../ui/AssignmentSaveBar";
import PendingTag from "../ui/PendingTag";

export default function RoleMenuComponent() {
    const { showConfirm, showModal, contentModalSuccess, contentModalError } = useModal();
    const { handleLoading } = useLoading();
    const { isFetching: loadingOptions, withFetching: withOptionsFetching } = useContentLoading();
    const { isFetching: loadingAssignments, withFetching: withAssignmentsFetching } = useContentLoading();
    const { csrf, setCsrf } = useCsrf();
    const [menus, setMenus] = useState<Menu[]>([]);
    const { draft, toAdd, toRemove, isDirty, load, assign, unassign, discard } = useAssignmentDraft();
    const [selectedRoleId, setSelectedRoleId] = useState<string>("");
    const [roleOptions, setRoleOptions] = useState<Option[]>([]);
    const [search, setSearch] = useState<string>("");
    const [assignedSearch, setAssignedSearch] = useState<string>("");

    const availableMenus = menus.filter(m => m.id && !draft.includes(m.id));
    const assignedMenus = menus.filter(m => m.id && draft.includes(m.id));

    const filteredAvailable = search.trim()
        ? availableMenus.filter(m => (m.name || '').toLowerCase().includes(search.toLowerCase()))
        : availableMenus;

    const filteredAssigned = assignedSearch.trim()
        ? assignedMenus.filter(m => (m.name || '').toLowerCase().includes(assignedSearch.toLowerCase()))
        : assignedMenus;

    useEffect(() => {
        const fetchData = async () => {
            await withOptionsFetching(async () => {
                const roleRes: Response = await readRole(MAX_FILTER, setCsrf);
                const roleData: ResponseTable<Role[]> = await handleResponseTable<ResponseTable<Role[]>>(roleRes);
                setRoleOptions((roleData.data || []).map(r => ({ label: r.name || "", value: r.id || "" })));
                const menuRes: Response = await readMenu(MAX_FILTER, setCsrf);
                const menuData: ResponseTable<Menu[]> = await handleResponseTable<ResponseTable<Menu[]>>(menuRes);
                setMenus(menuData.data || []);
            });
        };
        fetchData();
    }, [withOptionsFetching, setCsrf]);

    const refreshAssignments = useCallback(async (roleId: string) => {
        const res: Response = await readRoleMenu({ 'role.id': roleId, offset: 0, limit: 999999 }, setCsrf);
        const data: ResponseTable<RoleMenu[]> = await handleResponseTable<ResponseTable<RoleMenu[]>>(res);
        load((data.data || []).map(a => a.menuId || '').filter(Boolean));
    }, [setCsrf, load]);

    useEffect(() => {
        if (!selectedRoleId) {
            // Clears stale fetched data when selection is cleared; assignments come from an
            // async fetch below, not something derivable from selectedRoleId at render time.
            load([]);
            return;
        }
        const fetchAssignments = async () => {
            await withAssignmentsFetching(async () => {
                await refreshAssignments(selectedRoleId);
            });
        };
        fetchAssignments();
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
                {toAdd.length > 0 && <><br /><b>{toAdd.length}</b> menu(s) will be assigned.</>}
                {toRemove.length > 0 && <><br /><b>{toRemove.length}</b> menu(s) will be unassigned.</>}
            </span>,
            async () => {
                await handleLoading(async () => {
                    const response: Response = await updateRoleMenu({ roleId: selectedRoleId, assign: toAdd, unassign: toRemove }, csrf, setCsrf);
                    const data: ResponseApi<RoleAssignmentResult> = await handleResponseApi<ResponseApi<RoleAssignmentResult>>(response);

                    if (data.message === API_MSG_SUCCESS) {
                        await refreshAssignments(selectedRoleId);
                        showModal(contentModalSuccess(`Role menu changes were saved: ${data.data?.assigned?.length || 0} assigned, ${data.data?.unassigned?.length || 0} unassigned.`));
                    } else {
                        showModal(contentModalError(data.message || 'Failed to save role menu changes.'));
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
                            <LoadingContent message="Loading assigned menus..." />
                        ) : (
                            <div className="flex flex-col md:flex-row gap-4 w-full">
                                {/* Available Menus */}
                                <div className="w-full md:w-1/2 px-2.5">
                                    <Label>Available Menus</Label>
                                    {selectedRoleId && (
                                        <div className="mb-2">
                                            <InputComponent
                                                placeholder="Search menu name..."
                                                value={search}
                                                onChange={e => setSearch(e.target.value)}
                                            />
                                        </div>
                                    )}
                                    <ul className="rounded-lg bg-gray-50 p-2 max-h-96 overflow-y-auto">
                                        {selectedRoleId && filteredAvailable.map(menu => (
                                            <li
                                                key={menu.id}
                                                className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded gap-2"
                                            >
                                                <span className="text-sm text-gray-700 truncate">
                                                    {menu.name}
                                                    {toRemove.includes(menu.id || '') && <PendingTag type="remove" />}
                                                </span>
                                                <button
                                                    className="shrink-0 w-7 h-7 flex items-center justify-center bg-brand-500 text-white rounded hover:bg-brand-600 cursor-pointer text-lg leading-none"
                                                    onClick={() => assign(menu.id || "")}
                                                    title="Assign"
                                                >
                                                    +
                                                </button>
                                            </li>
                                        ))}
                                        {(!selectedRoleId || filteredAvailable.length === 0) && (
                                            <li className="text-gray-400 text-center py-4 text-sm">
                                                {!selectedRoleId ? 'Select a role first' : 'No menus available'}
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                {/* Assigned Menus */}
                                <div className="w-full md:w-1/2 px-2.5">
                                    <Label>Assigned Menus ({assignedMenus.length})</Label>
                                    {selectedRoleId && (
                                        <div className="mb-2">
                                            <InputComponent
                                                placeholder="Search assigned menu name..."
                                                value={assignedSearch}
                                                onChange={e => setAssignedSearch(e.target.value)}
                                            />
                                        </div>
                                    )}
                                    <ul className="rounded-lg bg-gray-50 p-2 max-h-96 overflow-y-auto">
                                        {filteredAssigned.map(menu => (
                                            <li
                                                key={menu.id}
                                                className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded gap-2"
                                            >
                                                <span className="text-sm text-gray-700 truncate">
                                                    {menu.name}
                                                    {toAdd.includes(menu.id || '') && <PendingTag type="add" />}
                                                </span>
                                                <button
                                                    className="shrink-0 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer text-lg leading-none"
                                                    onClick={() => unassign(menu.id || "")}
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
                                                    : assignedMenus.length === 0
                                                        ? 'No menus assigned yet'
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
