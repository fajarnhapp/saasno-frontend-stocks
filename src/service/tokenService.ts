'use client';

import { SetCsrfFn, updateToken } from "@/utils/csrfUtils";
import { API_TOKEN } from "@/utils/endpointUtils";
import { jsonRequest, requestWithCsrf } from "@/utils/requestUtils";

export async function readTokens(setCsrf: SetCsrfFn): Promise<Response> {
    const res: Response = await fetch(API_TOKEN, { method: 'GET', credentials: 'include' });
    return updateToken(res, setCsrf);
}

export const createToken = (name: string, expiresInDays: number, csrf: string, setCsrf: SetCsrfFn): Promise<Response> =>
    requestWithCsrf(jsonRequest(API_TOKEN, 'POST', { name, expiresInDays }), csrf, setCsrf);

export const revokeToken = (id: string, csrf: string, setCsrf: SetCsrfFn): Promise<Response> =>
    requestWithCsrf(jsonRequest(`${API_TOKEN}?id=${encodeURIComponent(id)}`, 'DELETE'), csrf, setCsrf);
