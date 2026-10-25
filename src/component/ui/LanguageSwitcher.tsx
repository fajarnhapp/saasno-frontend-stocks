'use client';

import { Languages } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { LANGUAGES, LANGUAGE_LABEL, Language } from '@/i18n/languages';

// A small selector for the language of the screens.
export default function LanguageSwitcher({ className = '' }: { className?: string }) {
    const { language, setLanguage, t } = useLanguage();
    return (
        <label className={`inline-flex items-center gap-1.5 text-xs text-gray-500 ${className}`}>
            <Languages size={14} aria-hidden="true" />
            <span className="sr-only">{t('Language')}</span>
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="cursor-pointer rounded-md border border-gray-200 bg-white px-1.5 py-1 text-xs text-gray-700 outline-none"
            >
                {LANGUAGES.map(code => <option key={code} value={code}>{LANGUAGE_LABEL[code]}</option>)}
            </select>
        </label>
    );
}
