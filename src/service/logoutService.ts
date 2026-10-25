'use client';

import { CSRF_HEADER_NAME } from "@/utils/csrfUtils";
import { API_LOGOUT } from "@/utils/endpointUtils";

export async function logout(csrf: string): Promise<Response> {
    const doLogout = async (csrfToken: string) => {
        const res: Response = await fetch(API_LOGOUT, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                [CSRF_HEADER_NAME]: csrfToken
            }
        });
        return res;
    };

    let res = await doLogout(csrf);

    if (res.status === 406) {
        const retryToken = res.headers.get(CSRF_HEADER_NAME) || '';
        res = await doLogout(retryToken);
    }

    return res;
}
