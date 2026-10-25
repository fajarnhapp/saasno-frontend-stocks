import { hmacSha256 } from "./hamacsha256Utils";
import { generateRandomHex } from "./idUtils";
import { getCsrfKey } from "./endpointUtils";
import { NextRequest, NextResponse } from "next/server";

export const INVALID_CSRF_MESSAGE: string = 'Invalid CSRF Token';
export type ApiHandler = (req: NextRequest) => Promise<Response>;
export const CSRF_COOKIE_NAME = "__Host-sn_csrf_sid";
export const CSRF_HEADER_NAME = 'x-csrf-token';
export const CSRF_COOKIE_MAX_AGE = 60 * 60 * 24;
const CSRF_METHODS: string[] = ['POST', 'PUT', 'PATCH', 'DELETE'];

export async function createCsrfCookie(): Promise<string> {
    return generateRandomHex();
}
export async function createCsrfHeader(token: string): Promise<string> {
    return await hmacSha256(token + token, getCsrfKey());
}

export type SetCsrfFn = (token: string) => void;

export const updateToken = (res: Response, setCsrf?: SetCsrfFn) => {
    if (res.status === 401) {
        window.location.href = '/login';
    }

    const newToken = res.headers.get(CSRF_HEADER_NAME);
    if (newToken && setCsrf) {
        setCsrf(newToken);
    }
    return res;
};

// Constant-time comparison of the two hex strings so a reject does not leak, through its timing,
// how many leading characters of the expected HMAC were guessed correctly. Both values are
// fixed-length (SHA-256 hex), so comparing lengths first reveals nothing. Implemented without
// node:crypto so it stays usable from both the Edge middleware and the Node route handlers.
function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
}

export async function verifyCsrf(cookie: string, header: string): Promise<boolean> {
    if (header == null || header == '') {
        return false;
    }

    if (cookie == null || cookie == '') {
        return false;
    }

    const cookieHash: string = await createCsrfHeader(cookie);
    return timingSafeEqual(cookieHash, header);
}

export function csrfFilter(handler: ApiHandler): ApiHandler {
    return async (req: NextRequest) => {
        if (!CSRF_METHODS.includes(req.method)) {
            return handler(req);
        }

        const csrfCookie: string = req.cookies.get(CSRF_COOKIE_NAME)?.value ?? '';
        const csrfHeader: string = req.headers.get(CSRF_HEADER_NAME) ?? '';

        if (!await verifyCsrf(csrfCookie, csrfHeader)) {
            return NextResponse.json(
                { message: INVALID_CSRF_MESSAGE },
                { status: 406 }
            );
        }

        return handler(req);
    };
}

export function csrfResponse(handler: ApiHandler): ApiHandler {
    return async (req: NextRequest) => {
        const response = await handler(req);

        let nextResponse: NextResponse;
        if (response instanceof NextResponse) {
            nextResponse = response;
        } else {
            const headers: Record<string, string> = {};
            response.headers.forEach((value, key) => {
                const normalized = key.toLowerCase();
                if (normalized === 'content-encoding' || normalized === 'content-length' || normalized === 'transfer-encoding') {
                    return;
                }
                headers[key] = value;
            });

            nextResponse = new NextResponse(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers,
            });
        }

        const csrfCookie: string = await createCsrfCookie();
        const csrfHeader: string = await createCsrfHeader(csrfCookie);

        nextResponse.cookies.set({
            name: CSRF_COOKIE_NAME,
            value: csrfCookie,
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
            path: '/',
            maxAge: CSRF_COOKIE_MAX_AGE,
        });

        nextResponse.headers.set(
            CSRF_HEADER_NAME,
            csrfHeader
        );

        return nextResponse;
    };
}
