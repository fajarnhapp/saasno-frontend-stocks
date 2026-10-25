'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import InputComponent from './InputComponent';

interface PasswordFieldProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    autoComplete?: string;
    id?: string;
}

// A password input with a show/hide toggle.
export default function PasswordField({ label, value, onChange, placeholder, autoComplete, id }: PasswordFieldProps) {
    const [show, setShow] = useState<boolean>(false);

    return (
        <div>
            <label htmlFor={id} className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
            <div className="relative">
                <InputComponent
                    id={id}
                    type={show ? 'text' : 'password'}
                    autoComplete={autoComplete}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="pr-10"
                />
                <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                    tabIndex={-1}
                >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
        </div>
    );
}
