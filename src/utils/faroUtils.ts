// Cleans browser telemetry before it leaves the browser (see instrumentation-client.ts).

// Values that must never leave the browser: reset/verification links carry a one-time token, and error messages sometimes echo a URL.
const SENSITIVE_QUERY = /([?&#][^=&#\s"']*(?:token|code|otp|password|secret|key|session)[^=&#\s"']*=)[^&#\s"']+/gi;

export function scrubString(value: string): string {
    return value.replace(SENSITIVE_QUERY, '$1[REDACTED]');
}

export function scrubValue(value: unknown): unknown {
    if (typeof value === 'string') {
        return scrubString(value);
    }
    if (Array.isArray(value)) {
        return value.map(scrubValue);
    }
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, scrubValue(inner)]));
    }
    return value;
}

// The page URL is reduced to its path: query strings and fragments are not needed to find a broken page.
export function pathOnly(url: string): string {
    try {
        const parsed = new URL(url);
        return `${parsed.origin}${parsed.pathname}`;
    } catch {
        return scrubString(url.split(/[?#]/)[0]);
    }
}

interface Cleaned {
    payload?: unknown;
    meta?: { page?: { url?: string } };
}

export function sanitizeItem<T extends { payload?: unknown; meta?: unknown }>(item: T): T {
    const clean = scrubValue({ payload: item.payload, meta: item.meta }) as Cleaned;
    if (clean.meta?.page?.url) {
        clean.meta.page.url = pathOnly(clean.meta.page.url);
    }
    return { ...item, payload: clean.payload, meta: clean.meta } as T;
}
