import { SESSION_ID } from '@/proxy';
import { ApiHandler, csrfFilter, csrfResponse } from '@/utils/csrfUtils';
import { API_USER_CHANGE_PASSWORD, BACKEND_URL } from '@/utils/endpointUtils';
import { NextRequest } from 'next/server';

export const PUT: ApiHandler = csrfResponse(
    csrfFilter(async (req: NextRequest): Promise<Response> => {
        const body: { password?: string; oldPassword?: string } = await req.json();
        // Sent in the request body, never the URL: the password hash is a credential and a query
        // string is routinely written to reverse-proxy and backend access logs.
        const res: Response = await fetch(BACKEND_URL + API_USER_CHANGE_PASSWORD, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${req.cookies.get(SESSION_ID)?.value || ''}`
            },
            body: JSON.stringify({ password: body.password ?? '', oldPassword: body.oldPassword ?? '' }),
        });
        return res;
    })
);
