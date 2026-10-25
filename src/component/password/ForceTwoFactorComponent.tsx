'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2, LogOut, ShieldAlert } from 'lucide-react';
import OtpInput from '../ui/OtpInput';
import ButtonComponent from '../ui/ButtonComponent';
import RecoveryCodesPanel from '../security/RecoveryCodesPanel';
import AuthCard from './AuthCard';
import { useCsrf } from '@/context/CsrfContext';
import { logout } from '@/service/logoutService';
import { enableTwoFactor, setupTwoFactor } from '@/service/userService';
import { API_MSG_SUCCESS, handleResponseApi } from '@/utils/responseApiUtils';
import { ResponseApi } from '@/type/common/ResponseApi';
import { RecoveryCodes, TwoFactorSetup } from '@/type/security';
import { PAGE_DASHBOARD, PAGE_LOGIN } from '@/utils/endpointUtils';

type Step = 'idle' | 'scanning' | 'done';

// Shown right after login when two-factor authentication is required but not set up yet: nothing else works until it is.
export default function ForceTwoFactorComponent() {
    const { csrf, setCsrf } = useCsrf();
    const [step, setStep] = useState<Step>('idle');
    const [setupUri, setSetupUri] = useState<string>('');
    const [codes, setCodes] = useState<string[]>([]);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [otpResetKey, setOtpResetKey] = useState<number>(0);
    const [showManualUri, setShowManualUri] = useState<boolean>(false);

    // The CSRF token is only in context once a request has returned one; on this first page it is still in the page.
    const token = (): string => csrf || document.getElementById('constants')?.dataset.csrf || '';

    const handleStart = async () => {
        setLoading(true);
        setError('');
        try {
            const res: Response = await setupTwoFactor(token(), setCsrf);
            const data: ResponseApi<TwoFactorSetup> = await handleResponseApi(res);
            if (data.message !== API_MSG_SUCCESS || !data.data?.setupUri) {
                setError(data.message || 'Failed to start OTP setup');
                return;
            }
            setSetupUri(data.data.setupUri);
            setStep('scanning');
            setOtpResetKey((k) => k + 1);
        } catch {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleEnable = async (code: string) => {
        setLoading(true);
        setError('');
        try {
            const res: Response = await enableTwoFactor(code, token(), setCsrf);
            const data: ResponseApi<RecoveryCodes> = await handleResponseApi(res);
            if (data.message !== API_MSG_SUCCESS) {
                setError(data.message || 'Invalid OTP code');
                setOtpResetKey((k) => k + 1);
                return;
            }
            setCodes(data.data?.codes ?? []);
            setStep('done');
        } catch {
            setError('An error occurred');
            setOtpResetKey((k) => k + 1);
        } finally {
            setLoading(false);
        }
    };

    const finish = () => {
        window.location.href = PAGE_DASHBOARD;
    };

    const handleLogout = async () => {
        await logout(token());
        window.location.href = PAGE_LOGIN;
    };

    return (
        <AuthCard
            icon={<ShieldAlert size={28} />}
            title="Set up two-factor authentication"
            subtitle={step === 'done'
                ? 'Two-factor authentication is now active. Keep your recovery codes safe.'
                : 'Two-factor authentication is required for every account. Set it up to continue.'}
        >
            <div className="space-y-5">
                {error && (
                    <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>
                )}

                {step === 'idle' && (
                    <>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-500">
                            <li>Install <strong>Google / Microsoft Authenticator</strong> on your phone</li>
                            <li>Scan the QR code shown on the next step</li>
                            <li>Enter the 6-digit code from the app to confirm</li>
                        </ol>
                        <ButtonComponent type="button" onClick={handleStart} disabled={loading} className="gap-1.5 font-semibold py-2 px-4 rounded-lg">
                            {loading ? <><Loader2 size={14} className="animate-spin" /> Processing...</> : 'Start setup'}
                        </ButtonComponent>
                    </>
                )}

                {step === 'scanning' && (
                    <>
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-gray-700">1. Scan the QR code with the authenticator app:</p>
                            <div className="flex justify-center">
                                <div className="inline-block rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                                    <QRCodeSVG value={setupUri} size={180} level="M" />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowManualUri((v) => !v)}
                                className="block mx-auto text-xs text-gray-400 hover:text-gray-600 transition cursor-pointer"
                            >
                                {showManualUri ? 'Hide URI' : "Can't scan? Show manual URI"}
                            </button>
                            {showManualUri && (
                                <code className="block text-xs break-all rounded-lg bg-gray-100 px-3 py-2 text-gray-500 select-all">{setupUri}</code>
                            )}
                        </div>
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-gray-700">2. Enter the 6-digit code from the app:</p>
                            <OtpInput onComplete={handleEnable} loading={loading} autoFocus onReset={otpResetKey} />
                            <p className="text-xs text-gray-400 text-center">Code changes every 30 seconds</p>
                        </div>
                    </>
                )}

                {step === 'done' && (
                    codes.length > 0
                        ? <RecoveryCodesPanel codes={codes} onDone={finish} />
                        : <ButtonComponent type="button" onClick={finish} className="font-semibold py-2 px-4 rounded-lg">Continue</ButtonComponent>
                )}
            </div>

            {step !== 'done' && (
                <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-6 flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition cursor-pointer mx-auto"
                >
                    <LogOut size={14} /> Log out
                </button>
            )}
        </AuthCard>
    );
}
