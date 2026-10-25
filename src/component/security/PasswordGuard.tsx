'use client';

import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Lock, ShieldCheck, X } from 'lucide-react';
import ButtonComponent from '../ui/ButtonComponent';
import { useCsrf } from '@/context/CsrfContext';
import { verifyPassword } from '@/service/userService';
import { sha256 } from '@/utils/sha256Utils';
import { API_MSG_SUCCESS, handleResponseApi } from '@/utils/responseApiUtils';
import { ResponseApi } from '@/type/common/ResponseApi';
import { PAGE_DASHBOARD } from '@/utils/endpointUtils';

interface Properties {
    children: ReactNode;
    title?: string;
    description?: string;
}

// Hides children until the current user re-enters their password. Verification lives only in
// component state, so leaving the page and coming back asks for the password again.
export default function PasswordGuard({
    children,
    title = 'Confirm Password',
    description = 'Enter your password to continue.',
}: Properties) {
    const router = useRouter();
    const { csrf, setCsrf } = useCsrf();
    const [verified, setVerified] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    if (verified) {
        return <>{children}</>;
    }

    const cancel = () => router.replace(PAGE_DASHBOARD);

    const handleVerify = async () => {
        if (!password) {
            setErrorMsg('Password is required');
            return;
        }

        setLoading(true);
        setErrorMsg('');
        try {
            const res = await verifyPassword(sha256(password), csrf, setCsrf);
            const data: ResponseApi<boolean> = await handleResponseApi(res);
            if (data.message !== API_MSG_SUCCESS) {
                setErrorMsg(data.message || 'Incorrect password');
                return;
            }
            setVerified(true);
        } catch {
            setErrorMsg('Failed to verify password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-40" aria-hidden="true" />
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="relative w-full max-w-sm mx-4 rounded-2xl bg-white shadow-2xl p-6">
                    <button
                        type="button"
                        onClick={cancel}
                        disabled={loading}
                        aria-label="Close"
                        className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer disabled:opacity-40"
                    >
                        <X size={16} />
                    </button>

                    <div className="flex flex-col items-center text-center mb-5">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600 mb-4">
                            <ShieldCheck size={28} />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                        <p className="mt-1.5 text-sm text-gray-500">{description}</p>
                    </div>

                    <div className="relative mb-4">
                        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') void handleVerify(); }}
                            disabled={loading}
                            autoFocus
                            autoComplete="current-password"
                            placeholder="Password"
                            className="w-full rounded-xl border border-gray-200 pl-9 pr-9 py-2.5 text-sm outline-none focus:border-brand-500 disabled:opacity-60"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            disabled={loading}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer disabled:opacity-40"
                        >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>

                    {errorMsg && (
                        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 text-center">
                            {errorMsg}
                        </div>
                    )}

                    <div className="space-y-2">
                        <ButtonComponent type="button" onClick={handleVerify} disabled={loading} className="gap-2">
                            {loading
                                ? <><Loader2 size={15} className="animate-spin" /> Verifying...</>
                                : <><ShieldCheck size={15} /> Verify</>
                            }
                        </ButtonComponent>
                        <ButtonComponent type="button" variant="cancel" onClick={cancel} disabled={loading}>
                            Cancel
                        </ButtonComponent>
                    </div>
                </div>
            </div>
        </>
    );
}
