import { SESSION_ID } from '@/proxy';
import { ResponseApi } from '@/type/common/ResponseApi';
import { Login } from '@/type/login';
import { ApiHandler, csrfFilter, csrfResponse } from '@/utils/csrfUtils';
import { API_LOGIN, BACKEND_URL } from '@/utils/endpointUtils';
import { checkRateLimit } from '@/utils/securityUtils';
import { clientIp } from '@/utils/clientIpUtils';
import { NextRequest, NextResponse } from 'next/server';

export const POST: ApiHandler = csrfResponse(csrfFilter(
    async (req: NextRequest): Promise<Response> => {
        const contentType: string = req.headers.get('content-type') || '';
        if (!contentType.includes('application/x-www-form-urlencoded')) {
            return NextResponse.json(
                { message: 'Unsupported Media Type' },
                { status: 415 }
            );
        }

        // A per-IP layer on top of the per-account lockout in the backend (MAX_LOGIN_ATTEMPTS), which cannot count usernames that do not exist.
        // Resolved from the trusted proxy chain, never the raw client-supplied X-Forwarded-For, so the throttle cannot be bypassed by spoofing it.
        const ip: string = clientIp(req);
        // 20 attempts per 10 minutes per address. The end-to-end tests sign in more often than that from one address, so they raise it.
        const maxAttempts: number = Number(process.env.SAASNO_FRONTEND_LOGIN_MAX_ATTEMPTS) || 20;
        if (!checkRateLimit(`login:${ip}`, maxAttempts, 10 * 60 * 1000)) {
            return NextResponse.json(
                { message: 'Too many login attempts. Please try again in a few minutes' },
                { status: 429 }
            );
        }

        const formData = await req.formData();
        const username: string = formData.get('username')?.toString() || '';
        const password: string = formData.get('password')?.toString() || '';
        const rememberMe: string = formData.get('rememberMe')?.toString() || 'false';

        if (!username) {
            return NextResponse.json(
                { message: 'Username cannot be empty' },
                { status: 400 }
            );
        }

        if (!password) {
            return NextResponse.json(
                { message: 'Password cannot be empty' },
                { status: 400 }
            );
        }

        try {
            const response = await fetch(BACKEND_URL + API_LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    // Origin of the device, shown in the signed-in devices list in the backend.
                    'X-Forwarded-For': ip,
                    'User-Agent': req.headers.get('user-agent') || '',
                },
                body: new URLSearchParams({
                    username: username,
                    password: password,
                    rememberMe: rememberMe,
                }),
            });

            const data: ResponseApi<Login> = await response.json();
            if (!response.ok) {
                return NextResponse.json(
                    { message: data.message || 'Login failed' },
                    { status: response.status }
                );
            }

            const res: NextResponse = NextResponse.json(data);
            // Selama 2FA masih pending, sengaja belum set cookie sesi — sesi baru benar-benar
            // dianggap "login" setelah kode OTP diverifikasi (lihat /api/login/otp/verify). Ini
            // membuat refresh di halaman OTP otomatis kembali ke form username/password, karena
            // tidak ada cookie sesi yang membuat proxy.ts mengira user sudah login.
            if (data.data.id && !data.data.twoFactorPending) {
                res.cookies.set({
                    name: SESSION_ID,
                    value: data.data.id,
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    path: '/',
                    // "Ingat saya" belum dicentang -> session cookie (hilang saat browser ditutup).
                    // Dicentang -> umur cookie disamakan dengan masa berlaku sesi di backend (Redis TTL,
                    // ~7 hari untuk rememberMe); sebelumnya cookie dipatok 1 tahun padahal sesi sudah
                    // kedaluwarsa jauh lebih dulu, jadi cookie-nya hanya menyisa tak berguna.
                    ...(rememberMe === 'true' ? { maxAge: 615600 } : {}),
                });
            }

            return res;
        } catch (error) {
            console.error('Login error:', error);
            const res: NextResponse = NextResponse.json(
                { message: 'Internal server error' },
                { status: 500 }
            );
            return res;
        }
    }
));
