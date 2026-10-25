import { SESSION_ID } from '@/proxy';
import { ApiHandler, csrfFilter, csrfResponse } from '@/utils/csrfUtils';
import { API_DOWNLOAD, BACKEND_URL } from '@/utils/endpointUtils';
import { NextRequest } from 'next/server';

export const GET: ApiHandler = csrfResponse(
    async (req: NextRequest): Promise<Response> => {
        const res: Response = await fetch(BACKEND_URL + API_DOWNLOAD, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${req.cookies.get(SESSION_ID)?.value || ''}`
            },
        });
        return res;
    }
);

export const POST: ApiHandler = csrfResponse(
    csrfFilter(async (req: NextRequest): Promise<Response> => {
        const body = await req.json();
        const res: Response = await fetch(BACKEND_URL + API_DOWNLOAD, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${req.cookies.get(SESSION_ID)?.value || ''}`
            },
            body: JSON.stringify(body),
        });
        return res;
    })
);

export const DELETE: ApiHandler = csrfResponse(
    csrfFilter(async (req: NextRequest): Promise<Response> => {
        const id: string = encodeURIComponent(req.nextUrl.searchParams.get('id') || '');
        const res: Response = await fetch(`${BACKEND_URL + API_DOWNLOAD}?id=${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${req.cookies.get(SESSION_ID)?.value || ''}`
            },
        });
        return res;
    })
);
