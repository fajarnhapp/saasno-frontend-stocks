import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Largest batch accepted from a browser; the real ones are a few kilobytes.
const MAX_BODY_BYTES = 64 * 1024;

// Where browser telemetry goes (Grafana Alloy, faro.receiver). Production sets SAASNO_FRONTEND_FARO_URL; in development it falls back to the
// port that the alloy project publishes on 127.0.0.1. Without a collector the endpoint just discards the data.
function collectorUrl(): string {
    return process.env.SAASNO_FRONTEND_FARO_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://127.0.0.1:12347/collect');
}

// Public on purpose (errors on the login page matter too), so it only forwards a small JSON body and never answers with the collector's reply.
export async function POST(req: NextRequest): Promise<NextResponse> {
    const url = collectorUrl();
    if (!url) {
        return new NextResponse(null, { status: 204 });
    }

    const body: string = await req.text();
    if (body.length > MAX_BODY_BYTES) {
        return new NextResponse(null, { status: 413 });
    }

    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            signal: AbortSignal.timeout(3000),
        });
    } catch {
        // The collector being down must not turn into errors in the browser.
    }
    return new NextResponse(null, { status: 202 });
}
