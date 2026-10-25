'use client';

import ChangePasswordCard from './ChangePasswordCard';
import TwoFactorCard from './TwoFactorCard';
import PasswordGuard from './PasswordGuard';

export default function SecurityComponent() {
    return (
        <PasswordGuard description="Enter your password to access Account Security.">
            <div className="max-w-2xl mx-auto my-8 space-y-6">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Account Security</h1>
                    <p className="mt-1 text-sm text-gray-400">
                        Manage your password and additional authentication methods for your account.
                    </p>
                </div>
                <ChangePasswordCard />
                <TwoFactorCard />
            </div>
        </PasswordGuard>
    );
}
