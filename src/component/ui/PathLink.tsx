'use client';

import { useSyncExternalStore } from 'react';
import { ExternalLink } from 'lucide-react';

interface PathLinkProps {
    path?: string;
}

export default function PathLink({ path }: PathLinkProps) {
    const origin = useSyncExternalStore(
        () => () => {},
        () => window.location.origin,
        () => '',
    );

    if (!path) return <span className="text-gray-400">-</span>;

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // Dynamic path (e.g. /api/{id}/product) cannot be opened directly, show it as text with highlighted params
    if (/\{[^}]+\}/.test(normalizedPath)) {
        return (
            <span
                title="Dynamic path"
                className="inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 font-mono text-xs text-gray-700 break-all"
            >
                {normalizedPath.split(/(\{[^}]+\})/).map((part, i) =>
                    /^\{[^}]+\}$/.test(part)
                        ? <span key={i} className="rounded bg-amber-100 px-0.5 text-amber-700">{part}</span>
                        : <span key={i}>{part}</span>
                )}
            </span>
        );
    }

    const href = `${origin}${normalizedPath}`;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={href}
            onClick={(e) => e.stopPropagation()}
            className="group inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-2 py-0.5 font-mono text-xs text-brand-600 hover:bg-brand-50 hover:text-brand-700 hover:underline"
        >
            <span className="break-all">{normalizedPath}</span>
            <ExternalLink className="h-3 w-3 shrink-0 opacity-60 group-hover:opacity-100" />
        </a>
    );
}
