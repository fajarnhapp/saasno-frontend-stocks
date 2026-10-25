'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { RoleFilter } from '@/type/filter/RoleFilter';
import { DEFAULT_FILTER } from '@/type/filter/BaseFilter';
import { dateTimeNow, dateTimeOld, timeEnd, timeStart } from '@/utils/formatterUtils';
import InputComponent from '../ui/InputComponent';
import DatePicker from '../ui/DatePicker';
import ButtonComponent from '../ui/ButtonComponent';

interface Properties {
    filter: RoleFilter;
    setViewMode: (mode: string) => void;
    setFilter: (filter: RoleFilter) => void;
}

export default function RoleFilterForm({ filter, setViewMode, setFilter }: Properties) {
    const [filterState, setFilterState] = useState<RoleFilter>(filter);

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
                    aria-label="Close"
                    className="absolute top-2 right-2 z-10 p-2 rounded-full hover:bg-gray-200 focus:outline-none"
                    onClick={() => setViewMode('TABLE')}
                >
                    <X size={22} className="cursor-pointer" />
                </button>
            )}
            <h3 className="mb-4 text-base font-semibold">Filter Data</h3>

            <div className="-mx-2.5 flex flex-wrap gap-y-5">
                <div className="w-full px-2.5 xl:w-1/4">
                    <InputComponent
                        label="Position Id"
                        value={filterState.id || ''}
                        placeholder="Position Id"
                        onChange={(e) => setFilterState({ ...filterState, id: e.target.value })} />
                </div>

                <div className="w-full px-2.5 xl:w-1/4">
                    <InputComponent
                        label="Position Name"
                        value={filterState.name || ''}
                        placeholder="Position Name"
                        onChange={(e) => setFilterState({ ...filterState, name: e.target.value })} />
                </div>
                {/* Dibuat (Registered Date) */}
                <div className="w-full px-2.5 xl:w-1/4">
                    <DatePicker
                        label="Start Date"
                        name="startDate"
                        placeholder="From date"
                        value={filterState.startDate || ''}
                        onChange={(date, dateStr) => setFilterState({ ...filterState, startDate: dateStr })}
                    />
                </div>

                <div className="w-full px-2.5 xl:w-1/4">
                    <DatePicker
                        label="End Date"
                        name="endDate"
                        placeholder="To date"
                        value={filterState.endDate || ''}
                        onChange={(date, dateStr) => setFilterState({ ...filterState, endDate: dateStr })}
                    />
                </div>
            </div>

            {/* Buttons */}
            <div className="flex w-full gap-3 justify-end mt-4">
                <ButtonComponent variant="secondary" type="button" onClick={reset}>Reset</ButtonComponent>
                <ButtonComponent type="button" onClick={submit}>Search</ButtonComponent>
            </div>
        </div>
    );
}
