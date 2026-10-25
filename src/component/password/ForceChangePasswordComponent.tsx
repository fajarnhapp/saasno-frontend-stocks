'use client';

import { useEffect, useState } from 'react';
import { Loader2, LogOut, ShieldAlert } from 'lucide-react';
import PasswordField from '../ui/PasswordField';
import ButtonComponent from '../ui/ButtonComponent';
import AuthCard from './AuthCard';
import { useCsrf } from '@/context/CsrfContext';
import { readPasswordPolicy } from '@/service/passwordService';
import { logout } from '@/service/logoutService';
import { changePassword } from '@/service/userService';
import { PasswordPolicy } from '@/type/password';
import { PAGE_DASHBOARD, PAGE_LOGIN } from '@/utils/endpointUtils';
import { DEFAULT_PASSWORD_POLICY, describePasswordPolicy, validatePassword } from '@/utils/passwordPolicyUtils';
import { sha256 } from '@/utils/sha256Utils';
import { useT } from '@/context/LanguageContext';

// Shown right after login when the password is the default/reset one or has expired: nothing else works until it is changed.
export default function ForceChangePasswordComponent() {
    const t = useT();
    const { csrf, setCsrf } = useCsrf();
    const [current, setCurrent] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmation, setConfirmation] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [policy, setPolicy] = useState<PasswordPolicy>(DEFAULT_PASSWORD_POLICY);

    useEffect(() => {
        readPasswordPolicy().then(setPolicy);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!current) { setError(t('Current password is required')); return; }
        const policyError: string | null = validatePassword(password, policy);
        if (policyError) { setError(policyError); return; }
        if (password !== confirmation) { setError(t('Password confirmation does not match')); return; }

        setLoading(true);
        try {
            const initialCsrf: string = csrf || document.getElementById('constants')?.dataset.csrf || '';
            const response: Response = await changePassword(sha256(password), sha256(current), initialCsrf, setCsrf);
            if (!response.ok) {
                const data: { message?: string } = await response.json().catch(() => ({}));
                setError(response.status === 403 ? 'You do not have access to this feature' : data.message || t('Failed to change the password'));
                return;
            }
            window.location.href = PAGE_DASHBOARD;
        } catch {
            setError(t('Failed to change the password'));
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout(csrf);
        window.location.href = PAGE_LOGIN;
    };

    return (
        <AuthCard
            icon={<ShieldAlert size={28} />}
            title={t('Change your password')}
            subtitle={t('Your password was set by an administrator or has expired. Choose a new one to continue.')}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>
                )}
                <PasswordField
                    id="current"
                    label={t('Current Password')}
                    autoComplete="current-password"
                    value={current}
                    onChange={(e) => { setCurrent(e.target.value); setError(''); }}
                    placeholder={t('The password you just logged in with')}
                />
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
                    {loading ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Change password'}
                </ButtonComponent>
            </form>
            <button
                type="button"
                onClick={handleLogout}
                className="mt-6 flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition cursor-pointer mx-auto"
            >
                <LogOut size={14} /> Log out
            </button>
        </AuthCard>
    );
}
