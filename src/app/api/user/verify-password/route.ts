import { SESSION_ID } from '@/proxy';
import { ApiHandler, csrfFilter, csrfResponse } from '@/utils/csrfUtils';
import { API_USER_VERIFY_PASSWORD, BACKEND_URL } from '@/utils/endpointUtils';
import { NextRequest } from 'next/server';

export const POST: ApiHandler = csrfResponse(
    csrfFilter(async (req: NextRequest): Promise<Response> => {
        const body: { password?: string } = await req.json();
        // In the body, not the URL: the password hash is a credential and must not reach access logs.
        const res: Response = await fetch(BACKEND_URL + API_USER_VERIFY_PASSWORD, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${req.cookies.get(SESSION_ID)?.value || ''}`
            },
            body: JSON.stringify({ password: body.password ?? '' }),
        });
        return res;
    })
);
