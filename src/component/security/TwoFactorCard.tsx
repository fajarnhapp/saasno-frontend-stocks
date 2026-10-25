'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ChevronDown, ChevronUp, KeyRound, Loader2, ShieldCheck, ShieldOff, Smartphone } from 'lucide-react';
import OtpInput from '../ui/OtpInput';
import ButtonComponent from '../ui/ButtonComponent';
import { useCsrf } from '@/context/CsrfContext';
import { useModal } from '@/context/ModalContext';
import { useUser } from '@/context/UserContext';
import { disableTwoFactor, enableTwoFactor, regenerateRecoveryCodes, setupTwoFactor } from '@/service/userService';
import { API_MSG_SUCCESS, handleResponseApi } from '@/utils/responseApiUtils';
import { ResponseApi } from '@/type/common/ResponseApi';
import { RecoveryCodes, TwoFactorSetup } from '@/type/security';
import RecoveryCodesPanel from './RecoveryCodesPanel';

type Panel = 'none' | 'setup' | 'disable' | 'recovery';
type SetupStep = 'idle' | 'scanning' | 'done';

export default function TwoFactorCard() {
    const { user, loading: userLoading } = useUser();
    const { csrf, setCsrf } = useCsrf();
    const { showModal, contentModalSuccess } = useModal();

    const [enabled, setEnabled] = useState<boolean>(false);
    const [prevUserEnabled, setPrevUserEnabled] = useState<boolean | undefined>(undefined);
    if (!userLoading && user.twoFactorAuth !== prevUserEnabled) {
        setPrevUserEnabled(user.twoFactorAuth);
        setEnabled(!!user.twoFactorAuth);
    }

    const [activePanel, setActivePanel] = useState<Panel>('none');

    const [setupStep, setSetupStep] = useState<SetupStep>('idle');
    const [setupUri, setSetupUri] = useState('');
    const [setupLoading, setSetupLoading] = useState(false);
    const [setupError, setSetupError] = useState('');
    const [otpResetKey, setOtpResetKey] = useState(0);
    const [showManualUri, setShowManualUri] = useState(false);

    // Codes just created (shown once), and how many the user still has.
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [recoveryLeft, setRecoveryLeft] = useState<number | undefined>(undefined);
    const [recoveryLoading, setRecoveryLoading] = useState(false);
    const [recoveryError, setRecoveryError] = useState('');
    const [recoveryOtpResetKey, setRecoveryOtpResetKey] = useState(0);

    const [disableLoading, setDisableLoading] = useState(false);
    const [disableError, setDisableError] = useState('');
    const [disableOtpResetKey, setDisableOtpResetKey] = useState(0);

    const togglePanel = (panel: Panel) => {
        if (activePanel === panel) {
            closePanel();
            return;
        }
        setActivePanel(panel);
        setSetupStep('idle');
        setSetupUri('');
        setSetupError('');
        setDisableError('');
        setRecoveryError('');
        setRecoveryCodes([]);
        setOtpResetKey((k) => k + 1);
        setDisableOtpResetKey((k) => k + 1);
        setRecoveryOtpResetKey((k) => k + 1);
        setShowManualUri(false);
    };

    const closePanel = () => {
        setActivePanel('none');
        setSetupStep('idle');
        setSetupUri('');
        setSetupError('');
        setDisableError('');
        setRecoveryError('');
        setRecoveryCodes([]);
        setShowManualUri(false);
    };

    const handleStartSetup = async () => {
        setSetupLoading(true);
        setSetupError('');
        try {
            const res = await setupTwoFactor(csrf, setCsrf);
            const data: ResponseApi<TwoFactorSetup> = await handleResponseApi(res);
            if (data.message !== API_MSG_SUCCESS || !data.data?.setupUri) {
                setSetupError(data.message || 'Failed to start OTP setup');
                return;
            }
            setSetupUri(data.data.setupUri);
            setSetupStep('scanning');
            setOtpResetKey((k) => k + 1);
        } catch {
            setSetupError('An error occurred');
        } finally {
            setSetupLoading(false);
        }
    };

    const handleEnable = async (code: string) => {
        setSetupLoading(true);
        setSetupError('');
        try {
            const res = await enableTwoFactor(code, csrf, setCsrf);
            const data: ResponseApi<RecoveryCodes> = await handleResponseApi(res);
            if (data.message !== API_MSG_SUCCESS) {
                setSetupError(data.message || 'Invalid OTP code');
                setOtpResetKey((k) => k + 1);
                return;
            }
            setRecoveryCodes(data.data?.codes ?? []);
            setRecoveryLeft(data.data?.codes?.length);
            setSetupStep('done');
            setEnabled(true);
        } catch {
            setSetupError('An error occurred');
            setOtpResetKey((k) => k + 1);
        } finally {
            setSetupLoading(false);
        }
    };

    const handleRegenerate = async (code: string) => {
        setRecoveryLoading(true);
        setRecoveryError('');
        try {
            const res = await regenerateRecoveryCodes(code, csrf, setCsrf);
            const data: ResponseApi<RecoveryCodes> = await handleResponseApi(res);
            if (data.message !== API_MSG_SUCCESS || !data.data?.codes) {
                setRecoveryError(data.message || 'Invalid OTP code');
                setRecoveryOtpResetKey((k) => k + 1);
                return;
            }
            setRecoveryCodes(data.data.codes);
            setRecoveryLeft(data.data.codes.length);
        } catch {
            setRecoveryError('An error occurred');
            setRecoveryOtpResetKey((k) => k + 1);
        } finally {
            setRecoveryLoading(false);
        }
    };

    const handleDisable = async (code: string) => {
        setDisableLoading(true);
        setDisableError('');
        try {
            const res = await disableTwoFactor(code, csrf, setCsrf);
            const data: ResponseApi<void> = await handleResponseApi(res);
            if (data.message !== API_MSG_SUCCESS) {
                setDisableError(data.message || 'Invalid OTP code');
                setDisableOtpResetKey((k) => k + 1);
                return;
            }
            setEnabled(false);
            closePanel();
            showModal(contentModalSuccess('Two-Factor Authentication successfully disabled.'));
        } catch {
            setDisableError('An error occurred');
            setDisableOtpResetKey((k) => k + 1);
        } finally {
            setDisableLoading(false);
        }
    };

    if (userLoading) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${enabled ? 'bg-brand-50 text-brand-600' : 'bg-gray-100 text-gray-400'}`}>
                        {enabled ? <ShieldCheck size={20} /> : <ShieldOff size={20} />}
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">Two-Factor Authentication</h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {enabled
                                ? 'Active — every login requires a code from the authenticator app'
                                : 'Inactive — add an extra layer of security'}
                        </p>
                    </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${enabled ? 'bg-brand-50 text-brand-700' : 'bg-gray-100 text-gray-500'}`}>
                    {enabled ? 'Active' : 'Inactive'}
                </span>
            </div>

            <div className="px-6 py-4 space-y-2">
                {!enabled && (
                    <button
                        type="button"
                        onClick={() => togglePanel('setup')}
                        className="w-full flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3 text-sm font-medium text-brand-700 hover:bg-brand-100 transition cursor-pointer"
                    >
                        <span className="flex items-center gap-2">
                            <Smartphone size={15} />
                            Enable Two-Factor Authentication
                        </span>
                        {activePanel === 'setup' ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                )}

                {enabled && (
                    <button
                        type="button"
                        onClick={() => togglePanel('recovery')}
                        className="w-full flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3 text-sm font-medium text-brand-700 hover:bg-brand-100 transition cursor-pointer"
                    >
                        <span className="flex items-center gap-2">
                            <KeyRound size={15} />
                            Recovery codes
                            <span className="text-xs font-normal text-gray-500">
                                ({recoveryLeft ?? user.recoveryCodesLeft ?? 0} left)
                            </span>
                        </span>
                        {activePanel === 'recovery' ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                )}

                {enabled && !user.twoFactorRequired && (
                    <button
                        type="button"
                        onClick={() => togglePanel('disable')}
                        className="w-full flex items-center justify-between rounded-xl border border-red-100 bg-red-50/40 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition cursor-pointer"
                    >
                        <span className="flex items-center gap-2">
                            <ShieldOff size={15} />
                            Disable Two-Factor Authentication
                        </span>
                        {activePanel === 'disable' ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                )}

                {activePanel === 'setup' && (
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 space-y-5">
                        {setupStep === 'idle' && (
                            <>
                                <div className="text-sm text-gray-600 space-y-1.5">
                                    <p className="font-medium text-gray-700">How OTP works:</p>
                                    <ol className="list-decimal list-inside space-y-1 text-gray-500">
                                        <li>Click <strong>Start Setup</strong> — the backend generates a secret key</li>
                                        <li>Scan the QR code with <strong>Google / Microsoft Authenticator</strong></li>
                                        <li>Enter the 6-digit code from the app to confirm</li>
                                    </ol>
                                </div>
                                {setupError && <p className="text-sm text-red-500">{setupError}</p>}
                                <div className="flex gap-2">
                                    <ButtonComponent size="sm" onClick={handleStartSetup} disabled={setupLoading} className="w-auto gap-1.5">
                                        {setupLoading ? <><Loader2 size={14} className="animate-spin" /> Processing...</> : 'Start Setup'}
                                    </ButtonComponent>
                                    <ButtonComponent variant="cancel" size="sm" onClick={closePanel} className="w-auto">Cancel</ButtonComponent>
                                </div>
                            </>
                        )}

                        {setupStep === 'scanning' && setupUri && (
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
                                        <code className="block text-xs break-all rounded-lg bg-gray-100 px-3 py-2 text-gray-500 select-all">
                                            {setupUri}
                                        </code>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <p className="text-sm font-medium text-gray-700">2. Enter the 6-digit code from the app:</p>
                                    {setupError && <p className="text-sm text-red-500 text-center">{setupError}</p>}
                                    <OtpInput
                                        onComplete={handleEnable}
                                        loading={setupLoading}
                                        autoFocus
                                        onReset={otpResetKey}
                                    />
                                    <p className="text-xs text-gray-400 text-center">Code changes every 30 seconds</p>
                                </div>
                                <ButtonComponent variant="cancel" size="sm" onClick={closePanel} className="w-auto">Cancel</ButtonComponent>
                            </>
                        )}

                        {setupStep === 'done' && (
                            <div className="space-y-4">
                                <div className="text-center">
                                    <p className="font-semibold text-gray-800">Two-Factor Authentication Active</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        The next login will require a code from the authenticator app.
                                    </p>
                                </div>
                                {recoveryCodes.length > 0
                                    ? <RecoveryCodesPanel codes={recoveryCodes} onDone={closePanel} />
                                    : <ButtonComponent size="sm" onClick={closePanel} className="w-auto">Done</ButtonComponent>}
                            </div>
                        )}
                    </div>
                )}

                {activePanel === 'recovery' && (
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 space-y-4">
                        {recoveryCodes.length > 0 ? (
                            <RecoveryCodesPanel codes={recoveryCodes} onDone={closePanel} />
                        ) : (
                            <>
                                <p className="text-sm text-gray-600">
                                    You have <strong>{recoveryLeft ?? user.recoveryCodesLeft ?? 0}</strong> unused recovery code(s). Generating new codes
                                    makes all the old ones stop working.
                                </p>
                                <div className="space-y-3">
                                    <p className="text-sm font-medium text-gray-700">Enter the code from the authenticator app to confirm:</p>
                                    {recoveryError && <p className="text-sm text-red-500 text-center">{recoveryError}</p>}
                                    <OtpInput
                                        onComplete={handleRegenerate}
                                        loading={recoveryLoading}
                                        autoFocus
                                        onReset={recoveryOtpResetKey}
                                    />
                                    <p className="text-xs text-gray-400 text-center">Code changes every 30 seconds</p>
                                </div>
                                <ButtonComponent variant="cancel" size="sm" onClick={closePanel} className="w-auto">Cancel</ButtonComponent>
                            </>
                        )}
                    </div>
                )}

                {activePanel === 'disable' && (
                    <div className="rounded-xl border border-red-100 bg-red-50/30 p-5 space-y-4">
                        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3">
                            <p className="text-sm text-red-700">
                                <strong>Warning:</strong> Disabling OTP will reduce your account&apos;s security.
                                The next login will only require a username and password.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-gray-700">
                                Enter the code from the authenticator app to confirm:
                            </p>
                            {disableError && <p className="text-sm text-red-500 text-center">{disableError}</p>}
                            <OtpInput
                                onComplete={handleDisable}
                                loading={disableLoading}
                                autoFocus
                                onReset={disableOtpResetKey}
                            />
                            <p className="text-xs text-gray-400 text-center">Code changes every 30 seconds</p>
                        </div>
                        <ButtonComponent variant="cancel" size="sm" onClick={closePanel} className="w-auto">Cancel</ButtonComponent>
                    </div>
                )}
            </div>
        </div>
    );
}
