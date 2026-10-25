'use client';

import { Announcement, AnnouncementFilter } from "@/type/announcement";
import { SetCsrfFn, updateToken } from "@/utils/csrfUtils";
import { API_ANNOUNCEMENT } from "@/utils/endpointUtils";
import { toQuery } from "@/utils/queryUtils";
import { jsonRequest, requestWithCsrf } from "@/utils/requestUtils";

async function get(url: string, setCsrf: SetCsrfFn): Promise<Response> {
    const res: Response = await fetch(url, { method: 'GET', credentials: 'include' });
    return updateToken(res, setCsrf);
}

export const readAnnouncement = (filter: AnnouncementFilter, setCsrf: SetCsrfFn): Promise<Response> =>
    get(`${API_ANNOUNCEMENT}?${toQuery(filter)}`, setCsrf);

// The announcements showing now (for the banner).
export const readActiveAnnouncements = (setCsrf: SetCsrfFn): Promise<Response> => get(`${API_ANNOUNCEMENT}/active`, setCsrf);

export const createAnnouncement = (body: Announcement, csrf: string, setCsrf: SetCsrfFn): Promise<Response> =>
    requestWithCsrf(jsonRequest(API_ANNOUNCEMENT, 'POST', body), csrf, setCsrf);

export const updateAnnouncement = (body: Announcement, csrf: string, setCsrf: SetCsrfFn): Promise<Response> =>
    requestWithCsrf(jsonRequest(API_ANNOUNCEMENT, 'PUT', body), csrf, setCsrf);

export const deleteAnnouncement = (id: string, csrf: string, setCsrf: SetCsrfFn): Promise<Response> =>
    requestWithCsrf(jsonRequest(`${API_ANNOUNCEMENT}?id=${encodeURIComponent(id)}`, 'DELETE'), csrf, setCsrf);
