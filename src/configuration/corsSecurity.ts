import { CSRF_HEADER_NAME } from '@/utils/csrfUtils';
import { API_BACKEND_PUBLIC, BACKEND_URL } from '@/utils/endpointUtils';
import { withDefaultOrigin } from '@/utils/originUtils';
import { NextRequest, NextResponse } from 'next/server';

// The list lives in the database (ALLOWED_ORIGINS, edited on the Configuration page). It is read from the backend and kept for a
// short while, so a change applies within seconds and a request never waits on the backend; when the backend cannot be reached,
// the last list is kept, and before the first successful read only the default origin applies.
const ORIGINS_CACHE_MS = 30_000;
const ORIGINS_TIMEOUT_MS = 1_500;
let databaseOrigins: string[] = [];
let originsFetchedAt = 0;
let originsRefresh: Promise<void> | null = null;

async function refreshOrigins(): Promise<void> {
    try {
        const res: Response = await fetch(`${BACKEND_URL}${API_BACKEND_PUBLIC}/allowed-origins`, {
            cache: 'no-store',
            signal: AbortSignal.timeout(ORIGINS_TIMEOUT_MS),
        });
        if (res.ok) {
            const body: { data?: string[] } = await res.json();
            databaseOrigins = Array.isArray(body.data) ? body.data : [];
        }
    } catch {
        // Keep the previous list; retried after the cache period.
    } finally {
        originsFetchedAt = Date.now();
    }
}

async function allowedOrigins(): Promise<string[]> {
    if (Date.now() - originsFetchedAt > ORIGINS_CACHE_MS) {
        originsRefresh ??= refreshOrigins().finally(() => { originsRefresh = null; });
        // The very first read is awaited; afterwards a stale list is served while the new one is fetched.
        if (originsFetchedAt === 0) {
            await originsRefresh;
        }
    }
    return withDefaultOrigin(databaseOrigins);
}

const ALLOWED_METHODS = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
const ALLOWED_HEADERS = `Content-Type, Authorization, ${CSRF_HEADER_NAME}`;

async function isAllowedOrigin(origin: string): Promise<boolean> {
    if (!origin) return false;
    return (await allowedOrigins()).includes(origin);
}

function buildCsp(nonce: string): string {
    const isProd = process.env.NODE_ENV === 'production';

    const directives: string[] = [
        `default-src 'self'`,
        // 'unsafe-inline' left off: Next.js threads this nonce onto the script tags it renders itself.
        // 'unsafe-eval' is only added outside production: React/Turbopack's dev-mode HMR uses eval()
        // to rebuild stack traces across environments; production React never calls eval().
        `script-src 'self' 'nonce-${nonce}'${isProd ? '' : ` 'unsafe-eval'`}`,
        // Tailwind/dev-mode inline styles aren't nonce-tagged, so style-src stays permissive.
        `style-src 'self' 'unsafe-inline'`,
        `img-src 'self' data: blob:`,
        `font-src 'self'`,
        `connect-src 'self'`,
        `object-src 'none'`,
        `base-uri 'self'`,
        `form-action 'self'`,
        `frame-ancestors 'none'`,
    ];
    if (isProd) {
        directives.push('upgrade-insecure-requests');
    }
    return directives.join('; ');
}

function applySecurityHeaders(res: NextResponse, nonce: string): NextResponse {
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), interest-cohort=()');
    res.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
    res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    res.headers.set('Content-Security-Policy', buildCsp(nonce));
    // Pages and APIs carry per-user data: never let the browser store them (including the back/forward cache), so the back button
    // after logout always asks the server and is redirected to login.
    res.headers.set('Cache-Control', 'no-store, max-age=0');
    res.headers.set('Pragma', 'no-cache');
    return res;
}

function applyCorsHeaders(res: NextResponse, origin: string): NextResponse {
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.append('Vary', 'Origin');
    res.headers.set('Access-Control-Allow-Credentials', 'true');
    res.headers.set('Access-Control-Allow-Methods', ALLOWED_METHODS);
    res.headers.set('Access-Control-Allow-Headers', ALLOWED_HEADERS);
    // PENTING: Agar client-side bisa membaca header CSRF baru untuk rotasi
    res.headers.set('Access-Control-Expose-Headers', CSRF_HEADER_NAME);
    res.headers.set('Access-Control-Max-Age', '86400');
    return res;
}

/**
 * Helper untuk menyuntikkan CORS + security headers ke dalam response
 */
export async function applyCors(req: NextRequest, res: NextResponse, nonce: string): Promise<NextResponse> {
    const origin = req.headers.get('origin') || '';

    if (await isAllowedOrigin(origin)) {
        applyCorsHeaders(res, origin);
    }

    return applySecurityHeaders(res, nonce);
}
