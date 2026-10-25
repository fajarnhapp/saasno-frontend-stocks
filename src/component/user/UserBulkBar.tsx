'use client';

import { useEffect, useState } from 'react';
import { useCsrf } from '@/context/CsrfContext';
import { useT } from '@/context/LanguageContext';
import { readRole } from '@/service/roleService';
import { ResponseTable } from '@/type/common/ResponseTable';
import { MAX_FILTER } from '@/type/filter/BaseFilter';
import { Option } from '@/type/option';
import { Role } from '@/type/role';
import { handleResponseTable } from '@/utils/responseApiUtils';
import ButtonComponent from '../ui/ButtonComponent';
import SearchableDropdown from '../ui/SearchableDropdown';

export const BULK_ACTIONS: Option[] = [
    { label: 'Activate', value: 'ACTIVATE' },
    { label: 'Deactivate', value: 'DEACTIVATE' },
    { label: 'Block', value: 'BLOCK' },
    { label: 'Change role', value: 'SET_ROLE' },
    { label: 'Reset password (send link)', value: 'SEND_ACTIVATION' },
    { label: 'Move to trash', value: 'DELETE' },
];

interface Properties {
    count: number;
    onApply: (action: string, roleId?: string) => void;
    onClear: () => void;
}

// Shown while users are ticked in the table: one action for all of them.
export default function UserBulkBar({ count, onApply, onClear }: Properties) {
    const t = useT();
    const { setCsrf } = useCsrf();
    const [action, setAction] = useState<string>('');
    const [roleId, setRoleId] = useState<string>('');
    const [roles, setRoles] = useState<Option[]>([]);

    useEffect(() => {
        const load = async () => {
            const res: Response = await readRole(MAX_FILTER, setCsrf);
            const data: ResponseTable<Role[]> = await handleResponseTable<ResponseTable<Role[]>>(res);
            setRoles((data.data || []).map(role => ({ value: role.id || '', label: role.name || '' })));
        };
        load();
    }, [setCsrf]);

    const ready: boolean = action !== '' && (action !== 'SET_ROLE' || roleId !== '');
    const actions: Option[] = BULK_ACTIONS.map(o => ({ ...o, label: t(o.label) }));

    return (
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-brand-200 bg-brand-50/50 p-3">
            <span className="pb-2 text-sm font-medium text-gray-700">{t('{count} selected', { count })}</span>
            <div className="w-full sm:w-64">
                <SearchableDropdown placeholder={t('Choose an action')} options={actions}
                    value={actions.find(o => o.value === action)?.label} onChange={(opt) => setAction(opt?.value || '')} />
            </div>
            {action === 'SET_ROLE' && (
                <div className="w-full sm:w-56">
                    <SearchableDropdown placeholder={t('Select role')} options={roles}
                        value={roles.find(o => o.value === roleId)?.label} onChange={(opt) => setRoleId(opt?.value || '')} />
                </div>
            )}
            <ButtonComponent type="button" className="w-auto!" disabled={!ready} onClick={() => onApply(action, roleId || undefined)}>{t('Apply')}</ButtonComponent>
            <ButtonComponent type="button" variant="secondary" className="w-auto!" onClick={onClear}>{t('Clear selection')}</ButtonComponent>
        </div>
    );
}
