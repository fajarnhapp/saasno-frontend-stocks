import { SetCsrfFn } from "@/utils/csrfUtils";
import { API_SESSION, API_SESSION_ALL } from "@/utils/endpointUtils";
import { getJson, sendJson } from "./jsonService";

export const readMySessions = (setCsrf: SetCsrfFn) => getJson(API_SESSION, {}, setCsrf);
export const readAllSessions = (setCsrf: SetCsrfFn) => getJson(API_SESSION_ALL, {}, setCsrf);
export const revokeMySession = (handle: string, csrf: string, setCsrf: SetCsrfFn) => sendJson('DELETE', `${API_SESSION}?handle=${encodeURIComponent(handle)}`, undefined, csrf, setCsrf);
// Tanpa handle: semua perangkat lain milik sendiri.
export const revokeOtherSessions = (csrf: string, setCsrf: SetCsrfFn) => sendJson('DELETE', API_SESSION, undefined, csrf, setCsrf);
// Without a user: every session of every user; with one: all sessions of that user. The session in use always stays.
export const revokeAllSessions = (userId: string | undefined, csrf: string, setCsrf: SetCsrfFn) => sendJson('DELETE', userId ? `${API_SESSION_ALL}?userId=${encodeURIComponent(userId)}` : API_SESSION_ALL, undefined, csrf, setCsrf);
export const revokeAnySession = (handle: string, csrf: string, setCsrf: SetCsrfFn) => sendJson('DELETE', `${API_SESSION_ALL}?handle=${encodeURIComponent(handle)}`, undefined, csrf, setCsrf);
