'use client';

import { Person } from '@/type/user';
import { SetCsrfFn, updateToken } from '@/utils/csrfUtils';
import { API_EMAIL_VERIFY, API_PERSON_ME, API_PERSON_VERIFY_EMAIL } from '@/utils/endpointUtils';
import { jsonRequest, requestWithCsrf } from '@/utils/requestUtils';

// Biodata and contacts of the signed-in user.
export async function readPersonMe(setCsrf: SetCsrfFn): Promise<Response> {
    const res: Response = await fetch(API_PERSON_ME, { method: 'GET', credentials: 'include' });
    return updateToken(res, setCsrf);
}

// Opens the link from the confirmation email (no login needed).
export const confirmEmail = (token: string, csrf: string, setCsrf: SetCsrfFn): Promise<Response> =>
    requestWithCsrf(jsonRequest(API_EMAIL_VERIFY, 'POST', { token }), csrf, setCsrf);

// Emails a confirmation link to one of the user's own saved email addresses.
export const requestEmailVerification = (contactId: string, csrf: string, setCsrf: SetCsrfFn): Promise<Response> =>
    requestWithCsrf(jsonRequest(`${API_PERSON_VERIFY_EMAIL}?id=${encodeURIComponent(contactId)}`, 'POST'), csrf, setCsrf);

export const updatePersonMe = (body: Person, csrf: string, setCsrf: SetCsrfFn): Promise<Response> =>
    requestWithCsrf(jsonRequest(API_PERSON_ME, 'PUT', body), csrf, setCsrf);
