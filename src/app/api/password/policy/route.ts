import { ApiHandler, csrfResponse } from '@/utils/csrfUtils';
import { API_BACKEND_PUBLIC, BACKEND_URL } from '@/utils/endpointUtils';
import { NextResponse } from 'next/server';

export const GET: ApiHandler = csrfResponse(
    async (): Promise<Response> => {
        try {
            return await fetch(`${BACKEND_URL + API_BACKEND_PUBLIC}/password/policy`, { method: 'GET', cache: 'no-store' });
        } catch {
            return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
        }
    }
);
