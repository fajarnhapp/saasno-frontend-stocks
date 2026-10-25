'use client';

import { CSRF_HEADER_NAME, SetCsrfFn, updateToken } from "@/utils/csrfUtils";
import { API_LOGIN, API_LOGIN_OTP_VERIFY } from "@/utils/endpointUtils";

export async function login(
    email: string,
    password: string,
    csrf: string,
    setCsrf: SetCsrfFn,
    rememberMe: string,
): Promise<Response> {
    const doLogin = async (csrfToken: string) => {
        const res: Response = await fetch(API_LOGIN, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                [CSRF_HEADER_NAME]: csrfToken
            },
            body: new URLSearchParams({ username: email, password, rememberMe: rememberMe.toString() }),
        });
        return res;
    };

    let res = await doLogin(csrf);

    if (res.status === 406) {
        const retryToken = res.headers.get(CSRF_HEADER_NAME) || '';
        res = await doLogin(retryToken);
    }

    return updateToken(res, setCsrf);
}

export async function verifyLoginOtp(
    code: string,
    sessionId: string,
    rememberMe: string,
    csrf: string,
    setCsrf: SetCsrfFn,
): Promise<Response> {
    const doVerify = async (csrfToken: string) => {
        const res: Response = await fetch(API_LOGIN_OTP_VERIFY, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                [CSRF_HEADER_NAME]: csrfToken,
            },
            body: JSON.stringify({ code, sessionId, rememberMe }),
        });
        return res;
    };

    let res = await doVerify(csrf);

    if (res.status === 406) {
        const retryToken = res.headers.get(CSRF_HEADER_NAME) || '';
        res = await doVerify(retryToken);
    }

    return updateToken(res, setCsrf);
}