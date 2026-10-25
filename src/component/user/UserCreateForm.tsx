'use client';

import { User } from '@/type/user';
import { useEffect, useState } from 'react';
import { useCsrf } from '@/context/CsrfContext';
import { MAX_FILTER } from '@/type/filter/BaseFilter';
import { ResponseTable } from '@/type/common/ResponseTable';
import { Role } from '@/type/role';
import { Option } from '@/type/option';
import { readRole } from '@/service/roleService';
import { handleResponseTable } from '@/utils/responseApiUtils';
import InputComponent from '../ui/InputComponent';
import ButtonComponent from '../ui/ButtonComponent';
import SearchableDropdown from '../ui/SearchableDropdown';
import { useT } from '@/context/LanguageContext';

interface Properties {
    setViewMode: (mode: string) => void;
    submitCreate: (request: User) => void;
}

export default function UserCreateForm({ submitCreate }: Properties) {
    const t = useT();
    const { setCsrf } = useCsrf();
    const [roleOptions, setRoleOptions] = useState<Role[]>([]);
    const [user, setUser] = useState<User>({ roles: [] });

    useEffect((): void => {
        const fetchRoles: () => Promise<void> = async (): Promise<void> => {
            const response: Response = await readRole(MAX_FILTER, setCsrf);
            const data: ResponseTable<Role[]> = await handleResponseTable<ResponseTable<Role[]>>(response);
            setRoleOptions(data.data || []);
        };
        fetchRoles();
    }, [setCsrf]);

    const roleDropdownOptions: Option[] = roleOptions.map(role => ({ value: role.id || '', label: role.name || '' }));
    const selectedRoleId = user.roles?.[0]?.id || '';

    const selectRole = (option: Option | null) => {
        setUser({
            ...user,
            roles: option ? [{ id: option.value, name: option.label }] : [],
        });
    };

    return (
        <div className="w-full mb-4 rounded-2xl border border-gray-200 bg-white px-5 py-7">
            <h3 className="mb-4 text-base font-semibold">{t('User Form')}</h3>
            <div className="-mx-2.5 flex flex-wrap gap-y-5">
                <div className="w-full px-2.5 xl:w-1/2">
                    <InputComponent
                        label={t('Full name')}
                        placeholder={t('Full name')}
                        value={user.fullName || ''}
                        onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                        required
                    />
                </div>

                <div className="w-full px-2.5 xl:w-1/2">
                    <InputComponent
                        label={t('Email')}
                        type="email"
                        autoComplete="off"
                        placeholder="name@example.com"
                        value={user.email || ''}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                        required
                    />
                </div>

                <div className="w-full px-2.5 xl:w-1/2">
                    <InputComponent
                        label={t('Username')}
                        autoComplete="off"
                        placeholder={t('Lowercase letters, digits, . _ -')}
                        value={user.username || ''}
                        onChange={(e) => setUser({ ...user, username: e.target.value })}
                        required
                    />
                </div>

                <div className="w-full px-2.5 xl:w-1/2">
                    <SearchableDropdown
                        label={t('Role')}
                        placeholder={t('Select role')}
                        options={roleDropdownOptions}
                        value={roleDropdownOptions.find(opt => opt.value === selectedRoleId)?.label || ''}
                        onChange={selectRole}
                        required
                    />
                </div>
            </div>
            <div className="mt-4">
                <ButtonComponent onClick={() => submitCreate(user)}>
                    {t('Create')}
                </ButtonComponent>
            </div>
        </div>
    );
}
