export const LANGUAGES = ['en', 'id'] as const;
export type Language = (typeof LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = 'en';
export const LANGUAGE_COOKIE = 'lang';
export const LANGUAGE_LABEL: Record<Language, string> = { en: 'English', id: 'Bahasa Indonesia' };

export function toLanguage(value: string | undefined | null): Language {
    return (LANGUAGES as readonly string[]).includes(value ?? '') ? (value as Language) : DEFAULT_LANGUAGE;
}

// Fills {name} in a text. A name without a value stays as it is.
export function format(text: string, values?: Record<string, string | number>): string {
    if (!values) return text;
    return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match));
}

// The English text is the key: a text without a translation is shown as it is, so a page can be translated bit by bit.
export function translate(language: Language, dictionary: Record<string, string>, text: string, values?: Record<string, string | number>): string {
    const translated: string = language === 'en' ? text : dictionary[text] ?? text;
    return format(translated, values);
}
