
import { SESSION_ID } from '@/proxy';
import { ApiHandler, csrfFilter, csrfResponse } from '@/utils/csrfUtils';
import { API_NOTIFICATION_UNREAD_ME, BACKEND_URL } from '@/utils/endpointUtils';
import { NextRequest } from 'next/server';

export const GET: ApiHandler = csrfResponse(
    async (req: NextRequest): Promise<Response> => {
        const res: Response = await fetch(BACKEND_URL + API_NOTIFICATION_UNREAD_ME, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${req.cookies.get(SESSION_ID)?.value || ''}`
            },
        });
        return res;
    }
);

export const PUT: ApiHandler = csrfResponse(
    csrfFilter(async (req: NextRequest): Promise<Response> => {
        const res: Response = await fetch(BACKEND_URL + API_NOTIFICATION_UNREAD_ME, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${req.cookies.get(SESSION_ID)?.value || ''}`
            },
        });
        return res;
    })
);