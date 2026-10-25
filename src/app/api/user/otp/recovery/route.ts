import { SESSION_ID } from '@/proxy';
import { ApiHandler, csrfFilter, csrfResponse } from '@/utils/csrfUtils';
import { API_USER_OTP_RECOVERY, BACKEND_URL } from '@/utils/endpointUtils';
import { NextRequest } from 'next/server';

export const POST: ApiHandler = csrfResponse(
    csrfFilter(async (req: NextRequest): Promise<Response> => {
        const body: { code?: string } = await req.json();
        return fetch(`${BACKEND_URL + API_USER_OTP_RECOVERY}?code=${encodeURIComponent(body.code ?? '')}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${req.cookies.get(SESSION_ID)?.value || ''}`
            },
        });
    })
);
