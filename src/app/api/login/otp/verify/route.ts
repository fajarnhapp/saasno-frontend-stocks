import { SESSION_ID } from '@/proxy';
import { ResponseApi } from '@/type/common/ResponseApi';
import { Login } from '@/type/login';
import { ApiHandler, csrfFilter, csrfResponse } from '@/utils/csrfUtils';
import { API_LOGIN_OTP_VERIFY, BACKEND_URL } from '@/utils/endpointUtils';
import { NextRequest, NextResponse } from 'next/server';

export const POST: ApiHandler = csrfResponse(
    csrfFilter(async (req: NextRequest): Promise<Response> => {
        const body: { code?: string; sessionId?: string; rememberMe?: string } = await req.json();
        const response: Response = await fetch(`${BACKEND_URL + API_LOGIN_OTP_VERIFY}?code=${body.code ?? ''}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${body.sessionId || ''}`
            },
        });

        const data: ResponseApi<Login> = await response.json();
        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        const res: NextResponse = NextResponse.json(data);
        // Verifikasi berhasil — baru sekarang sesi benar-benar dianggap "login" dan cookie-nya diset.
        if (data.data.id) {
            res.cookies.set({
                name: SESSION_ID,
                value: data.data.id,
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                path: '/',
                // Umur cookie mengikuti masa berlaku sesi di backend (Redis TTL ~7 hari untuk rememberMe).
                ...(body.rememberMe === 'true' ? { maxAge: 615600 } : {}),
            });
        }

        return res;
    })
);
