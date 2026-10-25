'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, XCircle } from 'lucide-react';
import PasswordField from '../ui/PasswordField';
import ButtonComponent from '../ui/ButtonComponent';
import AuthCard from './AuthCard';
import { useCsrf } from '@/context/CsrfContext';
import { readPasswordPolicy, submitPasswordReset } from '@/service/passwordService';
import { PasswordPolicy } from '@/type/password';
import { PAGE_FORGOT_PASSWORD, PAGE_LOGIN } from '@/utils/endpointUtils';
import { DEFAULT_PASSWORD_POLICY, describePasswordPolicy, validatePassword } from '@/utils/passwordPolicyUtils';
import { sha256 } from '@/utils/sha256Utils';
import { useT } from '@/context/LanguageContext';

export default function ResetPasswordComponent({ token }: { token: string }) {
    const t = useT();
    const { csrf, setCsrf } = useCsrf();
    const [password, setPassword] = useState<string>('');
    const [confirmation, setConfirmation] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [done, setDone] = useState<boolean>(false);
    const [policy, setPolicy] = useState<PasswordPolicy>(DEFAULT_PASSWORD_POLICY);

    useEffect(() => {
        readPasswordPolicy().then(setPolicy);
    }, []);

    if (!token) {
        return (
            <AuthCard icon={<XCircle size={28} />} title={t('Link not valid')} subtitle={t('This reset link is incomplete. Request a new one.')}>
                <Link href={PAGE_FORGOT_PASSWORD} className="block text-center text-sm font-medium text-brand-600 hover:text-brand-700">
                    {t('Request a new link')}
                </Link>
            </AuthCard>
        );
    }

    if (done) {
        return (
            <AuthCard icon={<CheckCircle2 size={28} />} title={t('Password changed')} subtitle={t('You can now log in with your new password. Any other device was signed out.')}>
                <Link href={PAGE_LOGIN} className="block">
                    <ButtonComponent type="button" className="font-semibold py-2 px-4 rounded-lg">{t('Go to Login')}</ButtonComponent>
                </Link>
            </AuthCard>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const policyError: string | null = validatePassword(password, policy);
        if (policyError) { setError(policyError); return; }
        if (password !== confirmation) { setError(t('Password confirmation does not match')); return; }

        setLoading(true);
        try {
            const initialCsrf: string = csrf || document.getElementById('constants')?.dataset.csrf || '';
            const response: Response = await submitPasswordReset(token, sha256(password), initialCsrf, setCsrf);
            if (!response.ok) {
                const data: { message?: string } = await response.json().catch(() => ({}));
                setError(data.message || t('Failed to reset the password'));
                return;
            }
            setDone(true);
        } catch {
            setError(t('Failed to reset the password'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard icon={<KeyRound size={28} />} title={t('Choose a new password')} subtitle={t('Pick a password you have not used elsewhere.')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                        {error}{' '}
                        {error.includes('invalid or has expired') && (
                            <Link href={PAGE_FORGOT_PASSWORD} className="font-semibold underline">{t('Request a new link')}</Link>
                        )}
                    </div>
                )}
                <PasswordField
                    id="password"
                    label={t('New Password')}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder={describePasswordPolicy(policy)}
                />
                <PasswordField
                    id="confirmation"
                    label={t('Confirm New Password')}
                    autoComplete="new-password"
                    value={confirmation}
                    onChange={(e) => { setConfirmation(e.target.value); setError(''); }}
                    placeholder={t('Re-enter new password')}
                />
                <ButtonComponent type="submit" disabled={loading} className="gap-1.5 font-semibold py-2 px-4 rounded-lg">
                    {loading ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Reset password'}
                </ButtonComponent>
            </form>
            <Link href={PAGE_LOGIN} className="mt-6 flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
                <ArrowLeft size={14} /> Back to Login
            </Link>
        </AuthCard>
    );
}
