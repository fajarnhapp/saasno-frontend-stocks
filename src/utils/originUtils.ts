export const DEFAULT_ORIGIN: string = 'http://localhost:3000';

// A real origin is just scheme://host[:port]: http/https only, no wildcard, no "null", no path, query,
// fragment or credentials. Reflecting a bad entry (especially "*" or "null") back with
// Access-Control-Allow-Credentials: true would hand any site authenticated cross-origin access, so a
// malformed row from the database is dropped rather than trusted.
function isValidOrigin(origin: string): boolean {
    if (!origin || origin === '*' || origin.toLowerCase() === 'null') {
        return false;
    }
    try {
        const url = new URL(origin);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return false;
        }
        if (url.username || url.password) {
            return false;
        }
        return origin === `${url.protocol}//${url.host}`;
    } catch {
        return false;
    }
}

// The origins the frontend answers cross-origin calls from: the valid entries of the list kept in the database
// (ALLOWED_ORIGINS), and always the default local address, whatever the list says.
export function withDefaultOrigin(fromDatabase: string[]): string[] {
    const origins: string[] = [DEFAULT_ORIGIN, ...fromDatabase];
    return [...new Set(
        origins
            .map((origin: string) => origin.trim().replace(/\/+$/, ''))
            .filter(Boolean)
            .filter(isValidOrigin),
    )];
}
