import { SESSION_ID } from '@/proxy';
import { ApiHandler, csrfFilter, csrfResponse } from '@/utils/csrfUtils';
import { API_LOGOUT, BACKEND_URL } from '@/utils/endpointUtils';
import { NextRequest, NextResponse } from 'next/server';

export const DELETE: ApiHandler = csrfResponse(csrfFilter(
    async (req: NextRequest): Promise<Response> => {
        const sessionId: string = req.cookies.get(SESSION_ID)?.value ?? '';
        await fetch(BACKEND_URL + API_LOGOUT, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${sessionId}`,
            },
        });

        const res: NextResponse = NextResponse.json(
            {
                message: 'Success',
                data: 'Successfully logged out'
            }
        );

        res.cookies.set({
            name: SESSION_ID,
            value: '',
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/',
            maxAge: 0,
        });

        return res;
    }
));
