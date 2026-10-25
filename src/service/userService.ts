'use client';

import { User } from "@/type/user";
import { UserFilter } from "@/type/filter/UserFilter";
import { CSRF_HEADER_NAME, SetCsrfFn, updateToken } from "@/utils/csrfUtils";
import { API_USER, API_USER_BULK, API_USER_IMPORT, API_USER_PURGE, API_USER_RESTORE, API_USER_TRASH, API_USER_CHANGE_PASSWORD, API_USER_ME, API_USER_OTP, API_USER_OTP_ENABLE, API_USER_OTP_RECOVERY, API_USER_OTP_SETUP, API_USER_RESET_PASSWORD, API_USER_RESET_TWO_FACTOR, API_USER_VERIFY_PASSWORD } from "@/utils/endpointUtils";
import { toQuery } from "@/utils/queryUtils";
import { jsonRequest, requestWithCsrf } from "@/utils/requestUtils";

export async function createUser(body: User, csrf: string, setCsrf: SetCsrfFn): Promise<Response> {
    const doCreate = async (csrfToken: string) => {
        return await fetch(API_USER, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                [CSRF_HEADER_NAME]: csrfToken,
            },
            body: JSON.stringify(body),
        });
    };

    let res = await doCreate(csrf);

    if (res.status === 406) {
        const retryToken = res.headers.get(CSRF_HEADER_NAME) || '';
        res = await doCreate(retryToken);
    }

    return updateToken(res, setCsrf);
}

export async function readUser(filter: UserFilter, setCsrf: SetCsrfFn): Promise<Response> {
    const params = toQuery(filter);
    const url = `${API_USER}${params.toString() ? `?${params}` : ''}`;
    const res: Response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });

    return updateToken(res, setCsrf);
}

export async function updateUser(body: User, csrf: string, setCsrf: SetCsrfFn): Promise<Response> {
    const doUpdate = async (csrfToken: string) => {
        return await fetch(API_USER, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                [CSRF_HEADER_NAME]: csrfToken,
            },
            body: JSON.stringify(body),
        });
    };

    let res = await doUpdate(csrf);

    if (res.status === 406) {
        const retryToken = res.headers.get(CSRF_HEADER_NAME) || '';
        res = await doUpdate(retryToken);
    }

    return updateToken(res, setCsrf);
}

export async function deleteUser(id: string, csrf: string, setCsrf: SetCsrfFn): Promise<Response> {
    const doDelete = async (csrfToken: string) => {
        return await fetch(`${API_USER}?id=${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                [CSRF_HEADER_NAME]: csrfToken,
            }
        });
    };

    let res = await doDelete(csrf);

    if (res.status === 406) {
        const retryToken = res.headers.get(CSRF_HEADER_NAME) || '';
        res = await doDelete(retryToken);
    }

    return updateToken(res, setCsrf);
}

export async function readUserMe(
    setCsrf: SetCsrfFn
): Promise<Response> {
    const res = await fetch(API_USER_ME, {
        method: 'GET',
        credentials: 'include'
    });

    return updateToken(res, setCsrf);
}

export async function resetPassword(
    username: string,
    csrf: string,
    setCsrf: SetCsrfFn
): Promise<Response> {
    const doReset = async (csrfToken: string) => {
        const res: Response = await fetch(`${API_USER_RESET_PASSWORD}?username=${username}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                [CSRF_HEADER_NAME]: csrfToken,
            },
        });
        return res;
    };

    let res = await doReset(csrf);

    if (res.status === 406) {
        const retryToken = res.headers.get(CSRF_HEADER_NAME) || '';
        res = await doReset(retryToken);
    }

    return updateToken(res, setCsrf);
}

