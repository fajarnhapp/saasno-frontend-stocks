'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, MailCheck, XCircle } from 'lucide-react';
import ButtonComponent from '../ui/ButtonComponent';
import AuthCard from './AuthCard';
import { useCsrf } from '@/context/CsrfContext';
import { confirmEmail } from '@/service/personService';
import { PAGE_LOGIN } from '@/utils/endpointUtils';
import { useT } from '@/context/LanguageContext';

// The page behind the link in the confirmation email. The address is confirmed by pressing the button, not on load,
// so a mail scanner that opens links cannot use up the link.
export default function VerifyEmailComponent({ token }: { token: string }) {
    const t = useT();
    const { csrf, setCsrf } = useCsrf();
    const [loading, setLoading] = useState<boolean>(false);
    const [done, setDone] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    if (!token) {
        return (
            <AuthCard icon={<XCircle size={28} />} title={t('Link not valid')} subtitle={t('This confirmation link is incomplete. Request a new one from your profile.')}>
                <Link href={PAGE_LOGIN} className="block text-center text-sm font-medium text-brand-600 hover:text-brand-700">{t('Go to Login')}</Link>
            </AuthCard>
        );
    }

    if (done) {
        return (
            <AuthCard icon={<CheckCircle2 size={28} />} title={t('Email confirmed')} subtitle={t('Thank you. This address can now be used to recover your account.')}>
                <Link href={PAGE_LOGIN} className="block">
                    <ButtonComponent type="button" className="font-semibold py-2 px-4 rounded-lg">{t('Go to Login')}</ButtonComponent>
                </Link>
            </AuthCard>
        );
    }

    const confirm = async () => {
        setLoading(true);
        setError('');
        try {
            const initialCsrf: string = csrf || document.getElementById('constants')?.dataset.csrf || '';
            const response: Response = await confirmEmail(token, initialCsrf, setCsrf);
            if (!response.ok) {
                const data: { message?: string } = await response.json().catch(() => ({}));
                setError(data.message || t('The link is invalid or has expired'));
                return;
            }
            setDone(true);
        } catch {
            setError(t('Something went wrong, please try again'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard icon={<MailCheck size={28} />} title={t('Confirm your email')} subtitle={t('Press the button to confirm that this email address is yours.')}>
            {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <ButtonComponent type="button" onClick={confirm} disabled={loading} className="font-semibold py-2 px-4 rounded-lg">
                {loading ? 'Confirming…' : 'Confirm email address'}
            </ButtonComponent>
        </AuthCard>
    );
}
