import { NextRequest, NextResponse } from 'next/server';
import { API, PAGE_DASHBOARD, PAGE_LOGIN, PUBLIC_API, PUBLIC_PAGES, STATIC_PATH_PREFIXES } from './utils/endpointUtils';
import { createCsrfCookie, CSRF_COOKIE_MAX_AGE, CSRF_COOKIE_NAME } from './utils/csrfUtils';
import { applyCors } from './configuration/corsSecurity';
import { checkRateLimit } from './utils/securityUtils';
import { generateNonce } from './utils/idUtils';
import { clientIp } from './utils/clientIpUtils';

// __Host- prefix: the browser only accepts it when it is Secure, Path=/ and has no Domain, which
// pins the cookie to this exact origin and blocks a sibling/subdomain from overwriting it.
export const SESSION_ID = '__Host-sn_dc';
const MAX_PAYLOAD_BYTES = 10 * 1024 * 1024;

export async function proxy(req: NextRequest) {
    const nonce = generateNonce();

    const ip: string = clientIp(req);

    // Logged-in users are counted per session instead of per IP: users in one office usually share a single IP, and a single page
    // can call several APIs at once. Anonymous traffic (login, public pages) stays strictly limited per IP.
    const loggedInSession: string = req.cookies.get(SESSION_ID)?.value ?? '';
    const allowed = loggedInSession
        ? checkRateLimit(`session:${loggedInSession}`, 600)
        // 100 requests per minute per address; the end-to-end tests open many pages from one address, so they raise it.
        : checkRateLimit(ip, Number(process.env.SAASNO_FRONTEND_ANONYMOUS_MAX_PER_MINUTE) || 100);
    if (!allowed) {
        return await applyCors(req, NextResponse.json({ message: 'Too Many Requests' }, { status: 429 }), nonce);
    }

    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_PAYLOAD_BYTES) {
        return await applyCors(req, NextResponse.json({ message: 'Payload Too Large' }, { status: 413 }), nonce);
    }

    const { pathname } = req.nextUrl;
    const sessionId: string = req.cookies.get(SESSION_ID)?.value ?? '';

    // Forwarded so Server Components can read it via headers().get('x-nonce') if they ever
    // need to nonce a script/style themselves; Next.js also auto-applies it to its own script tags.
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-nonce', nonce);
    const res: NextResponse = NextResponse.next({ request: { headers: requestHeaders } });

    if (req.method === 'OPTIONS') {
        const response = new NextResponse(null, { status: 204 });
        return await applyCors(req, response, nonce);
    }

    if (pathname.startsWith(API)) {
        // Exact or path-segment match only: a plain startsWith would make, for example,
        // /api/email-template public just because it begins with the public /api/email.
        if (PUBLIC_API.some(p => pathname === p || pathname.startsWith(p + '/'))) {
            return await applyCors(req, res, nonce);
        }

        if (!sessionId) {
            return await applyCors(req, NextResponse.json(
                { message: 'Please log in first' },
                { status: 401 }
            ), nonce);
        }

        return await applyCors(req, res, nonce);
    }

    if (!isStaticPath(pathname)) {
        res.cookies.set({
            name: CSRF_COOKIE_NAME,
            value: await createCsrfCookie(),
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
            path: '/',
            maxAge: CSRF_COOKIE_MAX_AGE,
        });
    }

    if (!sessionId && !PUBLIC_PAGES.includes(pathname)) {
        return await applyCors(req, NextResponse.redirect(new URL(`${PAGE_LOGIN}?${new URLSearchParams({ message: 'Please log in first' })}`, req.url)), nonce);
    }

    if (sessionId && pathname === PAGE_LOGIN) {
        return await applyCors(req, NextResponse.redirect(new URL(PAGE_DASHBOARD, req.url)), nonce);
    }

    return await applyCors(req, res, nonce);
}

function isStaticPath(pathname: string): boolean {
    return STATIC_PATH_PREFIXES.some((prefix: string) => pathname.startsWith(prefix));
}

export const config = {
    matcher: ['/((?!_next|static|favicon.ico|logo.svg).*)'],
};
