'use client';

import { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Label from './Label';
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;
import { formatDate } from '@/utils/formatterUtils';

type PropsType = {
    id?: string;
    name?: string;
    mode?: 'single' | 'multiple' | 'range' | 'time';
    onChange?: Hook | Hook[];
    defaultDate?: DateOption;
    value?: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
};

export default function DatePicker({
    id,
    name,
    mode,
    onChange,
    label,
    defaultDate,
    value,
    placeholder,
    required = false,
}: PropsType) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Keep input value in sync with parent
    // Set input value as DD/MM/YYYY, but keep flatpickr value in sync
    useEffect(() => {
        if (inputRef.current) {
            // Always show DD/MM/YYYY in the input
            inputRef.current.value = value ? formatDate(value, 'DD/MM/YYYY') : '';
        }
    }, [value]);

    useEffect(() => {
        if (!inputRef.current) return;

        const instance = flatpickr(inputRef.current, {
            mode: mode || 'single',
            monthSelectorType: 'static',
            dateFormat: 'Y-m-d',
            defaultDate: value || defaultDate,
            onChange,
        });

        // Prevent flatpickr from overwriting our formatted value
        if (inputRef.current) {
            inputRef.current.value = value ? formatDate(value, 'DD/MM/YYYY') : '';
        }

        return () => {
            instance.destroy();
        };
    }, [mode, onChange, defaultDate, value]);

    return (
        <div>
            {label && <Label htmlFor={id}>{label}</Label>}

            <div className="relative">
                <input
                    ref={inputRef}
                    id={id}
                    name={name}
                    placeholder={placeholder}
                    className="w-full rounded-lg border appearance-none pl-4 pr-10 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 text-gray-800 border-gray-300"
                    autoComplete="off"
                    required={required}
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                </span>
            </div>
        </div>
    );
}
