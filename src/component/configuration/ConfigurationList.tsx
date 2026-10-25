import { ReactNode } from 'react';
import { Configuration } from '@/type/configuration';
import { formatDate } from '@/utils/formatterUtils';
import { formatConfigKey } from '@/utils/configurationUtils';
import { Pencil } from 'lucide-react';

interface Properties {
    rows: Configuration[];
    onEdit: (row: Configuration) => void;
    // True while a search or group is applied, so an empty list means "nothing matches" rather than "nothing exists".
    filtered?: boolean;
    // The editor opens right under the row being edited, so the form appears where the user clicked.
    selectedId?: string;
    editor?: ReactNode;
}

export default function ConfigurationList({ rows, onEdit, filtered = false, selectedId, editor }: Properties) {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
            {rows.map((row) => (
                <div key={row.id}>
                <div
                    className={`flex items-center justify-between gap-4 px-5 py-4 transition-colors ${selectedId === row.id ? 'bg-brand-50/40' : 'hover:bg-gray-50/70'}`}
                >
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-[15px] font-semibold text-gray-900 tracking-tight">
                                {formatConfigKey(row.id || '')}
                            </h4>
                            <span className="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-mono font-medium text-gray-500">
                                {row.id}
                            </span>
                        </div>

                        <p className="mt-2 break-all text-sm leading-relaxed text-gray-600">
                            {row.value
                                ? row.value
                                : <span className="italic text-gray-400">Not set</span>}
                        </p>

                        <p className="mt-2 text-xs text-gray-400">
                            Last modified {formatDate(row.modificated || '', 'DD/MM/YYYY HH:mm:ss')}
                        </p>
                    </div>
                    <button
                        onClick={() => onEdit(row)}
                        className="shrink-0 p-2 rounded border border-brand-500 bg-white text-brand-600 hover:bg-brand-600 hover:text-white cursor-pointer"
                        title="Edit"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                </div>
                {selectedId === row.id && editor && <div className="bg-brand-50/40 px-3 pb-3 sm:px-4 sm:pb-4">{editor}</div>}
                </div>
            ))}
            {rows.length === 0 && (
                <div className="p-6 text-center text-sm text-gray-500">
                    {filtered ? 'No setting matches the search.' : 'No configuration data yet.'}
                </div>
            )}
        </div>
    );
}
