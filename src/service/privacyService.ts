'use client';

import { SetCsrfFn, updateToken } from "@/utils/csrfUtils";
import { API_PERSON_EXPORT, API_POLICY, API_PRIVACY } from "@/utils/endpointUtils";
import { jsonRequest, requestWithCsrf } from "@/utils/requestUtils";

export interface PolicyVersion { version: number; publishedAt?: string; publishedBy?: string }
// content is in the asked language when there is one; bilingual = both languages exist, so a choice of language makes sense.
export interface Policy extends PolicyVersion { content: string; builtIn: boolean; bilingual: boolean }
// The version in use with both of its texts (English and Indonesian), and the published versions.
export interface PolicyAdmin { version: number; builtIn: boolean; contentEn: string; contentId: string; versions: PolicyVersion[] }
export interface PrivacyStatus {
    version: number;
    builtIn: boolean;
    acceptedVersion?: number;
    acceptedAt?: string;
    needsAcceptance: boolean;
    deletionPending: boolean;
}
export interface DeletionRequest { id: string; username: string; status: string; requestedAt?: string; handledAt?: string; handledBy?: string }

async function get(url: string, setCsrf: SetCsrfFn): Promise<Response> {
    const res: Response = await fetch(url, { method: 'GET', credentials: 'include' });
    return updateToken(res, setCsrf);
}

// The public text (no login needed).
export const readPolicy = (language: string): Promise<Response> => fetch(`${API_POLICY}?lang=${language}`, { credentials: 'include' });

export const readPolicyAdmin = (setCsrf: SetCsrfFn): Promise<Response> => get(`${API_PRIVACY}/policy`, setCsrf);
export const publishPolicy = (content: string, contentId: string, csrf: string, setCsrf: SetCsrfFn): Promise<Response> =>
    requestWithCsrf(jsonRequest(`${API_PRIVACY}/policy`, 'POST', { content, contentId }), csrf, setCsrf);

export const readPrivacyStatus = (setCsrf: SetCsrfFn): Promise<Response> => get(`${API_PRIVACY}/me`, setCsrf);
export const acceptPolicy = (csrf: string, setCsrf: SetCsrfFn): Promise<Response> =>
    requestWithCsrf(jsonRequest(`${API_PRIVACY}/accept`, 'POST'), csrf, setCsrf);

export const requestAccountDeletion = (csrf: string, setCsrf: SetCsrfFn): Promise<Response> =>
    requestWithCsrf(jsonRequest(`${API_PRIVACY}/delete-request`, 'POST'), csrf, setCsrf);
export const readDeletionRequests = (setCsrf: SetCsrfFn): Promise<Response> => get(`${API_PRIVACY}/delete-requests`, setCsrf);
export const handleDeletionRequest = (id: string, action: 'APPROVE' | 'REJECT', csrf: string, setCsrf: SetCsrfFn): Promise<Response> =>
    requestWithCsrf(jsonRequest(`${API_PRIVACY}/delete-requests?id=${encodeURIComponent(id)}&action=${action}`, 'PUT'), csrf, setCsrf);

export const readMyData = (setCsrf: SetCsrfFn): Promise<Response> => get(API_PERSON_EXPORT, setCsrf);
