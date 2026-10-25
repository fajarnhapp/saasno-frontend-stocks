'use client';

import { SetCsrfFn, updateToken } from '@/utils/csrfUtils';
import { API_APP_LOGO, API_APP_SETTING, API_APP_SETTING_LOGO } from '@/utils/endpointUtils';
import { fileRequest, jsonRequest, requestWithCsrf } from '@/utils/requestUtils';

export function logoUrl(version: number): string {
    return `${API_APP_LOGO}?v=${version}`;
}

export async function readAppSetting(setCsrf: SetCsrfFn): Promise<Response> {
    const res: Response = await fetch(API_APP_SETTING, { method: 'GET', credentials: 'include' });
    return updateToken(res, setCsrf);
}

export const updateAppSetting = (
    body: { appName: string; brandHue: string; brandChroma: string },
    csrf: string,
    setCsrf: SetCsrfFn,
): Promise<Response> => requestWithCsrf(jsonRequest(API_APP_SETTING, 'PUT', body), csrf, setCsrf);

export const uploadLogo = (file: File, csrf: string, setCsrf: SetCsrfFn): Promise<Response> =>
    requestWithCsrf(fileRequest(API_APP_SETTING_LOGO, file), csrf, setCsrf);

export const deleteLogo = (csrf: string, setCsrf: SetCsrfFn): Promise<Response> =>
    requestWithCsrf(jsonRequest(API_APP_SETTING_LOGO, 'DELETE'), csrf, setCsrf);
