'use client';

import { PasswordPolicy } from "@/type/password";
import { CSRF_HEADER_NAME, SetCsrfFn, updateToken } from "@/utils/csrfUtils";
import { API_PASSWORD_FORGOT, API_PASSWORD_POLICY, API_PASSWORD_RESET } from "@/utils/endpointUtils";
import { DEFAULT_PASSWORD_POLICY } from "@/utils/passwordPolicyUtils";

async function postJson(url: string, body: object, csrf: string, setCsrf: SetCsrfFn): Promise<Response> {
    const doPost = async (csrfToken: string) => fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            [CSRF_HEADER_NAME]: csrfToken,
        },
        body: JSON.stringify(body),
    });

    let res = await doPost(csrf);

    if (res.status === 406) {
        const retryToken = res.headers.get(CSRF_HEADER_NAME) || '';
        res = await doPost(retryToken);
    }

    return updateToken(res, setCsrf);
}

export function requestPasswordReset(username: string, csrf: string, setCsrf: SetCsrfFn): Promise<Response> {
    return postJson(API_PASSWORD_FORGOT, { username }, csrf, setCsrf);
}

export function submitPasswordReset(token: string, password: string, csrf: string, setCsrf: SetCsrfFn): Promise<Response> {
    return postJson(API_PASSWORD_RESET, { token, password }, csrf, setCsrf);
}

// The rules for choosing a password; falls back to the defaults when they cannot be loaded.
export async function readPasswordPolicy(): Promise<PasswordPolicy> {
    try {
        const res: Response = await fetch(API_PASSWORD_POLICY, { method: 'GET', credentials: 'include' });
        if (!res.ok) {
            return DEFAULT_PASSWORD_POLICY;
        }
        const body: { data?: PasswordPolicy } = await res.json();
        return body.data ?? DEFAULT_PASSWORD_POLICY;
    } catch {
        return DEFAULT_PASSWORD_POLICY;
    }
}
