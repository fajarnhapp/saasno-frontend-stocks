'use client';

import { SetCsrfFn } from '@/utils/csrfUtils';
import { API_USER_AVATAR } from '@/utils/endpointUtils';
import { fileRequest, jsonRequest, requestWithCsrf } from '@/utils/requestUtils';

// URL of a profile picture; the version changes when the picture does, so the browser never shows an old one.
export function avatarUrl(version: number | undefined, userId?: string): string {
    const params: URLSearchParams = new URLSearchParams();
    if (userId) params.set('id', userId);
    if (version) params.set('v', String(version));
    const query: string = params.toString();
    return query ? `${API_USER_AVATAR}?${query}` : API_USER_AVATAR;
}

export const uploadAvatar = (file: File, csrf: string, setCsrf: SetCsrfFn): Promise<Response> =>
    requestWithCsrf(fileRequest(API_USER_AVATAR, file), csrf, setCsrf);

export const deleteAvatar = (csrf: string, setCsrf: SetCsrfFn): Promise<Response> =>
    requestWithCsrf(jsonRequest(API_USER_AVATAR, 'DELETE'), csrf, setCsrf);
