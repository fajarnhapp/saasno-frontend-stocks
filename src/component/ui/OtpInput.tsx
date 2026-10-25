'use client';

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from 'react';

interface OtpInputProps {
    onComplete: (code: string) => void;
    loading?: boolean;
    autoFocus?: boolean;
    length?: number;
    onReset?: number;
}

export default function OtpInput({
    onComplete,
    loading = false,
    autoFocus = false,
    length = 6,
    onReset,
}: OtpInputProps) {
    const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
    const refs = useRef<Array<HTMLInputElement | null>>([]);

    useEffect(() => {
        if (autoFocus) refs.current[0]?.focus();
    }, [autoFocus]);

    // Adjust state on prop change (bukan lewat effect, mengikuti pola resmi React) — mengosongkan
    // digit setiap parent mengganti kunci reset (mis. setelah kode salah atau panel dibuka ulang).
    const [prevReset, setPrevReset] = useState(onReset);
    if (onReset !== prevReset) {
        setPrevReset(onReset);
        setDigits(Array(length).fill(''));
    }

    const focusAt = (index: number) =>
        refs.current[Math.max(0, Math.min(index, length - 1))]?.focus();

    const handleChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[index] = digit;
        setDigits(next);
        if (digit && index < length - 1) focusAt(index + 1);
        const code = next.join('');
        if (code.length === length && !next.includes('')) onComplete(code);
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (digits[index]) {
                const next = [...digits];
                next[index] = '';
                setDigits(next);
            } else {
                focusAt(index - 1);
            }
        } else if (e.key === 'ArrowLeft') {
            focusAt(index - 1);
        } else if (e.key === 'ArrowRight') {
            focusAt(index + 1);
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        if (!pasted) return;
        const next = [...digits];
        for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
        setDigits(next);
        focusAt(Math.min(pasted.length, length - 1));
        if (pasted.length === length) onComplete(pasted);
    };

    return (
        <div className="flex gap-2 justify-center" aria-label="6-digit OTP code">
            {digits.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => { refs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={1}
                    value={digit}
                    disabled={loading}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    onFocus={(e) => e.target.select()}
                    aria-label={`Digit ${index + 1}`}
                    className={`
                        w-11 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none transition
                        ${digit ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-900'}
                        focus:border-brand-500 focus:ring-2 focus:ring-brand-100
                        disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                />
            ))}
        </div>
    );
}
