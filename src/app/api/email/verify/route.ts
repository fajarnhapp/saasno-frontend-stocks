import { ApiHandler, csrfFilter, csrfResponse } from '@/utils/csrfUtils';
import { API_BACKEND_PUBLIC, BACKEND_URL } from '@/utils/endpointUtils';
import { checkRateLimit } from '@/utils/securityUtils';
import { clientIp } from '@/utils/clientIpUtils';
import { NextRequest, NextResponse } from 'next/server';

export const POST: ApiHandler = csrfResponse(csrfFilter(
    async (req: NextRequest): Promise<Response> => {
        // The token is long and random, but a limit still stops anyone from trying tokens in bulk.
        // Resolved from the trusted proxy chain, never the raw client-supplied X-Forwarded-For.
        const ip: string = clientIp(req);
        if (!checkRateLimit(`verify-email:${ip}`, 20, 15 * 60 * 1000)) {
            return NextResponse.json({ message: 'Too many requests. Please try again in a few minutes' }, { status: 429 });
        }

        const body: { token?: string } = await req.json().catch(() => ({}));
        if (!body.token) {
            return NextResponse.json({ message: 'Token is required' }, { status: 400 });
        }

        try {
            return await fetch(`${BACKEND_URL + API_BACKEND_PUBLIC}/email/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: body.token }),
            });
        } catch (error) {
            console.error('Verify email error:', error);
            return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
        }
    }
));
