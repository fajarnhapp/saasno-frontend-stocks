'use client';

import { Role } from '@/type/role';
import { useState } from 'react';
import InputComponent from '../ui/InputComponent';
import ButtonComponent from '../ui/ButtonComponent';
import { changedFields, hasChanges } from '@/utils/diffUtils';

interface Properties {
    setViewMode: (mode: string) => void;
    submitCreate: (request: Role) => void;
    submitEdit?: (request: Role) => void;
    selected?: Role | null;
}

export default function RoleCreateForm({ submitCreate, submitEdit, selected }: Properties) {
    const [role, setRole] = useState<Role>(selected || {});
    const isEdit = !!selected;
    return (
        <div className="w-full mb-4 rounded-2xl border border-gray-200 bg-white px-5 py-7">
            <h3 className="mb-4 text-base font-semibold">{isEdit ? 'Edit Role' : 'Role Form'}</h3>
            <div className="-mx-2.5 flex flex-wrap gap-y-5">
                <div className="w-full px-2.5 xl:w-1/2">
                    <InputComponent
                        label="Role Id"
                        placeholder="Role id"
                        value={role.id || ''}
                        onChange={(e) => setRole({ ...role, id: e.target.value })}
                        required
                        disabled={isEdit}
                    />
                </div>

                <div className="w-full px-2.5 xl:w-1/2">
                    <InputComponent
                        label="Role Name"
                        placeholder="Role Name"
                        value={role.name || ''}
                        onChange={(e) => setRole({ ...role, name: e.target.value })}
                        required
                    />
                </div>
            </div>
            <div className="mt-4">
                <ButtonComponent
                    disabled={isEdit && !hasChanges(selected, role)}
                    onClick={() => isEdit ? submitEdit?.(changedFields(selected, role)) : submitCreate(role)}>
                    {isEdit ? 'Update' : 'Create'}
                </ButtonComponent>
            </div>
        </div>
    );
}