export async function resetTwoFactor(
    username: string,
    csrf: string,
    setCsrf: SetCsrfFn
): Promise<Response> {
    const doResetTwoFactor = async (csrfToken: string) => {
        const res: Response = await fetch(`${API_USER_RESET_TWO_FACTOR}?username=${username}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                [CSRF_HEADER_NAME]: csrfToken,
            },
        });
        return res;
    };

    let res = await doResetTwoFactor(csrf);

    if (res.status === 406) {
        const retryToken = res.headers.get(CSRF_HEADER_NAME) || '';
        res = await doResetTwoFactor(retryToken);
    }

    return updateToken(res, setCsrf);
}

export async function changePassword(
    password: string,
    oldPassword: string,
    csrf: string,
    setCsrf: SetCsrfFn
): Promise<Response> {
    const doChange = async (csrfToken: string) => {
        const res: Response = await fetch(API_USER_CHANGE_PASSWORD, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                [CSRF_HEADER_NAME]: csrfToken,
            },
            body: JSON.stringify({ password, oldPassword }),
        });
        return res;
    };

    let res = await doChange(csrf);

    if (res.status === 406) {
        const retryToken = res.headers.get(CSRF_HEADER_NAME) || '';
        res = await doChange(retryToken);
    }

    return updateToken(res, setCsrf);
}

export async function verifyPassword(
    password: string,
    csrf: string,
    setCsrf: SetCsrfFn
): Promise<Response> {
    const doVerify = async (csrfToken: string) => {
        const res: Response = await fetch(API_USER_VERIFY_PASSWORD, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                [CSRF_HEADER_NAME]: csrfToken,
            },
            body: JSON.stringify({ password }),
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

export async function setupTwoFactor(csrf: string, setCsrf: SetCsrfFn): Promise<Response> {
    const doSetup = async (csrfToken: string) => {
        return await fetch(API_USER_OTP_SETUP, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                [CSRF_HEADER_NAME]: csrfToken,
            },
        });
    };

    let res = await doSetup(csrf);

    if (res.status === 406) {
        const retryToken = res.headers.get(CSRF_HEADER_NAME) || '';
        res = await doSetup(retryToken);
    }

    return updateToken(res, setCsrf);
}

export async function enableTwoFactor(code: string, csrf: string, setCsrf: SetCsrfFn): Promise<Response> {
    const doEnable = async (csrfToken: string) => {
        return await fetch(API_USER_OTP_ENABLE, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                [CSRF_HEADER_NAME]: csrfToken,
            },
            body: JSON.stringify({ code }),
        });
    };

    let res = await doEnable(csrf);

    if (res.status === 406) {
        const retryToken = res.headers.get(CSRF_HEADER_NAME) || '';
        res = await doEnable(retryToken);
    }

    return updateToken(res, setCsrf);
}

export async function disableTwoFactor(code: string, csrf: string, setCsrf: SetCsrfFn): Promise<Response> {
    const doDisable = async (csrfToken: string) => {
        return await fetch(API_USER_OTP, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                [CSRF_HEADER_NAME]: csrfToken,
            },
            body: JSON.stringify({ code }),
        });
    };

    let res = await doDisable(csrf);

    if (res.status === 406) {
        const retryToken = res.headers.get(CSRF_HEADER_NAME) || '';
        res = await doDisable(retryToken);
    }

    return updateToken(res, setCsrf);
}

// New recovery codes for two-step verification (the old ones stop working); needs a current authenticator code.
export async function regenerateRecoveryCodes(code: string, csrf: string, setCsrf: SetCsrfFn): Promise<Response> {
    return requestWithCsrf(jsonRequest(API_USER_OTP_RECOVERY, 'POST', { code }), csrf, setCsrf);
}

// ---- trash, bulk actions and import ----

export interface BulkActionItem { id: string; username?: string; ok: boolean; message: string }
export interface BulkActionResult { succeeded: number; failed: number; items: BulkActionItem[] }
export interface ImportItem { line: number; username: string; ok: boolean; message: string }
export interface ImportResult { dryRun: boolean; valid: number; invalid: number; created: number; items: ImportItem[] }

export async function readUserTrash(filter: UserFilter, setCsrf: SetCsrfFn): Promise<Response> {
    const res: Response = await fetch(`${API_USER_TRASH}?${toQuery(filter)}`, { method: 'GET', credentials: 'include' });
    return updateToken(res, setCsrf);
}

export const restoreUser = (id: string, csrf: string, setCsrf: SetCsrfFn): Promise<Response> =>
    requestWithCsrf(jsonRequest(`${API_USER_RESTORE}?id=${encodeURIComponent(id)}`, 'PUT'), csrf, setCsrf);

// Removes a user from the trash for good.
export const purgeUser = (id: string, csrf: string, setCsrf: SetCsrfFn): Promise<Response> =>
    requestWithCsrf(jsonRequest(`${API_USER_PURGE}?id=${encodeURIComponent(id)}`, 'DELETE'), csrf, setCsrf);

export const bulkUserAction = (ids: string[], action: string, roleId: string | undefined, csrf: string, setCsrf: SetCsrfFn): Promise<Response> =>
    requestWithCsrf(jsonRequest(API_USER_BULK, 'POST', { ids, action, roleId }), csrf, setCsrf);

export const importUsers = (rows: object[], dryRun: boolean, csrf: string, setCsrf: SetCsrfFn): Promise<Response> =>
    requestWithCsrf(jsonRequest(API_USER_IMPORT, 'POST', { rows, dryRun }), csrf, setCsrf);
