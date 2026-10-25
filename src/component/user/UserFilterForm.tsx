'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { UserFilter } from '@/type/filter/UserFilter';
import { DEFAULT_FILTER } from '@/type/filter/BaseFilter';
import { dateTimeNow, dateTimeOld, timeEnd, timeStart } from '@/utils/formatterUtils';
import InputComponent from '../ui/InputComponent';
import DatePicker from '../ui/DatePicker';
import ButtonComponent from '../ui/ButtonComponent';
import SearchableDropdown from '../ui/SearchableDropdown';
import { useT } from '@/context/LanguageContext';

interface Properties {
    filter: UserFilter;
    setViewMode: (mode: string) => void;
    setFilter: (filter: UserFilter) => void;
}

const STATUS_OPTIONS = [
    { label: 'Actived', value: 'ACTIVED' },
    { label: 'Inactived', value: 'INACTIVED' },
    { label: 'Blocked', value: 'BLOCKED' },
    { label: 'Suspend', value: 'SUSPEND' },
    { label: 'Closed', value: 'CLOSED' },
];

export default function UserFilterForm({ filter, setViewMode, setFilter }: Properties) {
    const t = useT();
    const [filterState, setFilterState] = useState<UserFilter>(filter);

    const reset = () => {
        setFilter(DEFAULT_FILTER);
        setFilterState(DEFAULT_FILTER);
    };

    const submit = () => {
        setFilter({
            ...filterState,
            startDate: filterState.startDate ? filterState.startDate + timeStart() : dateTimeOld().toISOString(),
            endDate: filterState.endDate ? filterState.endDate + timeEnd() : dateTimeNow().toISOString(),
        });
    }

    return (
        <div className="relative mt-2 w-full mb-6 rounded-2xl border border-gray-200 bg-white px-5 py-6">
            {setViewMode && (
                <button
                    type="button"
                    aria-label={t('Close')}
                    className="absolute top-2 right-2 z-10 p-2 rounded-full hover:bg-gray-200 focus:outline-none"
                    onClick={() => setViewMode('TABLE')}
                >
                    <X size={22} className="cursor-pointer" />
                </button>
            )}
            <h3 className="mb-4 text-base font-semibold">{t('Filter Data')}</h3>

            <div className="-mx-2.5 flex flex-wrap gap-y-5">
                <div className="w-full px-2.5 xl:w-1/5">
                    <InputComponent
                        label={t('Username')}
                        value={filterState.username || ''}
                        placeholder={t('Username')}
                        onChange={(e) => setFilterState({ ...filterState, username: e.target.value })} />
                </div>

                <div className="w-full px-2.5 xl:w-1/5">
                    <InputComponent
                        label={t('Name')}
                        value={filterState['person.fullName'] || ''}
                        placeholder={t('Full name')}
                        onChange={(e) => setFilterState({ ...filterState, 'person.fullName': e.target.value })} />
                </div>

                <div className="w-full px-2.5 xl:w-1/5">
                    <SearchableDropdown
                        label={t('Status')}
                        placeholder={t('Select status')}
                        options={STATUS_OPTIONS.map(o => ({ ...o, label: t(o.label) }))}
                        value={(() => { const found = STATUS_OPTIONS.find(opt => opt.value === filterState.status); return found ? t(found.label) : undefined; })()}
                        onChange={(opt) => setFilterState({ ...filterState, status: opt?.value || '' })}
                    />
                </div>

                <div className="w-full px-2.5 xl:w-1/5">
                    <DatePicker
                        label={t('Start Date')}
                        name="startDate"
                        placeholder={t('From date')}
                        value={filterState.startDate || ''}
                        onChange={(date, dateStr) => setFilterState({ ...filterState, startDate: dateStr })}
                    />
                </div>

                <div className="w-full px-2.5 xl:w-1/5">
                    <DatePicker
                        label={t('End Date')}
                        name="endDate"
                        placeholder={t('To date')}
                        value={filterState.endDate || ''}
                        onChange={(date, dateStr) => setFilterState({ ...filterState, endDate: dateStr })}
                    />
                </div>
            </div>

            {/* Buttons */}
            <div className="flex w-full gap-3 justify-end mt-4">
                <ButtonComponent variant="secondary" type="button" onClick={reset}>{t('Reset')}</ButtonComponent>
                <ButtonComponent type="button" onClick={submit}>{t('Search')}</ButtonComponent>
            </div>
        </div>
    );
}
