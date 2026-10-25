import { ApiHandler, csrfFilter, csrfResponse } from '@/utils/csrfUtils';
import { API_BACKEND_PUBLIC, BACKEND_URL } from '@/utils/endpointUtils';
import { checkRateLimit } from '@/utils/securityUtils';
import { clientIp } from '@/utils/clientIpUtils';
import { NextRequest, NextResponse } from 'next/server';

export const POST: ApiHandler = csrfResponse(csrfFilter(
    async (req: NextRequest): Promise<Response> => {
        // A per-IP layer on top of the per-account limit in the backend (3 emails per account per hour).
        // Resolved from the trusted proxy chain, never the raw client-supplied X-Forwarded-For.
        const ip: string = clientIp(req);
        if (!checkRateLimit(`forgot:${ip}`, 10, 15 * 60 * 1000)) {
            return NextResponse.json({ message: 'Too many requests. Please try again in a few minutes' }, { status: 429 });
        }

        const body: { username?: string } = await req.json().catch(() => ({}));
        const username: string = (body.username ?? '').toString().trim();
        if (!username) {
            return NextResponse.json({ message: 'Username or email cannot be empty' }, { status: 400 });
        }

        try {
            return await fetch(`${BACKEND_URL + API_BACKEND_PUBLIC}/password/forgot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });
        } catch (error) {
            console.error('Forgot password error:', error);
            return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
        }
    }
));
