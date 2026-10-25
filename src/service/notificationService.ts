'use client';

import { NotificationFilter } from "@/type/filter/NotificationFilter";
import { Notification } from "@/type/notification";
import { CSRF_HEADER_NAME, SetCsrfFn, updateToken } from "@/utils/csrfUtils";
import { API_NOTIFICATION_ME } from "@/utils/endpointUtils";
import { toQuery } from "@/utils/queryUtils";

export async function readNotificationMe(
    filter: NotificationFilter,
    setCsrf: SetCsrfFn
): Promise<Response> {
    const params = toQuery(filter);
    const url = `${API_NOTIFICATION_ME}${params.toString() ? `?${params}` : ''}`;

    const res = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });

    return updateToken(res, setCsrf);
}

export async function editNotificationMe(
    body: Notification,
    csrf: string,
    setCsrf: SetCsrfFn
): Promise<Response> {
    const doEdit = async (csrfToken: string) => {
        return await fetch(API_NOTIFICATION_ME, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                [CSRF_HEADER_NAME]: csrfToken,
            },
            body: JSON.stringify(body),
        });
    };

    let res = await doEdit(csrf);

    if (res.status === 406) {
        const retryToken = res.headers.get(CSRF_HEADER_NAME) || '';
        res = await doEdit(retryToken);
    }

    return updateToken(res, setCsrf);
}