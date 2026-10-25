'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useT } from '@/context/LanguageContext';
import { usePathname, useRouter } from 'next/navigation';
import { CornerDownLeft, LayoutGrid, Search } from 'lucide-react';
import { useLoading } from '@/context/LoadingCircleContext';
import { Menu } from '@/type/menu';
import { SearchPage, searchPages } from '@/utils/searchUtils';

// Search from anywhere (Ctrl+K): the pages of the menus the signed-in user may open. It is opened by a condition in its parent, so its
// state always starts clean. Enter or a click goes straight to the page.
export default function SearchPalette({ menus, onClose }: { menus: Menu[]; onClose: () => void }) {
    const router = useRouter();
    const t = useT();
    const pathname = usePathname();
    const { showLoading } = useLoading();
    const [query, setQuery] = useState<string>('');
    const [active, setActive] = useState<number>(0);
    const list = useRef<HTMLDivElement>(null);
    const trimmed: string = query.trim();

    // Esc closes it even when the focus is not in the search box (for example after clicking an empty spot in the dialog).
    useEffect(() => {
        const onEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', onEscape);
        return () => window.removeEventListener('keydown', onEscape);
    }, [onClose]);

    const items: SearchPage[] = useMemo(() => searchPages(menus, trimmed), [menus, trimmed]);
    const current: number = Math.min(active, Math.max(items.length - 1, 0));

    const open = (item: SearchPage | undefined) => {
        if (!item) {
            return;
        }
        if (item.link.split('?')[0] !== pathname) {
            showLoading();
        }
        onClose();
        router.push(item.link);
    };

    const move = (next: number) => {
        setActive(next);
        list.current?.querySelector<HTMLElement>(`[data-index="${next}"]`)?.scrollIntoView({ block: 'nearest' });
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            move(items.length === 0 ? 0 : (current + 1) % items.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            move(items.length === 0 ? 0 : (current - 1 + items.length) % items.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            open(items[current]);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 p-4 pt-[12vh] backdrop-blur-sm" onMouseDown={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Search"
                className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 border-b border-gray-100 px-4">
                    <Search className="h-5 w-5 shrink-0 text-gray-400" />
                    <input
                        autoFocus
                        value={query}
                        maxLength={50}
                        onChange={(e) => { setQuery(e.target.value); setActive(0); }}
                        onKeyDown={onKeyDown}
                        placeholder={t('Search pages…')}
                        aria-label="Search pages"
                        className="h-14 w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                    />
                    <kbd className="hidden shrink-0 rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 sm:block">Esc</kbd>
                </div>
                <div ref={list} className="max-h-[50vh] overflow-y-auto p-2">
                    {items.length > 0 && (
                        <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">{t('Pages')}</p>
                    )}
                    {items.map((item, index) => {
                        const selected: boolean = index === current;
                        return (
                            <button
                                key={`${item.link}-${index}`}
                                type="button"
                                data-index={index}
                                onMouseMove={() => setActive(index)}
                                onClick={() => open(item)}
                                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${selected ? 'bg-brand-50' : ''}`}
                            >
                                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${selected ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500'}`}>
                                    <LayoutGrid className="h-4 w-4" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium text-gray-800">{t(item.title)}</span>
                                    {item.subtitle && <span className="block truncate text-xs text-gray-500">{t(item.subtitle)}</span>}
                                </span>
                                {selected && <CornerDownLeft className="h-4 w-4 shrink-0 text-brand-400" />}
                            </button>
                        );
                    })}
                    {items.length === 0 && (
                        <p className="px-3 py-8 text-center text-sm text-gray-400">{t('No results for "{query}".', { query: trimmed })}</p>
                    )}
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2 text-[11px] text-gray-400">
                    <span>↑ ↓ to choose · Enter to open</span>
                    <span>{t('Ctrl K to open from anywhere')}</span>
                </div>
            </div>
        </div>
    );
}
