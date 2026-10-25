'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useCsrf } from '@/context/CsrfContext';
import { readActiveAnnouncements } from '@/service/announcementService';
import { Announcement } from '@/type/announcement';
import { ResponseApi } from '@/type/common/ResponseApi';
import { handleResponseApi } from '@/utils/responseApiUtils';
import { useT } from '@/context/LanguageContext';
import { LEVEL_STYLE, LevelIcon } from './levelStyle';

const DISMISSED_KEY = 'dismissed-announcements';
const REFRESH_MS = 5 * 60 * 1000;

// Ids the user closed, kept in this browser only (a per-person convenience, not shared state).
function readDismissed(): string[] {
    try {
        const stored: unknown = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
        return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === 'string') : [];
    } catch {
        return [];
    }
}

function writeDismissed(ids: string[]): void {
    try {
        localStorage.setItem(DISMISSED_KEY, JSON.stringify(ids.slice(-50)));
    } catch {
        // Storage can be blocked; the banner then simply comes back on the next visit.
    }
}

// The titles of the notices an admin published, above every page; the text is read on the dashboard (a title leads there). A user can
// close one; it stays closed in this browser.
export default function AnnouncementBanner() {
    const t = useT();
    const { setCsrf } = useCsrf();
    const [items, setItems] = useState<Announcement[]>([]);
    // Nothing is shown before the announcements arrive, so reading the storage on first render cannot cause a server/client mismatch.
    const [dismissed, setDismissed] = useState<string[]>(() => (typeof window === 'undefined' ? [] : readDismissed()));

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const res: Response = await readActiveAnnouncements(setCsrf);
                if (!res.ok) return;
                const data: ResponseApi<Announcement[]> = await handleResponseApi<ResponseApi<Announcement[]>>(res);
                if (!cancelled) setItems(data.data || []);
            } catch {
                // A banner that cannot load is not worth an error.
            }
        };
        load();
        const timer = setInterval(load, REFRESH_MS);
        return () => { cancelled = true; clearInterval(timer); };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only; setCsrf is a stable context setter
    }, []);

    const visible: Announcement[] = items.filter(item => item.id && !dismissed.includes(item.id));
    if (visible.length === 0) {
        return null;
    }

    const close = (id: string) => {
        const next: string[] = [...dismissed, id];
        setDismissed(next);
        writeDismissed(next);
    };

    return (
        <div>
            {visible.map(item => (
                <div key={item.id} role="status" className={`flex items-start gap-3 border-b px-4 py-2 text-sm ${LEVEL_STYLE[item.level || 'INFO'] || LEVEL_STYLE.INFO}`}>
                    <LevelIcon level={item.level} className="mt-0.5 shrink-0" />
                    <p className="min-w-0 flex-1 break-words">
                        <Link href="/dashboard#announcements" className="font-semibold hover:underline">{item.title}</Link>
                    </p>
                    <button type="button" aria-label={t('Close')} onClick={() => close(item.id as string)} className="shrink-0 rounded p-0.5 hover:bg-black/5 cursor-pointer">
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
}
