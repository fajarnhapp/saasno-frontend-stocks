'use client';

import { ChangeLogFilter, LoginHistoryFilter } from "@/type/history";
import { SetCsrfFn, updateToken } from "@/utils/csrfUtils";
import { API_CHANGE_LOG, API_SIGNIN_HISTORY } from "@/utils/endpointUtils";
import { toQuery } from "@/utils/queryUtils";

async function get(url: string, setCsrf: SetCsrfFn): Promise<Response> {
    const res: Response = await fetch(url, { method: 'GET', credentials: 'include' });
    return updateToken(res, setCsrf);
}

export const readLoginHistory = (filter: LoginHistoryFilter, setCsrf: SetCsrfFn): Promise<Response> =>
    get(`${API_SIGNIN_HISTORY}?${toQuery(filter)}`, setCsrf);

// The latest sign-in attempts of the signed-in user.
export const readMyLoginHistory = (setCsrf: SetCsrfFn): Promise<Response> => get(`${API_SIGNIN_HISTORY}/me`, setCsrf);

export const readChangeLog = (filter: ChangeLogFilter, setCsrf: SetCsrfFn): Promise<Response> =>
    get(`${API_CHANGE_LOG}?${toQuery(filter)}`, setCsrf);
