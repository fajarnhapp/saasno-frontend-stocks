'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCsrf } from '@/context/CsrfContext';
import { useT } from '@/context/LanguageContext';
import { readActiveAnnouncements } from '@/service/announcementService';
import { Announcement } from '@/type/announcement';
import { ResponseApi } from '@/type/common/ResponseApi';
import { formatDate } from '@/utils/formatterUtils';
import { handleResponseApi } from '@/utils/responseApiUtils';
import { LEVEL_STYLE, LevelIcon } from './levelStyle';

// The announcements showing now for the dashboard, one accordion row each: the title shows, a click opens the text. The banner above the
// pages only carries the titles; this is where they are read. Closing a banner does not hide an announcement here.
export default function AnnouncementPanel() {
    const t = useT();
    const { setCsrf } = useCsrf();
    const [items, setItems] = useState<Announcement[] | null>(null);
    const [open, setOpen] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const res: Response = await readActiveAnnouncements(setCsrf);
                if (!res.ok) throw new Error('announcements');
                const data: ResponseApi<Announcement[]> = await handleResponseApi<ResponseApi<Announcement[]>>(res);
                if (!cancelled) setItems(data.data || []);
            } catch {
                if (!cancelled) setItems([]);
            }
        };
        load();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only; setCsrf is a stable context setter
    }, []);

    return (
        <section id="announcements" className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-3">{t('Announcements')}</h2>
            {items === null ? null : items.length === 0 ? (
                <p className="text-sm text-gray-500">{t('No announcements right now.')}</p>
            ) : (
                <ul className="space-y-2">
                    {items.map(item => {
                        const id: string = item.id || item.title || '';
                        const expanded: boolean = open === id;
                        return (
                            <li key={id} className={`rounded-lg border ${LEVEL_STYLE[item.level || 'INFO'] || LEVEL_STYLE.INFO}`}>
                                <button type="button" aria-expanded={expanded} aria-controls={`announcement-${id}`}
                                    onClick={() => setOpen(expanded ? null : id)}
                                    className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left">
                                    <LevelIcon level={item.level} className="shrink-0" />
                                    <span className="min-w-0 flex-1 break-words font-semibold">{item.title}</span>
                                    <ChevronDown size={16} className={`shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                                </button>
                                {expanded && (
                                    <div id={`announcement-${id}`} className="border-t border-current/10 px-4 py-3">
                                        <p className="whitespace-pre-line break-words text-sm">{item.message}</p>
                                        {(item.startsAt || item.registered) && (
                                            <p className="mt-2 text-xs opacity-70">{formatDate(item.startsAt || item.registered || '', 'DD/MM/YYYY HH:mm')}</p>
                                        )}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
