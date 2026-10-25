'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Policy, readPolicy } from '@/service/privacyService';
import { ResponseApi } from '@/type/common/ResponseApi';
import { formatDate } from '@/utils/formatterUtils';
import { PAGE_LOGIN } from '@/utils/endpointUtils';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import AppLogo from '../ui/AppLogo';
import PolicyView from './PolicyView';

// The public privacy policy page: readable without signing in.
export default function PrivacyPage() {
    const { language, t } = useLanguage();
    const [policy, setPolicy] = useState<Policy | null>(null);
    const [failed, setFailed] = useState<boolean>(false);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const res: Response = await readPolicy(language);
                const data: ResponseApi<Policy> = await res.json();
                if (!cancelled) {
                    setPolicy(res.ok ? data.data : null);
                    setFailed(!res.ok);
                }
            } catch {
                if (!cancelled) setFailed(true);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [language]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-brand-100 px-4 py-8">
            <div className="mx-auto max-w-3xl">
                <div className="mb-4 flex items-center justify-between">
                    <AppLogo size={32} />
                    {/* A choice of language only makes sense when the policy exists in both. */}
                    {policy?.bilingual ? <LanguageSwitcher /> : <span />}
                </div>
                <div className="rounded-lg bg-white p-6 shadow-lg sm:p-10">
                    {failed && <p className="text-sm text-red-600">{t('The policy could not be loaded.')}</p>}
                    {!policy && !failed && <div className="h-40 animate-pulse rounded bg-gray-100" />}
                    {policy && (
                        <>
                            <PolicyView content={policy.content} />
                            {!policy.builtIn && policy.publishedAt && (
                                <p className="mt-8 border-t border-gray-100 pt-4 text-xs text-gray-400">
                                    {t('Version {version}, published {date}', { version: policy.version, date: formatDate(policy.publishedAt, 'DD/MM/YYYY') })}
                                </p>
                            )}
                        </>
                    )}
                </div>
                <Link href={PAGE_LOGIN} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700">
                    <ArrowLeft size={14} /> {t('Back to Login')}
                </Link>
            </div>
        </div>
    );
}
