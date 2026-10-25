'use client';

import { useState } from 'react';
import ButtonComponent from '../ui/ButtonComponent';
import InputComponent from '../ui/InputComponent';
import SearchableDropdown from '../ui/SearchableDropdown';
import { Announcement } from '@/type/announcement';
import { Option } from '@/type/option';
import { useT } from '@/context/LanguageContext';

const LEVELS: Option[] = [
    { label: 'Info', value: 'INFO' },
    { label: 'Warning', value: 'WARNING' },
    { label: 'Critical', value: 'CRITICAL' },
];

// "2026-10-25T10:30:00" -> "2026-10-25T10:30" (what a datetime-local input accepts).
const toInput = (value?: string | null): string => (value ? value.slice(0, 16) : '');
// An empty input means "no limit"; null makes the backend clear the value.
const fromInput = (value: string): string | null => (value ? value : null);

interface Properties {
    initial?: Announcement;
    onSubmit: (announcement: Announcement) => void;
    onCancel: () => void;
}

export default function AnnouncementForm({ initial, onSubmit, onCancel }: Properties) {
    const t = useT();
    const [value, setValue] = useState<Announcement>({
        level: 'INFO',
        active: true,
        ...initial,
        startsAt: toInput(initial?.startsAt),
        endsAt: toInput(initial?.endsAt),
    });

    return (
        <div className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-6">
            <h3 className="mb-4 text-base font-semibold">{initial?.id ? 'Edit announcement' : 'New announcement'}</h3>
            <div className="-mx-2.5 flex flex-wrap gap-y-5">
                <div className="w-full px-2.5 xl:w-2/3">
                    <InputComponent id="announcement-title" label={t('Title')} placeholder={t('Planned maintenance')} value={value.title || ''}
                        onChange={(e) => setValue({ ...value, title: e.target.value })} required />
                </div>
                <div className="w-full px-2.5 xl:w-1/3">
                    <SearchableDropdown label={t('Level')} placeholder={t('Level')} options={LEVELS.map(o => ({ ...o, label: t(o.label) }))}
                        value={(() => { const found = LEVELS.find(l => l.value === value.level); return found ? t(found.label) : undefined; })()}
                        onChange={(opt) => setValue({ ...value, level: (opt?.value as Announcement['level']) || 'INFO' })} />
                </div>
                <div className="w-full px-2.5">
                    <label htmlFor="announcement-message" className="mb-2 block text-sm font-medium text-gray-700">{t('Message')}</label>
                    <textarea id="announcement-message" rows={3} maxLength={1000} value={value.message || ''}
                        onChange={(e) => setValue({ ...value, message: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-4 py-2 outline-none transition focus:ring-2 focus:ring-brand-500" />
                </div>
                <div className="w-full px-2.5 xl:w-1/3">
                    <InputComponent id="announcement-starts" label={t('Show from (optional)')} type="datetime-local" value={value.startsAt || ''}
                        onChange={(e) => setValue({ ...value, startsAt: e.target.value })} />
                </div>
                <div className="w-full px-2.5 xl:w-1/3">
                    <InputComponent id="announcement-ends" label={t('Show until (optional)')} type="datetime-local" value={value.endsAt || ''}
                        onChange={(e) => setValue({ ...value, endsAt: e.target.value })} />
                </div>
                <label className="flex w-full items-center gap-2 px-2.5 pt-7 text-sm text-gray-700 xl:w-1/3">
                    <input type="checkbox" checked={value.active !== false} onChange={(e) => setValue({ ...value, active: e.target.checked })} />
                    {t('Switched on')}
                </label>
            </div>
            <div className="mt-4 flex gap-3">
                <ButtonComponent type="button" className="w-auto!"
                    onClick={() => onSubmit({ ...value, startsAt: fromInput(value.startsAt || ''), endsAt: fromInput(value.endsAt || '') })}>
                    {t('Save')}
                </ButtonComponent>
                <ButtonComponent type="button" variant="secondary" className="w-auto!" onClick={onCancel}>{t('Cancel')}</ButtonComponent>
            </div>
        </div>
    );
}
