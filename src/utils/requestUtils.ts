'use client';

import { CSRF_HEADER_NAME, SetCsrfFn, updateToken } from './csrfUtils';

// Sends a request that needs the CSRF token. When the token has expired the server answers 406 with a fresh one: the request is repeated once.
export async function requestWithCsrf(
    send: (csrfToken: string) => Promise<Response>,
    csrf: string,
    setCsrf: SetCsrfFn,
): Promise<Response> {
    let res: Response = await send(csrf);
    if (res.status === 406) {
        res = await send(res.headers.get(CSRF_HEADER_NAME) || '');
    }
    return updateToken(res, setCsrf);
}

export function jsonRequest(url: string, method: 'POST' | 'PUT' | 'DELETE', body?: object): (csrfToken: string) => Promise<Response> {
    return (csrfToken: string) => fetch(url, {
        method,
        credentials: 'include',
        headers: {
            ...(body ? { 'Content-Type': 'application/json' } : {}),
            [CSRF_HEADER_NAME]: csrfToken,
        },
        body: body ? JSON.stringify(body) : undefined,
    });
}

// A file upload; the browser sets the multipart Content-Type (with its boundary) itself.
export function fileRequest(url: string, file: File): (csrfToken: string) => Promise<Response> {
    return (csrfToken: string) => {
        const form: FormData = new FormData();
        form.append('file', file);
        return fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: { [CSRF_HEADER_NAME]: csrfToken },
            body: form,
        });
    };
}
