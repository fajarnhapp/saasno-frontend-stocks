import { Search, X } from 'lucide-react';
import { CONFIG_GROUPS, ConfigGroup } from '@/utils/configurationUtils';

interface Properties {
    query: string;
    onQuery: (query: string) => void;
    group: ConfigGroup | 'all';
    onGroup: (group: ConfigGroup | 'all') => void;
    shown: number;
    total: number;
}

// Filters as you type: there is no Search button, the list below changes with every key.
export default function ConfigurationFilter({ query, onQuery, group, onGroup, shown, total }: Properties) {
    const active: boolean = query.trim() !== '' || group !== 'all';
    const chip = (selected: boolean): string =>
        `rounded-full border px-3 py-1 text-xs font-medium transition cursor-pointer ${selected
            ? 'border-brand-500 bg-brand-600 text-white'
            : 'border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700'}`;

    return (
        <div className="mb-4 space-y-3">
            <div className="relative">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="search"
                    value={query}
                    onChange={(e) => onQuery(e.target.value)}
                    placeholder="Search by name, key or value..."
                    aria-label="Search configuration"
                    className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 [&::-webkit-search-cancel-button]:hidden"
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => onQuery('')}
                        aria-label="Clear search"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <button type="button" className={chip(group === 'all')} onClick={() => onGroup('all')}>All</button>
                {CONFIG_GROUPS.map((item) => (
                    <button key={item.id} type="button" className={chip(group === item.id)} onClick={() => onGroup(group === item.id ? 'all' : item.id)}>
                        {item.label}
                    </button>
                ))}
                <span className="ml-auto text-xs text-gray-400">
                    {active ? `${shown} of ${total} settings` : `${total} settings`}
                </span>
                {active && (
                    <button
                        type="button"
                        onClick={() => { onQuery(''); onGroup('all'); }}
                        className="text-xs font-medium text-brand-600 hover:text-brand-700 cursor-pointer"
                    >
                        Reset
                    </button>
                )}
            </div>
        </div>
    );
}
