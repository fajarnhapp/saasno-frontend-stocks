'use client';

import { useUser } from '@/context/UserContext';
import { formatDate } from '@/utils/formatterUtils';
import { ShieldCheck, Calendar, Clock, KeyRound, Smartphone } from 'lucide-react';
import Link from 'next/link';
import BadgeComponent from '@/component/ui/BadgeComponent';
import SessionList from '../session/SessionList';
import AvatarEditor from './AvatarEditor';
import PersonCard from './PersonCard';
import RecentSignIns from './RecentSignIns';
import ApiTokensCard from './ApiTokensCard';
import PrivacyCard from '../privacy/PrivacyCard';
import { useT } from '@/context/LanguageContext';

const STATUS_VARIANT: Record<string, 'green' | 'gray' | 'red' | 'orange'> = {
    ACTIVED: 'green',
    INACTIVED: 'gray',
    BLOCKED: 'red',
    SUSPEND: 'orange',
    CLOSED: 'gray',
};

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</span>
            <div className="text-sm text-gray-800">{children}</div>
        </div>
    );
}

export default function ProfileComponent() {
    const t = useT();
    const { user, loading } = useUser();

    if (loading) {
        return (
            <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
                {[1, 2].map(i => (
                    <div key={i} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4 animate-pulse">
                        <div className="h-4 w-32 bg-gray-200 rounded" />
                        <div className="grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(j => (
                                <div key={j} className="space-y-2">
                                    <div className="h-2 w-20 bg-gray-100 rounded" />
                                    <div className="h-4 w-32 bg-gray-200 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        // Two columns on a wide screen (who you are on the left, security and devices on the right), one column on a narrow one.
        <div className="grid w-full grid-cols-1 items-start gap-5 lg:grid-cols-2">
            <div className="min-w-0 space-y-5">

            {/* Identity card */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                {/* brand header strip */}
                <div className="h-2 bg-gradient-to-r from-brand-500 to-brand-400" />

                <div className="p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div>
                            <h2 className="text-base font-semibold text-gray-800">{user.fullName || user.username}</h2>
                            <p className="text-xs text-gray-400">{user.fullName ? `@${user.username}` : t('User Profile')}</p>
                        </div>
                        <div className="ml-auto">
                            <BadgeComponent variant={STATUS_VARIANT[user.status || ''] || 'gray'}>
                                {user.status ?? '-'}
                            </BadgeComponent>
                        </div>
                    </div>

                    <div className="mb-6 pb-5 border-b border-gray-100">
                        <AvatarEditor />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <InfoRow label={t('Username')}>
                            <span className="font-mono">{user.username ?? '-'}</span>
                        </InfoRow>

                        <InfoRow label={t('User ID')}>
                            <span className="font-mono text-xs break-all text-gray-500">{user.id ?? '-'}</span>
                        </InfoRow>

                        <InfoRow label={t('Role')}>
                            <div className="flex flex-wrap gap-1">
                                {(user.roles ?? []).length > 0
                                    ? (user.roles ?? []).map(r => (
                                        <BadgeComponent key={r.id} variant="blue">{r.name}</BadgeComponent>
                                    ))
                                    : <span className="text-gray-400">-</span>
                                }
                            </div>
                        </InfoRow>

                        <InfoRow label={t('Status')}>
                            <BadgeComponent variant={STATUS_VARIANT[user.status || ''] || 'gray'}>
                                {user.status ?? '-'}
                            </BadgeComponent>
                        </InfoRow>

                        <InfoRow label={t('Registered')}>
                            <span className="flex items-center gap-1.5 text-gray-600">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                {user.registered ? formatDate(user.registered, 'DD/MM/YYYY HH:mm') : '-'}
                            </span>
                        </InfoRow>

                        <InfoRow label={t('Last Modified')}>
                            <span className="flex items-center gap-1.5 text-gray-600">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                {user.modificated ? formatDate(user.modificated, 'DD/MM/YYYY HH:mm') : '-'}
                            </span>
                        </InfoRow>
                    </div>
                </div>
            </div>

            {/* Biodata and contacts */}
            <PersonCard />
            </div>

            <div className="min-w-0 space-y-5">
            {/* Security card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-500" />
                    {t('Security')}
                </h3>

                <div className="space-y-3">
                    <Link
                        href="/security"
                        className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 hover:border-brand-200 hover:bg-brand-50 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <KeyRound className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors" />
                            <div>
                                <p className="text-sm font-medium text-gray-700 group-hover:text-brand-700">{t('Change Password')}</p>
                                <p className="text-xs text-gray-400">{t('Update your account password')}</p>
                            </div>
                        </div>
                        <span className="text-xs text-gray-400 group-hover:text-brand-500">→</span>
                    </Link>

                    <Link
                        href="/security"
                        className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 hover:border-brand-200 hover:bg-brand-50 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <Smartphone className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors" />
                            <div>
                                <p className="text-sm font-medium text-gray-700 group-hover:text-brand-700">{t('Two-Factor Authentication')}</p>
                                <p className="text-xs text-gray-400">
                                    {user.twoFactorAuth ? '2FA is enabled on your account' : '2FA is not enabled'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {user.twoFactorAuth
                                ? <BadgeComponent variant="green">ON</BadgeComponent>
                                : <BadgeComponent variant="gray">OFF</BadgeComponent>
                            }
                            <span className="text-xs text-gray-400 group-hover:text-brand-500">→</span>
                        </div>
                    </Link>
                </div>
            </div>

            <PrivacyCard />

            <ApiTokensCard />

            <RecentSignIns />

            {/* Devices currently signed in */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="mb-1 text-sm font-semibold text-gray-800">{t('Signed-in devices')}</h3>
                <p className="mb-3 text-xs text-gray-400">{t('Sign out devices you do not recognize or have lost.')}</p>
                <SessionList scope="mine" />
            </div>
            </div>
        </div>
    );
}
