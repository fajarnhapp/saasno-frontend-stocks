import { ReactNode } from 'react';
import AppLogo from '../ui/AppLogo';

// The shared frame of the pre-login password pages (forgot, reset, forced change).
export default function AuthCard({ icon, title, subtitle, children }: { icon: ReactNode; title: string; subtitle: ReactNode; children: ReactNode }) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-brand-100 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="mb-8 text-center">
                        <AppLogo size={36} className="mx-auto mb-5" />
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 mb-4">
                            {icon}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
                        <p className="text-gray-500 text-sm">{subtitle}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
