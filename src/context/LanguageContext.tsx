'use client';

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { ID_DICTIONARY } from '@/i18n/id';
import { DEFAULT_LANGUAGE, LANGUAGE_COOKIE, Language, translate } from '@/i18n/languages';

type Translate = (text: string | null | undefined, values?: Record<string, string | number>) => string;

interface Properties {
    language: Language;
    setLanguage: (language: Language) => void;
    t: Translate;
}

const LanguageContext = createContext<Properties>({
    language: DEFAULT_LANGUAGE,
    setLanguage: () => undefined,
    t: (text, values) => translate(DEFAULT_LANGUAGE, {}, text ?? '', values),
});

export const useLanguage = (): Properties => useContext(LanguageContext);

// Shorthand for components that only need to translate.
export const useT = (): Translate => useContext(LanguageContext).t;

// The language comes from a cookie, read on the server, so the first page is already in the right language.
export function LanguageProvider({ initial, children }: { initial: Language; children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(initial);

    const setLanguage = useCallback((next: Language) => {
        setLanguageState(next);
        document.cookie = `${LANGUAGE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
        document.documentElement.lang = next;
    }, []);

    const t = useCallback<Translate>((text, values) => translate(language, ID_DICTIONARY, text ?? '', values), [language]);
    const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
