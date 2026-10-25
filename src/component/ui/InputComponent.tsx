import { useT } from '@/context/LanguageContext';
import { formatCurrency } from '@/utils/formatterUtils';
import React, { useState } from 'react';

interface InputComponentProps {
    id?: string;
    label?: string;
    type?: "text" | "number" | "email" | "password" | "date" | "time" | "datetime" | "currency" | string;
    autoComplete?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement> & { numericValue?: string; }) => void;
    className?: string;
    message?: string;
    required?: boolean;
    error?: boolean;
    disabled?: boolean;
}

export default function InputComponent({
    id,
    label,
    type = 'text',
    autoComplete,
    placeholder,
    value = '',
    onChange,
    className,
    message = 'This field is required',
    required = false,
    error = false,
    disabled = false,
}: InputComponentProps) {
    const t = useT();
    const [displayValue, setDisplayValue] = useState<string>(() => type === "currency" ? formatCurrency(String(value ?? "")) : "");
    // State lokal khusus untuk menangani input time agar tidak bentrok saat diketik
    const [localTimeValue, setLocalTimeValue] = useState<string>("");

    // Sinkronisasi value dari parent ke state lokal — di-adjust langsung saat render
    // (bukan lewat effect) mengikuti pola resmi React untuk "adjust state on prop change".
    const [prevValue, setPrevValue] = useState(value);
    const [prevType, setPrevType] = useState(type);
    if (value !== prevValue || type !== prevType) {
        setPrevValue(value);
        setPrevType(type);
        if (type === "currency" && value !== undefined && value !== null) {
            setDisplayValue(formatCurrency(String(value)));
        } else if (type === "time") {
            setLocalTimeValue(value || "");
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const targetValue = e.target.value;

        if (type === "currency") {
            const raw = targetValue.replace(/\D/g, "");
            setDisplayValue(formatCurrency(raw));

            if (onChange) {
                const customEvent = {
                    ...e,
                    target: { ...e.target, value: raw },
                    numericValue: raw,
                };
                onChange(customEvent as React.ChangeEvent<HTMLInputElement> & { numericValue?: string });
            }
            return;
        }

        if (type === "time") {
            // Update state lokal dulu agar ketikan pengguna tidak hilang/patah-patah
            setLocalTimeValue(targetValue);

            // Hanya kirim ke parent jika format sudah valid (tidak kosong)
            if (targetValue !== "") {
                onChange?.(e);
            }
            return;
        }

        onChange?.(e);
    };

    // Tentukan value mana yang akan ditampilkan ke layar
    const inputValue = type === "currency" ? displayValue : (type === "time" ? localTimeValue : value);

    let initialClassname = `w-full px-4 py-2 border border-gray-200 rounded-lg outline-none transition `;
    if (required && error) {
        initialClassname += `border-red-500 focus:ring-2 focus:ring-red-500`;
    } else {
        initialClassname += className;
    }
    if (disabled) {
        initialClassname += ` bg-gray-100 cursor-not-allowed`;
    }

    return (
        <div>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <input
                id={id}
                name={id}
                type={type === "currency" || type === "number" ? "text" : type}
                autoComplete={autoComplete}
                placeholder={placeholder ?? t('Fill in this field ...')}
                value={inputValue}
                onChange={handleChange}
                className={initialClassname}
                required={required}
                disabled={disabled}
                step={type === "time" ? "1" : undefined}
            />
            {required && error && (
                <p className="mt-1 text-sm text-red-500">
                    {t(message)}
                </p>
            )}
        </div>
    );
}