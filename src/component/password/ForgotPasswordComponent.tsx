'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MailCheck, MailQuestion } from 'lucide-react';
import InputComponent from '../ui/InputComponent';
import ButtonComponent from '../ui/ButtonComponent';
import AuthCard from './AuthCard';
import { useCsrf } from '@/context/CsrfContext';
import { useLoading } from '@/context/LoadingCircleContext';
import { requestPasswordReset } from '@/service/passwordService';
import { PAGE_LOGIN } from '@/utils/endpointUtils';
import { useT } from '@/context/LanguageContext';

export default function ForgotPasswordComponent() {
    const t = useT();
    const { csrf, setCsrf } = useCsrf();
    const { handleLoading } = useLoading();
    const [email, setEmail] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [sent, setSent] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const value: string = email.trim();
        if (!value) {
            setError(t('Username or email is required'));
            return;
        }

        await handleLoading(async (): Promise<void> => {
            const initialCsrf: string = csrf || document.getElementById('constants')?.dataset.csrf || '';
            const response: Response = await requestPasswordReset(value, initialCsrf, setCsrf);
            if (!response.ok) {
                const data: { message?: string } = await response.json().catch(() => ({}));
                setError(data.message || t('Failed to send the reset link'));
                return;
            }
            setSent(true);
        });
    };

    if (sent) {
        return (
            <AuthCard
                icon={<MailCheck size={28} />}
                title={t('Check your email')}
                subtitle={<>If an account exists for <strong>{email.trim()}</strong>, we have sent a link to reset the password. The link works once and expires soon.</>}
            >
                <p className="text-center text-xs text-gray-400 mb-6">{t('Nothing arrived? Check the spam folder, or ask your administrator.')}</p>
                <Link href={PAGE_LOGIN} className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
                    <ArrowLeft size={14} /> Back to Login
                </Link>
            </AuthCard>
        );
    }

    return (
        <AuthCard
            icon={<MailQuestion size={28} />}
            title={t('Forgot password')}
            subtitle={t('Enter your username or account email and we will send a link to the email address of the account to choose a new password.')}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <InputComponent
                    id="email"
                    label={t('Username or email')}
                    type="text"
                    autoComplete="username"
                    placeholder={t('Enter your username or email')}
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    className="border-gray-300 focus:ring-2 focus:ring-brand-500"
                    error={!!error}
                    message={error}
                    required={!!error}
                />
                <ButtonComponent type="submit" className="disabled:bg-gray-400 font-semibold py-2 px-4 rounded-lg transition duration-200 cursor-pointer">
                    {t('Send reset link')}
                </ButtonComponent>
            </form>
            <Link href={PAGE_LOGIN} className="mt-6 flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
                <ArrowLeft size={14} /> Back to Login
            </Link>
        </AuthCard>
    );
}
