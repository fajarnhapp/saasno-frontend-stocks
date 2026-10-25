import { NextRequest } from 'next/server';

// How many reverse proxies (nginx/traefik/CDN...) sit between the public internet and this app.
// X-Forwarded-For is a list "client, proxy1, proxy2, ..." where each proxy appends the address of
// the host that connected to it. Only the right-most hops are added by infrastructure we control,
// so the real client is the entry our outermost trusted proxy recorded; everything to its left is
// supplied by the client and can be forged. Set SAASNO_FRONTEND_TRUSTED_PROXY_HOPS to match the
// deployment topology (default 1 = exactly one reverse proxy in front of the app).
function trustedHops(): number {
    const parsed = Number(process.env.SAASNO_FRONTEND_TRUSTED_PROXY_HOPS);
    return Number.isInteger(parsed) && parsed >= 1 ? parsed : 1;
}

// The client address that can be trusted for rate limiting, lockout and audit. Never the raw
// left-most X-Forwarded-For value, which the client controls.
export function clientIp(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
        const parts = forwarded.split(',').map(part => part.trim()).filter(Boolean);
        const index = parts.length - trustedHops();
        // A chain shorter than the configured hop count means the request did not pass through the
        // expected proxies (a direct hit or a forged header): treat the whole header as untrusted.
        if (index >= 0 && index < parts.length) {
            return parts[index];
        }
    }
    return req.headers.get('x-real-ip')?.trim() || 'unknown';
}
