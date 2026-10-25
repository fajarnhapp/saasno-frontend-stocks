import { SESSION_ID } from '@/proxy';
import { ApiHandler, csrfFilter, csrfResponse } from '@/utils/csrfUtils';
import { API_ROLE_MENU, BACKEND_URL } from '@/utils/endpointUtils';
import { NextRequest } from 'next/server';

export const PUT: ApiHandler = csrfResponse(
    csrfFilter(async (req: NextRequest): Promise<Response> => {
        const body = await req.json();
        const res: Response = await fetch(BACKEND_URL + API_ROLE_MENU, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${req.cookies.get(SESSION_ID)?.value || ''}`
            },
            body: JSON.stringify(body),
        });
        return res;
    })
);

export const GET: ApiHandler = csrfResponse(
    async (req: NextRequest): Promise<Response> => {
        const param: string = req.nextUrl.search || '';
        const url = `${BACKEND_URL + API_ROLE_MENU}${param}`;
        const res: Response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${req.cookies.get(SESSION_ID)?.value || ''}`
            },
        });
        return res;
    }
);
