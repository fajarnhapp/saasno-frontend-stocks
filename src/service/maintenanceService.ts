'use client';

import { SetCsrfFn, updateToken } from '@/utils/csrfUtils';
import { API_MAINTENANCE, API_MAINTENANCE_CLEANUP, API_MAINTENANCE_DOWNLOAD, API_MAINTENANCE_MODE } from '@/utils/endpointUtils';
import { jsonRequest, requestWithCsrf } from '@/utils/requestUtils';

export async function readMaintenance(setCsrf: SetCsrfFn): Promise<Response> {
    const res: Response = await fetch(API_MAINTENANCE, { method: 'GET', credentials: 'include' });
    return updateToken(res, setCsrf);
}

export type CleanupType = 'downloads' | 'audit-logs' | 'notifications';

// Cleans up everything, or only one kind of data when a type is given.
export const runCleanup = (csrf: string, setCsrf: SetCsrfFn, type?: CleanupType): Promise<Response> =>
    requestWithCsrf(jsonRequest(type ? `${API_MAINTENANCE_CLEANUP}?type=${type}` : API_MAINTENANCE_CLEANUP, 'POST'), csrf, setCsrf);

export const purgeAllDownloads = (csrf: string, setCsrf: SetCsrfFn): Promise<Response> =>
    requestWithCsrf(jsonRequest(API_MAINTENANCE_DOWNLOAD, 'DELETE'), csrf, setCsrf);

export async function readMaintenanceMode(setCsrf: SetCsrfFn): Promise<Response> {
    const res: Response = await fetch(API_MAINTENANCE_MODE, { method: 'GET', credentials: 'include' });
    return updateToken(res, setCsrf);
}

export const updateMaintenanceMode = (
    body: { enabled: boolean; message: string; until: string; bypassRoles: string[] },
    csrf: string,
    setCsrf: SetCsrfFn,
): Promise<Response> => requestWithCsrf(jsonRequest(API_MAINTENANCE_MODE, 'PUT', body), csrf, setCsrf);
