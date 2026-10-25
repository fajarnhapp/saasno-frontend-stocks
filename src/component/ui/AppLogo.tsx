'use client';

import { useAppSetting } from '@/context/AppSettingContext';
import { logoUrl } from '@/service/appSettingService';

// The uploaded logo, or the first letter of the app name on the brand colour when there is none.
export default function AppLogo({ size = 40, className = '' }: { size?: number; className?: string }) {
    const { appName, hasLogo, logoVersion } = useAppSetting();

    if (hasLogo) {
        // eslint-disable-next-line @next/next/no-img-element -- a small same-origin picture; next/image would add a resize step for nothing
        return <img src={logoUrl(logoVersion)} alt={appName} width={size} height={size} style={{ width: size, height: size }} className={`object-contain shrink-0 ${className}`} />;
    }

    return (
        <div
            style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
            className={`rounded-xl bg-gradient-to-br from-brand-500 to-brand-500 flex items-center justify-center text-white font-bold shadow-md shrink-0 ${className}`}
        >
            {appName.charAt(0).toUpperCase()}
        </div>
    );
}
