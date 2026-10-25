'use client';

import { useState } from 'react';
import { User } from 'lucide-react';
import { avatarUrl } from '@/service/avatarService';

// A user's profile picture, or a person icon when there is none (or it fails to load).
export default function Avatar({ version, userId, size = 40, className = '' }: { version?: number; userId?: string; size?: number; className?: string }) {
    const [failed, setFailed] = useState<boolean>(false);
    const [prevVersion, setPrevVersion] = useState<number | undefined>(version);
    if (version !== prevVersion) {
        setPrevVersion(version);
        setFailed(false);
    }

    if (version && !failed) {
        return (
            // eslint-disable-next-line @next/next/no-img-element -- a small same-origin picture served by our own API route
            <img
                src={avatarUrl(version, userId)}
                alt=""
                width={size}
                height={size}
                style={{ width: size, height: size }}
                className={`rounded-full object-cover shrink-0 ${className}`}
                onError={() => setFailed(true)}
            />
        );
    }

    return (
        <div style={{ width: size, height: size }} className={`rounded-full bg-brand-100 flex items-center justify-center shrink-0 ${className}`}>
            <User size={Math.round(size * 0.5)} className="text-brand-600" />
        </div>
    );
}
