'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'outlineViolet' | 'cancel';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
    children: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function ButtonComponent({
    children,
    variant = 'primary',
    size = 'md',
    disabled,
    className,
    ...props
}: ButtonProps) {
    const base = 'w-full inline-flex items-center justify-center rounded-xl font-medium transition cursor-pointer active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100';

    const variants: Record<ButtonVariant, string> = {
        primary:
            'bg-brand-600 hover:bg-brand-800 hover:text-white text-white',
        secondary:
            'bg-gray-200 text-gray-800 hover:bg-gray-300',
        danger:
            'bg-red-600 text-white hover:bg-red-700',
        outline:
            'border border-gray-300 text-gray-700 hover:bg-gray-100',
        outlineViolet:
            'border border-brand-500 bg-white text-brand-600 hover:bg-brand-600 hover:text-white',
        cancel:
            'bg-gray-200 hover:bg-gray-300 text-gray-700',
    };

    const sizes: Record<ButtonSize, string> = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-2.5 text-base',
    };

    return (
        <button {...props} disabled={disabled} className={`${base} ${variants[variant]} ${sizes[size]} ${className ?? ''}`}>
            {children}
        </button>
    );
}
