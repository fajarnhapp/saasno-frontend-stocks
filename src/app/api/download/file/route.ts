import { SESSION_ID } from '@/proxy';
import { ApiHandler, csrfResponse } from '@/utils/csrfUtils';
import { API_DOWNLOAD_FILE, BACKEND_URL } from '@/utils/endpointUtils';
import { NextRequest } from 'next/server';

export const GET: ApiHandler = csrfResponse(
    async (req: NextRequest): Promise<Response> => {
        const id: string = encodeURIComponent(req.nextUrl.searchParams.get('id') || '');
        const res: Response = await fetch(`${BACKEND_URL + API_DOWNLOAD_FILE}?id=${id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${req.cookies.get(SESSION_ID)?.value || ''}`
            },
        });
        return res;
    }
);
