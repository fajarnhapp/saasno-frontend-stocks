import { SESSION_ID } from '@/proxy';
import { ApiHandler, csrfFilter, csrfResponse } from '@/utils/csrfUtils';
import { API_PERSON_VERIFY_EMAIL, BACKEND_URL } from '@/utils/endpointUtils';
import { NextRequest } from 'next/server';

export const POST: ApiHandler = csrfResponse(
    csrfFilter(async (req: NextRequest): Promise<Response> => fetch(`${BACKEND_URL + API_PERSON_VERIFY_EMAIL}${req.nextUrl.search || ''}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${req.cookies.get(SESSION_ID)?.value || ''}` },
    }))
);
