'use client';

import { CSRF_HEADER_NAME, SetCsrfFn, updateToken } from "@/utils/csrfUtils";
import { API_NOTIFICATION_UNREAD_ME } from "@/utils/endpointUtils";

export async function readNotificationUnreadMe(setCsrf: SetCsrfFn): Promise<Response> {
    const res = await fetch(API_NOTIFICATION_UNREAD_ME, {
        method: 'GET',
        credentials: 'include'
    });

    return updateToken(res, setCsrf);
}

export async function editNotificationUnreadMe(
    csrf: string,
    setCsrf: SetCsrfFn
): Promise<Response> {
    const doEdit = async (csrfToken: string) => {
        return await fetch(API_NOTIFICATION_UNREAD_ME, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                [CSRF_HEADER_NAME]: csrfToken,
            },
        });
    };

    let res = await doEdit(csrf);

    if (res.status === 406) {
        const retryToken = res.headers.get(CSRF_HEADER_NAME) || '';
        res = await doEdit(retryToken);
    }

    return updateToken(res, setCsrf);
}