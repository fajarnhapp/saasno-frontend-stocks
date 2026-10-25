import { SESSION_ID } from '@/proxy';
import { ApiHandler, csrfFilter, csrfResponse } from '@/utils/csrfUtils';
import { API_USER, BACKEND_URL } from '@/utils/endpointUtils';
import { NextRequest } from 'next/server';

export const POST: ApiHandler = csrfResponse(
    csrfFilter(async (req: NextRequest): Promise<Response> => {
        const body = await req.json();
        const res: Response = await fetch(BACKEND_URL + API_USER, {
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

export const GET: ApiHandler = csrfResponse(
    async (req: NextRequest): Promise<Response> => {
        const param: string = req.nextUrl.search || '';
        const url = `${BACKEND_URL + API_USER}${param}`;
        const res: Response = await fetch(url, {
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
        const body = await req.json();
        const res: Response = await fetch(BACKEND_URL + API_USER, {
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

export const DELETE: ApiHandler = csrfResponse(
    csrfFilter(async (req: NextRequest): Promise<Response> => {
        const id: string = encodeURIComponent(req.nextUrl.searchParams.get('id') ?? '');
        const res: Response = await fetch(`${BACKEND_URL + API_USER}?id=${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${req.cookies.get(SESSION_ID)?.value || ''}`
            }
        });
        return res;
    })
);
