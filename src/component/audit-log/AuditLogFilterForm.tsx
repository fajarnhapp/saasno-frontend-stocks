import { AuditLogFilter } from "@/type/filter/AuditLogFilter";
import { DEFAULT_FILTER } from "@/type/filter/BaseFilter";
import { timeEnd, timeStart } from "@/utils/formatterUtils";
import { X } from "lucide-react";
import { useState } from "react";
import InputComponent from "../ui/InputComponent";
import DatePicker from "../ui/DatePicker";
import ButtonComponent from "../ui/ButtonComponent";
import SearchableDropdown from "../ui/SearchableDropdown";

const METHOD_OPTIONS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
    .map(method => ({ label: method, value: method }));

// Applied filter stores dates with a time suffix; the picker only needs YYYY-MM-DD
const toDateOnly = (value?: string) => (value ? value.substring(0, 10) : '');

interface Properties {
    filter: AuditLogFilter;
    setViewMode: (mode: string) => void;
    setFilter: (filter: AuditLogFilter) => void;
}

export default function AuditLogFilterForm({ filter, setViewMode, setFilter }: Properties) {
    const [filterState, setFilterState] = useState<AuditLogFilter>({
        ...filter,
        startDate: toDateOnly(filter.startDate),
        endDate: toDateOnly(filter.endDate),
    });

    const reset = () => {
        setFilter(DEFAULT_FILTER);
        setFilterState(DEFAULT_FILTER);
    };

    const submit = () => {
        const { userId, username, personName, method, uri, clientIp, startDate, endDate, ...base } = filterState;
        const fields: Partial<AuditLogFilter> = {
            userId: userId?.trim(),
            username: username?.trim(),
            personName: personName?.trim(),
            method,
            uri: uri?.trim(),
            clientIp: clientIp?.trim(),
            startDate: startDate ? startDate + timeStart() : undefined,
            endDate: endDate ? endDate + timeEnd() : undefined,
        };
        // Drop empty fields so they are not sent as blank query params
        const applied = Object.fromEntries(Object.entries(fields).filter(([, value]) => value));
        setFilter({ ...base, ...applied, offset: 0 });
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
                <div className="w-full px-2.5 md:w-1/2 xl:w-1/3">
                    <InputComponent
                        label="Name"
                        placeholder="Name"
                        value={filterState.personName || ''}
                        onChange={(e) => setFilterState({ ...filterState, personName: e.target.value })}
                    />
                </div>
                <div className="w-full px-2.5 md:w-1/2 xl:w-1/3">
                    <InputComponent
                        label="Username"
                        placeholder="Username"
                        value={filterState.username || ''}
                        onChange={(e) => setFilterState({ ...filterState, username: e.target.value })}
                    />
                </div>
                <div className="w-full px-2.5 md:w-1/2 xl:w-1/3">
                    <InputComponent
                        label="User ID"
                        placeholder="User ID"
                        value={filterState.userId || ''}
                        onChange={(e) => setFilterState({ ...filterState, userId: e.target.value })}
                    />
                </div>
                <div className="w-full px-2.5 md:w-1/2 xl:w-1/3">
                    <InputComponent
                        label="URI"
                        placeholder="/api/example"
                        value={filterState.uri || ''}
                        onChange={(e) => setFilterState({ ...filterState, uri: e.target.value })}
                    />
                </div>
                <div className="w-full px-2.5 md:w-1/2">
                    <SearchableDropdown
                        label="Method"
                        placeholder="Select method"
                        options={METHOD_OPTIONS}
                        value={METHOD_OPTIONS.find(opt => opt.value === filterState.method)?.label}
                        onChange={(opt) => setFilterState({ ...filterState, method: opt?.value || '' })}
                    />
                </div>
                <div className="w-full px-2.5 md:w-1/2">
                    <InputComponent
                        label="IP Address"
                        placeholder="127.0.0.1"
                        value={filterState.clientIp || ''}
                        onChange={(e) => setFilterState({ ...filterState, clientIp: e.target.value })}
                    />
                </div>
                <div className="w-full px-2.5 md:w-1/2">
                    <DatePicker
                        label="Start Date"
                        name="startDate"
                        placeholder="From date"
                        value={filterState.startDate || ''}
                        onChange={(date, dateStr) => setFilterState({ ...filterState, startDate: dateStr })}
                    />
                </div>
                <div className="w-full px-2.5 md:w-1/2">
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
