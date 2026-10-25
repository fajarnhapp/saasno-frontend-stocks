'use client';

import { EmailTemplate } from "@/type/email-template";
import { SetCsrfFn, updateToken } from "@/utils/csrfUtils";
import { API_EMAIL_TEMPLATE } from "@/utils/endpointUtils";
import { jsonRequest, requestWithCsrf } from "@/utils/requestUtils";

export async function readEmailTemplates(setCsrf: SetCsrfFn): Promise<Response> {
    const res: Response = await fetch(API_EMAIL_TEMPLATE, { method: 'GET', credentials: 'include' });
    return updateToken(res, setCsrf);
}

export const updateEmailTemplate = (body: EmailTemplate, csrf: string, setCsrf: SetCsrfFn): Promise<Response> =>
    requestWithCsrf(jsonRequest(API_EMAIL_TEMPLATE, 'PUT', body), csrf, setCsrf);

// Back to the built-in text.
export const resetEmailTemplate = (id: string, csrf: string, setCsrf: SetCsrfFn): Promise<Response> =>
    requestWithCsrf(jsonRequest(`${API_EMAIL_TEMPLATE}?id=${encodeURIComponent(id)}`, 'DELETE'), csrf, setCsrf);
