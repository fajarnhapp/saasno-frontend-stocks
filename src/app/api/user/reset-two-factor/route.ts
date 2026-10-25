import { SESSION_ID } from '@/proxy';
import { ApiHandler, csrfFilter, csrfResponse } from '@/utils/csrfUtils';
import { API_USER_RESET_TWO_FACTOR, BACKEND_URL } from '@/utils/endpointUtils';
import { NextRequest } from 'next/server';

export const PUT: ApiHandler = csrfResponse(
    csrfFilter(async (req: NextRequest): Promise<Response> => {
        const username: string = encodeURIComponent(req.nextUrl.searchParams.get('username') ?? '');
        const res: Response = await fetch(`${BACKEND_URL + API_USER_RESET_TWO_FACTOR}?username=${username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${req.cookies.get(SESSION_ID)?.value || ''}`
            }
        });
        return res;
    })
);