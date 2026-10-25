'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, KeyRound, Loader2, Lock } from 'lucide-react';
import PasswordField from '../ui/PasswordField';
import ButtonComponent from '../ui/ButtonComponent';
import { useCsrf } from '@/context/CsrfContext';
import { useModal } from '@/context/ModalContext';
import { changePassword } from '@/service/userService';
import { readPasswordPolicy } from '@/service/passwordService';
import { PasswordPolicy } from '@/type/password';
import { DEFAULT_PASSWORD_POLICY, describePasswordPolicy, validatePassword } from '@/utils/passwordPolicyUtils';
import { sha256 } from '@/utils/sha256Utils';
import { API_MSG_SUCCESS, handleResponseApi } from '@/utils/responseApiUtils';
import { ResponseApi } from '@/type/common/ResponseApi';
import { User } from '@/type/user';

export default function ChangePasswordCard() {
    const { csrf, setCsrf } = useCsrf();
    const { showModal, contentModalSuccess } = useModal();

    const [open, setOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const [policy, setPolicy] = useState<PasswordPolicy>(DEFAULT_PASSWORD_POLICY);

    useEffect(() => {
        readPasswordPolicy().then(setPolicy);
    }, []);

    const closePanel = () => {
        setOpen(false);
        setCurrentPassword('');
        setPassword('');
        setPasswordConfirmation('');
        setErrorMsg('');
    };

    const handleSubmit = async () => {
        setErrorMsg('');
        if (!currentPassword) { setErrorMsg('Current password is required'); return; }
        if (!password) { setErrorMsg('New password is required'); return; }
        const policyError = validatePassword(password, policy);
        if (policyError) { setErrorMsg(policyError); return; }
        if (password !== passwordConfirmation) { setErrorMsg('Password confirmation does not match'); return; }

        setLoading(true);
        try {
            const res = await changePassword(sha256(password), sha256(currentPassword), csrf, setCsrf);
            const data: ResponseApi<User> = await handleResponseApi(res);
            if (data.message !== API_MSG_SUCCESS) {
                setErrorMsg(data.message || 'Failed to change password');
                return;
            }
            closePanel();
            showModal(contentModalSuccess('Password successfully changed.'));
        } catch {
            setErrorMsg('Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <KeyRound size={20} />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-gray-900">Change Password</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Update your account password periodically for security</p>
                </div>
            </div>

            <div className="px-6 py-4 space-y-2">
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="w-full flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3 text-sm font-medium text-brand-700 hover:bg-brand-100 transition cursor-pointer"
                >
                    <span className="flex items-center gap-2">
                        <Lock size={15} />
                        Change Password
                    </span>
                    {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>

                {open && (
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 space-y-4">
                        {errorMsg && (
                            <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                                {errorMsg}
                            </div>
                        )}
                        <div className="space-y-3">
                            <PasswordField
                                label="Current Password"
                                value={currentPassword}
                                onChange={(e) => { setCurrentPassword(e.target.value); setErrorMsg(''); }}
                                placeholder="Enter your current password"
                            />
                            <PasswordField
                                label="New Password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                                placeholder={describePasswordPolicy(policy)}
                            />
                            <PasswordField
                                label="Confirm New Password"
                                value={passwordConfirmation}
                                onChange={(e) => { setPasswordConfirmation(e.target.value); setErrorMsg(''); }}
                                placeholder="Re-enter new password"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <ButtonComponent
                                type="button"
                                size="sm"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="gap-1.5 w-auto"
                            >
                                {loading
                                    ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                                    : 'Save Password'
                                }
                            </ButtonComponent>
                            <ButtonComponent variant="cancel" size="sm" onClick={closePanel} className="w-auto">
                                Cancel
                            </ButtonComponent>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
