import { CSRF_HEADER_NAME, SetCsrfFn, updateToken } from "@/utils/csrfUtils";
import { toQuery } from "@/utils/queryUtils";

// GET dengan query dari objek (nilai kosong dibuang).
export async function getJson(url: string, params: object, setCsrf: SetCsrfFn): Promise<Response> {
    const query = toQuery(params).toString();
    const res: Response = await fetch(query ? `${url}?${query}` : url, { method: 'GET', credentials: 'include' });
    return updateToken(res, setCsrf);
}

// POST/PUT/DELETE dengan CSRF; satu kali ulang bila token CSRF kedaluwarsa (406).
export async function sendJson(method: 'POST' | 'PUT' | 'DELETE', url: string, body: object | undefined, csrf: string, setCsrf: SetCsrfFn): Promise<Response> {
    const run = (token: string): Promise<Response> => fetch(url, {
        method,
        credentials: 'include',
        headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), [CSRF_HEADER_NAME]: token },
        body: body ? JSON.stringify(body) : undefined,
    });
    const res = await run(csrf);
    if (res.status === 406) {
        return updateToken(await run(res.headers.get(CSRF_HEADER_NAME) || ''), setCsrf);
    }
    return updateToken(res, setCsrf);
}
