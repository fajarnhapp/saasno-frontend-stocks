import { SESSION_ID } from '@/proxy';
import { ApiHandler, csrfResponse } from '@/utils/csrfUtils';
import { API_LOG, BACKEND_URL } from '@/utils/endpointUtils';
import { NextRequest } from 'next/server';

export const GET: ApiHandler = csrfResponse(
    async (req: NextRequest): Promise<Response> => {
        const param: string = req.nextUrl.search || '';
        const url = `${BACKEND_URL + API_LOG}${param}`;
        const res: Response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${req.cookies.get(SESSION_ID)?.value || ''}`
            },
        });
        return res;
    }
);
