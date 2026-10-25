'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import Label from './Label';
import { Option } from '@/type/option';

type Props = {
    label?: string;
    placeholder?: string;
    options: Option[];
    value?: string;
    disabled?: boolean;
    required?: boolean;
    onChange: (value: Option | null) => void;
};

export default function SearchableDropdown({
    label,
    placeholder = 'Search...',
    options,
    value,
    disabled,
    required,
    onChange,
}: Props) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Perubahan di sini: Mengganti opt.value menjadi opt.label
    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div ref={wrapperRef} className="relative">
            {label && <Label>{label}</Label>}
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={open ? search : (value ? (options.find(opt => opt.value === value)?.label ?? value) : '')}
                    placeholder={placeholder}
                    onFocus={() => {
                        setOpen(true);
                    }}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setOpen(true);
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
                    readOnly={!open && !!value}
                    disabled={disabled}
                    required={required}
                />
                {value && (
                    <button
                        type="button"
                        className="absolute right-2 text-gray-400 hover:text-gray-700 cursor-pointer"
                        onClick={() => onChange(null)}
                        tabIndex={-1}
                        aria-label="Clear selection"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
            {open && (
                <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                    {filteredOptions.length === 0 && (
                        <div className="px-4 py-2 text-sm text-gray-500">
                            Not found
                        </div>
                    )}

                    {filteredOptions.map((opt) => (
                        <div
                            key={opt.description ?? opt.value}
                            onClick={() => {
                                onChange(opt);
                                setOpen(false);
                                setSearch('');
                            }}
                            className="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100"
                        >
                            <div className="font-medium">{opt.label}</div>
                            <div className="text-xs text-gray-500">
                                {opt.value}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}