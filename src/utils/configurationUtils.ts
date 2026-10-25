// "FRONTEND_URL" -> "Frontend URL"; common acronyms stay uppercase instead of being title-cased.
const ACRONYMS = new Set(['URL', 'API', 'ID']);

export function formatConfigKey(key: string): string {
    return key
        .split('_')
        .map(word => ACRONYMS.has(word) ? word : word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
}


export type ConfigGroup = 'security' | 'mail' | 'maintenance' | 'appearance' | 'retention' | 'general';

export const CONFIG_GROUPS: { id: ConfigGroup; label: string }[] = [
    { id: 'security', label: 'Security' },
    { id: 'mail', label: 'Email' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'retention', label: 'Data retention' },
    { id: 'general', label: 'General' },
];

// Which group a setting belongs to, from its key.
export function configGroup(key: string): ConfigGroup {
    if (key.startsWith('MAIL_')) return 'mail';
    if (key.endsWith('_RETENTION_DAYS')) return 'retention';
    if (key.startsWith('MAINTENANCE_')) return 'maintenance';
    if (key === 'APP_NAME' || key.startsWith('BRAND_')) return 'appearance';
    if (key.startsWith('PASSWORD_') || key === 'MAX_LOGIN_ATTEMPTS' || key === 'LOGIN_LOCK_MINUTES' || key === 'LOGIN_IP_ALLOWLIST' || key === 'TWO_FACTOR_REQUIRED' || key === 'ALLOWED_ORIGINS') return 'security';
    return 'general';
}

// Used as you type: every word of the query has to appear in the key, its readable name or the value (any case). An empty query keeps
// everything, and "all" keeps every group.
export function filterConfigurations<T extends { id?: string; value?: string }>(rows: T[], query: string, group: ConfigGroup | 'all' = 'all'): T[] {
    const words: string[] = query.toLowerCase().split(/\s+/).filter(Boolean);
    return rows.filter((row: T) => {
        const id: string = row.id ?? '';
        if (group !== 'all' && configGroup(id) !== group) {
            return false;
        }
        if (words.length === 0) {
            return true;
        }
        const haystack: string = `${id} ${formatConfigKey(id)} ${row.value ?? ''}`.toLowerCase();
        return words.every((word: string) => haystack.includes(word));
    });
}

// Settings the server never shows: the list and the edit answer carry a mask instead of the value, and the form only ever sends a new one.
const SECRET_KEYS: ReadonlySet<string> = new Set(['MAIL_PASSWORD']);

export function isSecretKey(key: string): boolean {
    return SECRET_KEYS.has(key);
}

// Settings that are switched off, or left out, by emptying them; the backend rejects an empty value for every other key.
const CAN_BE_EMPTY: ReadonlySet<string> = new Set([
    'LOGIN_IP_ALLOWLIST', 'ALLOWED_ORIGINS', 'MAIL_HOST', 'MAIL_USERNAME', 'MAIL_PASSWORD', 'MAIL_FROM_NAME',
    'MAINTENANCE_MESSAGE', 'MAINTENANCE_UNTIL', 'MAINTENANCE_BYPASS_ROLES',
]);

export function canBeEmpty(key: string): boolean {
    return CAN_BE_EMPTY.has(key);
}
