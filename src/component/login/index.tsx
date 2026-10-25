'use client';

import LanguageSwitcher from '@/component/ui/LanguageSwitcher';
import { useEffect, useState } from 'react';
import InputComponent from '../ui/InputComponent';
import OtpInput from '../ui/OtpInput';
import { useLoading } from '@/context/LoadingCircleContext';
import ButtonComponent from '../ui/ButtonComponent';
import { login, verifyLoginOtp } from '@/service/loginService';
import { ResponseApi } from '@/type/common/ResponseApi';
import { Login } from '@/type/login';
import { useModal } from '@/context/ModalContext';
import { sha256 } from '@/utils/sha256Utils';
import { useCsrf } from '@/context/CsrfContext';
import { ArrowLeft, Eye, EyeOff, LogIn, MessageSquareCode, ScrollText, ShieldAlert, ShieldCheck, Users, Wrench, Mail } from 'lucide-react';
import Link from 'next/link';
import { useAppSetting } from '@/context/AppSettingContext';
import AppLogo from '../ui/AppLogo';
import { isRecoveryCode, normalizeRecoveryCode } from '@/utils/recoveryCodeUtils';
import { formatUntil } from '@/utils/maintenanceUtils';
import { handleResponseApi } from '@/utils/responseApiUtils';
import { PAGE_CHANGE_PASSWORD, PAGE_DASHBOARD, PAGE_FORGOT_PASSWORD, PAGE_PRIVACY, PAGE_SETUP_TWO_FACTOR } from '@/utils/endpointUtils';
import { useT } from '@/context/LanguageContext';

// What the left side of the page says about the application (shown on wide screens). Texts are translated where they are shown.
const FEATURES = [
    { icon: ShieldCheck, title: 'Secure sign-in', text: 'Two-factor authentication, recovery codes, lockout after failed attempts, and an alert for a new device.' },
    { icon: Users, title: 'Roles and access', text: 'Every role sees only the menus and actions it was given.' },
    { icon: ScrollText, title: 'Everything is recorded', text: 'Sign-ins, requests and changes to data are kept in a history you can search.' },
    { icon: Mail, title: 'Accounts by email', text: 'New users choose their own password from a link, and can recover a forgotten one the same way.' },
];

// A forced password change comes first; then the required two-factor setup; otherwise straight in.
function afterLoginPage(login?: Login): string {
    if (login?.passwordChangeRequired) return PAGE_CHANGE_PASSWORD;
    if (login?.twoFactorSetupRequired) return PAGE_SETUP_TWO_FACTOR;
    return PAGE_DASHBOARD;
}

