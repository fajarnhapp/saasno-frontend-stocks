import { SESSION_ID } from '@/proxy';
import { ApiHandler, csrfFilter, csrfResponse } from '@/utils/csrfUtils';
import { API_USER_OTP, BACKEND_URL } from '@/utils/endpointUtils';
import { NextRequest } from 'next/server';

export const DELETE: ApiHandler = csrfResponse(
    csrfFilter(async (req: NextRequest): Promise<Response> => {
        const body: { code?: string } = await req.json();
        const res: Response = await fetch(`${BACKEND_URL + API_USER_OTP}?code=${body.code ?? ''}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${req.cookies.get(SESSION_ID)?.value || ''}`
            },
        });
        return res;
    })
);
