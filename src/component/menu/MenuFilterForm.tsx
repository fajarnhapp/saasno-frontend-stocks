import { useState } from 'react';
import { X } from 'lucide-react';
import { MenuFilter } from '@/type/filter/MenuFilter';
import { DEFAULT_FILTER } from '@/type/filter/BaseFilter';
import { dateTimeNow, dateTimeOld, timeEnd, timeStart } from '@/utils/formatterUtils';
import InputComponent from '../ui/InputComponent';
import ButtonComponent from '../ui/ButtonComponent';


interface Properties {
    filter: MenuFilter;
    setViewMode: (mode: string) => void;
    setFilter: (filter: MenuFilter) => void;
}

export default function MenuFilterForm({ filter, setViewMode, setFilter }: Properties) {
    const [filterState, setFilterState] = useState<MenuFilter>(filter);

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
                <div className="w-full px-2.5 xl:w-1/2">
                    <InputComponent
                        label="Menu Id"
                        value={filterState.id || ''}
                        placeholder="Menu Id"
                        onChange={(e) => setFilterState({ ...filterState, id: e.target.value })} />
                </div>

                <div className="w-full px-2.5 xl:w-1/2">
                    <InputComponent
                        label="Menu Name"
                        value={filterState.name || ''}
                        placeholder="Menu Name"
                        onChange={(e) => setFilterState({ ...filterState, name: e.target.value })} />
                </div>
                {/* Dibuat (Registered Date) */}
                <div className="w-full px-2.5 xl:w-1/2">
                    <InputComponent
                        label="Start Date"
                        value={filterState.startDate || ''}
                        placeholder="From date"
                        onChange={(e) => setFilterState({ ...filterState, startDate: e.target.value })}
                    />
                </div>

                <div className="w-full px-2.5 xl:w-1/2">
                    <InputComponent
                        label="End Date"
                        value={filterState.endDate || ''}
                        placeholder="To date"
                        onChange={(e) => setFilterState({ ...filterState, endDate: e.target.value })}
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