export default function LoginComponent() {
    const t = useT();
    const { handleLoading } = useLoading();
    const { appName, maintenance } = useAppSetting();
    const { showModal, contentModalError } = useModal();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [remember, setRemember] = useState<boolean>(false);
    const { csrf, setCsrf } = useCsrf();
    const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
    const [pendingSessionId, setPendingSessionId] = useState<string>('');
    const [otpLoading, setOtpLoading] = useState<boolean>(false);
    const [useRecovery, setUseRecovery] = useState<boolean>(false);
    const [recoveryInput, setRecoveryInput] = useState<string>('');
    const [otpError, setOtpError] = useState<string>('');
    const [otpResetKey, setOtpResetKey] = useState<number>(0);
    const [errors, setErrors] = useState({
        email: false,
        password: false,
    });

    // Membaca value input yang sudah terisi browser autofill setelah mount — bukan React
    // state, jadi memang harus lewat effect (tidak bisa di-derive saat render).
    useEffect(() => {
        const emailInput = document.getElementById('email') as HTMLInputElement;
        const passwordInput = document.getElementById('password') as HTMLInputElement;
        if (emailInput?.value) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setEmail(emailInput.value);
        }

        if (passwordInput?.value) {
            setPassword(passwordInput.value);
        }
    }, []);

    // Menampilkan modal error jika ada query param `message` di URL, misal setelah
    // redirect dari middleware/route lain: /login?message=Please+log+in+first
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const message = params.get('message');
        if (message) {
            showModal(contentModalError(message));

            params.delete('message');
            const query = params.toString();
            const newUrl = `${window.location.pathname}${query ? `?${query}` : ''}`;
            window.history.replaceState({}, '', newUrl);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const verifyField = (emailValue: string, passwordValue: string): boolean => {
        const newErrors = {
            email: !emailValue.trim(),
            password: !passwordValue.trim(),
        };

        setErrors(newErrors);
        return Object.values(newErrors).some((v) => v);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleLoading(async (): Promise<void> => {
            // Autofill browser kadang mengisi DOM tanpa memicu onChange (terutama setelah
            // redirect balik dari halaman OTP), sehingga state React bisa saja masih kosong
            // walau input terlihat sudah terisi. Baca ulang value asli dari DOM sebagai fallback
            // dan sinkronkan ke state supaya render berikutnya tidak menimpanya jadi kosong lagi.
            const emailValue = email || (document.getElementById('email') as HTMLInputElement | null)?.value || '';
            const passwordValue = password || (document.getElementById('password') as HTMLInputElement | null)?.value || '';
            if (emailValue !== email) setEmail(emailValue);
            if (passwordValue !== password) setPassword(passwordValue);

            if (verifyField(emailValue, passwordValue)) {
                return;
            }
            const initialCsrf: string = document.getElementById('constants')?.dataset.csrf ?? '';
            const response: Response = await login(emailValue, sha256(passwordValue), initialCsrf, setCsrf, remember.toString());
            const data: ResponseApi<Login> = await handleResponseApi(response);
            if (!response.ok) {
                showModal(
                    <div>
                        <h3 className="text-lg font-semibold mb-2">{t('Login failed')}</h3>
                        <p className="text-sm text-gray-700">{data.message || t('An error occurred during login')}</p>
                    </div>
                );

                return;
            }

            if (data.data?.twoFactorPending) {
                setPendingSessionId(data.data.id);
                setStep('otp');
                return;
            }

            window.location.href = afterLoginPage(data.data);
        })
    };

    const handleOtpComplete = async (code: string) => {
        setOtpLoading(true);
        setOtpError('');
        try {
            const response: Response = await verifyLoginOtp(code, pendingSessionId, remember.toString(), csrf, setCsrf);
            const data: ResponseApi<Login> = await handleResponseApi(response);
            if (!response.ok) {
                setOtpError(data.message || t('Invalid OTP code'));
                setOtpResetKey((k) => k + 1);
                return;
            }

            window.location.href = afterLoginPage(data.data);
        } catch {
            setOtpError(t('An error occurred'));
            setOtpResetKey((k) => k + 1);
        } finally {
            setOtpLoading(false);
        }
    };

    const resetToCredentials = () => {
        setUseRecovery(false);
        setRecoveryInput('');
        setStep('credentials');
        setPendingSessionId('');
        setOtpError('');
        setOtpResetKey((k) => k + 1);
    };

    const submitRegistration = async () => {
        showModal(
            <>
                <div className="flex flex-col items-center text-center p-2">
                    {/* Bagian Icon / Ilustrasi */}
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-4">
                        <ShieldAlert size={28} />
                    </div>

                    {/* Judul Informasi */}
                    <h3 className="text-lg font-semibold text-slate-900 leading-6">
                        Registration Requires Verification
                    </h3>

                    {/* Deskripsi Komprehensif */}
                    <div className="mt-3 text-sm text-slate-500 space-y-3 leading-relaxed">
                        <p>
                            The system has detected that account creation or new employee registration is currently restricted and must go through an internal validation process first.
                        </p>
                        <p>
                            To ensure data security and appropriate access rights, please contact the
                            <strong className="font-semibold text-slate-700"> Main Administrator</strong> or the
                            <strong className="font-semibold text-slate-700"> HR Operations</strong> team so this synchronization process can be completed.
                        </p>
                    </div>

                    {/* Tombol Kontak Otomatis */}
                    <div className="mt-6 w-full">
                        <a
                            href="https://wa.me/+6281383161853?text=Hello%20Admin,%20I%20need%20help%20verifying%20an%20employee%20registration."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full justify-center items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 transition-colors focus:outline-none"
                        >
                            <MessageSquareCode size={16} />
                            Contact Admin via WhatsApp
                        </a>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="flex min-h-screen bg-white">
            {/* LEFT: what the application is (hidden on small screens) */}
            <aside className="relative hidden lg:flex lg:w-1/2 flex-col overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-alt-700 p-12 text-white">
                <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-brand-alt-300/20 blur-3xl" />

                <div className="relative flex items-center gap-3">
                    <span className="flex items-center justify-center rounded-xl bg-white/90 p-1.5"><AppLogo size={32} /></span>
                    <span className="text-2xl font-bold tracking-tight">{appName}</span>
                </div>

                <div className="relative mt-14 max-w-md">
                    <h2 className="text-4xl font-bold leading-tight">{t('A safe place to manage your work.')}</h2>
                    <p className="mt-4 text-brand-100 leading-relaxed">{t('Sign in to see what your role gives you access to.')}</p>
                    <ul className="mt-8 space-y-4">
                        {FEATURES.map(({ icon: Icon, title, text }) => (
                            <li key={title} className="flex items-start gap-3">
                                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15"><Icon size={18} /></span>
                                <span>
                                    <span className="block font-semibold">{t(title)}</span>
                                    <span className="block text-sm text-brand-100">{t(text)}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="relative mt-auto pt-10 text-sm text-brand-200">&copy; {new Date().getFullYear()} {appName}</p>
            </aside>

            {/* RIGHT: the form */}
            <main className="flex w-full lg:w-1/2 items-center justify-center bg-gradient-to-br from-blue-50 to-brand-100 lg:bg-none lg:bg-white px-6 py-10">
                <div className="w-full max-w-md">
                    <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
                        <AppLogo size={40} />
                        <span className="text-xl font-bold text-gray-900">{appName}</span>
                    </div>
                <div className="rounded-lg bg-white p-8 shadow-lg lg:p-0 lg:shadow-none">
                    {step === 'otp' ? (
                        <>
                            <div className="mb-8 text-center lg:text-left">
                                <div className="mx-auto lg:mx-0 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 mb-4">
                                    <ShieldCheck size={28} />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('Two-Step Verification')}</h1>
                                <p className="text-gray-500 text-sm">
                                    Open <strong>Google</strong> or <strong>Microsoft Authenticator</strong>, then enter the 6-digit code for your <strong>{appName}</strong> account.
                                </p>
                            </div>
                            {otpError && (
                                <p className="mb-4 text-center text-sm text-red-500 font-medium">{otpError}</p>
                            )}
                            {useRecovery ? (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (isRecoveryCode(recoveryInput)) {
                                            handleOtpComplete(normalizeRecoveryCode(recoveryInput));
                                        } else {
                                            setOtpError(t('Enter a recovery code like ABCDE-FGHJK'));
                                        }
                                    }}
                                    className="space-y-4"
                                >
                                    <InputComponent
                                        id="recovery"
                                        label={t('Recovery code')}
                                        placeholder="ABCDE-FGHJK"
                                        autoComplete="one-time-code"
                                        value={recoveryInput}
                                        onChange={(e) => { setRecoveryInput(e.target.value); setOtpError(''); }}
                                        className="border-gray-300 focus:ring-2 focus:ring-brand-500 font-mono uppercase"
                                    />
                                    <ButtonComponent type="submit" disabled={otpLoading} className="font-semibold py-2 px-4 rounded-lg">
                                        {t('Verify')}
                                    </ButtonComponent>
                                    <p className="text-center text-xs text-gray-400">{t('Each recovery code works only once.')}</p>
                                </form>
                            ) : (
                                <>
                                    <OtpInput
                                        onComplete={handleOtpComplete}
                                        loading={otpLoading}
                                        autoFocus
                                        onReset={otpResetKey}
                                    />
                                    <p className="text-center text-xs text-gray-400 mt-3">
                                        {t('Code is valid for 30 seconds and refreshes automatically')}
                                    </p>
                                </>
                            )}
                            <button
                                type="button"
                                onClick={() => { setUseRecovery((v) => !v); setOtpError(''); setRecoveryInput(''); setOtpResetKey((k) => k + 1); }}
                                disabled={otpLoading}
                                className="mt-4 block text-sm text-brand-600 hover:text-brand-700 font-medium cursor-pointer mx-auto disabled:opacity-50"
                            >
                                {useRecovery ? t('Use the authenticator app instead') : t('Lost your phone? Use a recovery code')}
                            </button>
                            <button
                                type="button"
                                onClick={resetToCredentials}
                                disabled={otpLoading}
                                className="mt-6 flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition cursor-pointer mx-auto disabled:opacity-50"
                            >
                                <ArrowLeft size={14} /> Back to Login
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="mb-8 text-center lg:text-left">
                                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                                    <LogIn size={14} /> {t('Sign in to your account')}
                                </span>
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                    {t('Welcome back')}
                                </h1>
                                <p className="mt-2 text-gray-500">
                                    {t('Enter your username or email and your password to continue.')}
                                </p>
                            </div>
                            {maintenance.active && (
                                <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                    <Wrench size={16} className="mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-semibold">{t('Under maintenance')}</p>
                                        <p>{maintenance.message || t('Only administrators can sign in right now.')}</p>
                                        {maintenance.until && <p className="mt-1 text-xs">Expected back around {formatUntil(maintenance.until)}.</p>}
                                    </div>
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <InputComponent
                                    id="email"
                                    label={t('Username or email')}
                                    type="text"
                                    autoComplete="username"
                                    placeholder={t('Enter your username or email')}
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errors.email) {
                                            setErrors((prev) => ({
                                                ...prev,
                                                email: false,
                                            }));
                                        }
                                    }}
                                    className="border-gray-300 focus:ring-2 focus:ring-brand-500"
                                    required={errors.email}
                                    error={errors.email}
                                />
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('Password')}
                                    </label>
                                    <div className="relative">
                                        <InputComponent
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="current-password"
                                            placeholder={t('Enter your password')}
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (errors.password) {
                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        password: false,
                                                    }));
                                                }
                                            }}
                                            className="border-gray-300 focus:ring-2 focus:ring-brand-500 pr-10"
                                            required={errors.password}
                                            error={errors.password}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center text-gray-700">
                                        <input type="checkbox" className="mr-2 rounded cursor-pointer" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                                        {t('Remember me')}
                                    </label>
                                    <Link href={PAGE_FORGOT_PASSWORD} className="text-brand-600 hover:text-brand-700 font-medium">
                                        {t('Forgot password?')}
                                    </Link>
                                </div>
                                <ButtonComponent type="submit" className="disabled:bg-gray-400 font-semibold py-2 px-4 rounded-lg transition duration-200 cursor-pointer">
                                    {t('Login')}
                                </ButtonComponent>
                            </form>
                            <div className="my-6 flex items-center">
                                <div className="flex-grow border-t border-gray-300"></div>
                                <span className="px-3 text-gray-500 text-sm">
                                    or
                                </span>
                                <div className="flex-grow border-t border-gray-300"></div>
                            </div>
                            <p className="text-center text-gray-600 text-sm">
                                Don&apos;t have an account?{' '}
                                <a onClick={submitRegistration} className="text-brand-600 hover:text-brand-700 font-semibold cursor-pointer">
                                    Register here
                                </a>
                            </p>
                            <p className="mt-4 text-center text-xs text-gray-400">
                                <Link href={PAGE_PRIVACY} className="hover:text-gray-600 hover:underline">{t('Privacy Policy')}</Link>
                            </p>
                            <div className="mt-2 flex justify-center"><LanguageSwitcher /></div>
                        </>
                    )}
                </div>
                </div>
            </main>
        </div>
    );
}
