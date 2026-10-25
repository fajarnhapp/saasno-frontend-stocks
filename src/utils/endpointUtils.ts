import { generateRandomHex } from "./idUtils";

// Lazy + memoized: must NOT throw at module-load time, because `next build` evaluates
// route modules (which import this) under NODE_ENV=production during page-data collection,
// before the runtime secret is ever injected. The check only fires once a real request is
// being handled, and the resolved value is cached for the lifetime of the process.
let cachedCsrfKey: string | null = null;

export function getCsrfKey(): string {
    if (cachedCsrfKey) return cachedCsrfKey;

    const fromEnv = process.env.SAASNO_FRONTEND_KEY_CSRF;
    if (fromEnv) {
        cachedCsrfKey = fromEnv;
        return cachedCsrfKey;
    }

    if (process.env.NODE_ENV === 'production') {
        throw new Error('SAASNO_FRONTEND_KEY_CSRF env var must be set in production');
    }

    // Dev-only fallback: fresh per-process secret, never a value committed to source.
    cachedCsrfKey = generateRandomHex(32);
    return cachedCsrfKey;
}

export const BACKEND_URL: string = process.env.SAASNO_FRONTEND_BACKEND_URL || 'http://localhost:8000';
export const ROOT_PATH: string = '/';
export const PAGE_NOT_FOUND: string = '/not-found';
export const PAGE_FORBIDDEN: string = '/forbidden';
export const PAGE_LOGIN: string = '/login';
export const PAGE_DASHBOARD: string = '/dashboard';
export const PAGE_MAINTENANCE: string = '/maintenance';
export const PAGE_FORGOT_PASSWORD: string = '/forgot-password';
export const PAGE_RESET_PASSWORD: string = '/reset-password';
export const PAGE_CHANGE_PASSWORD: string = '/change-password';
export const PAGE_SETUP_TWO_FACTOR: string = '/setup-2fa';
export const PAGE_PROFILE: string = '/profile';
export const API: string = '/api';
export const API_ROLE: string = API + '/role';
export const API_MENU: string = API + '/menu';
export const API_API: string = API + '/api';
export const API_CONFIGURATION: string = API + '/configuration';
export const API_ROLE_MENU: string = API + '/role-menu';
export const API_ROLE_API: string = API + '/role-api';
export const API_LOGIN: string = API + '/login';
export const API_LOGIN_OTP_VERIFY: string = API_LOGIN + '/otp/verify';
export const API_LOGOUT: string = API + '/logout';
export const API_PASSWORD: string = API + '/password';
export const API_EMAIL: string = API + '/email';
export const API_EMAIL_VERIFY: string = API_EMAIL + '/verify';
export const API_PERSON_VERIFY_EMAIL: string = API + '/person/me/verify-email';
export const PAGE_VERIFY_EMAIL: string = '/verify-email';
export const API_PASSWORD_FORGOT: string = API_PASSWORD + '/forgot';
export const API_PASSWORD_RESET: string = API_PASSWORD + '/reset';
export const API_PASSWORD_POLICY: string = API_PASSWORD + '/policy';
export const API_HEALTH: string = API + '/health';
export const API_BACKEND_PUBLIC: string = API + '/public';
export const API_FARO: string = API + '/faro';
export const API_USER: string = API + '/user';
export const API_USER_CHANGE_PASSWORD: string = API_USER + '/change-password';
export const API_USER_RESET_PASSWORD: string = API_USER + '/reset-password';
export const API_USER_RESET_TWO_FACTOR: string = API_USER + '/reset-two-factor';
export const API_USER_TRASH: string = API_USER + '/trash';
export const API_USER_RESTORE: string = API_USER + '/restore';
export const API_USER_PURGE: string = API_USER + '/purge';
export const API_USER_BULK: string = API_USER + '/bulk';
export const API_USER_IMPORT: string = API_USER + '/import';
// The public text of the privacy policy. Not under /api/privacy: PUBLIC_API matches by prefix and the rest of /api/privacy needs a session.
export const API_POLICY: string = API + '/policy';
export const API_PRIVACY: string = API + '/privacy';
export const API_PERSON_EXPORT: string = API + '/person/me/export';
export const PAGE_PRIVACY: string = '/privacy';
export const API_TOKEN: string = API + '/token';
export const API_USER_VERIFY_PASSWORD: string = API_USER + '/verify-password';
export const API_USER_OTP: string = API_USER + '/otp';
export const API_USER_OTP_SETUP: string = API_USER_OTP + '/setup';
export const API_USER_OTP_ENABLE: string = API_USER_OTP + '/enable';
export const API_USER_AVATAR: string = API_USER + '/avatar';
export const API_USER_OTP_RECOVERY: string = API_USER_OTP + '/recovery';
export const API_APP_SETTING: string = API + '/app-setting';
export const API_APP_SETTING_LOGO: string = API_APP_SETTING + '/logo';
export const API_APP_LOGO: string = API + '/app-logo';
export const API_MAINTENANCE: string = API + '/maintenance';
export const API_MAINTENANCE_MODE: string = API_MAINTENANCE + '/mode';
export const API_MAINTENANCE_STATUS: string = API + '/maintenance-status';
export const API_MAINTENANCE_CLEANUP: string = API_MAINTENANCE + '/cleanup';
export const API_MAINTENANCE_DOWNLOAD: string = API_MAINTENANCE + '/download';
export const API_DOWNLOAD: string = API + '/download';
export const API_DOWNLOAD_ALL: string = API_DOWNLOAD + '/all';
export const API_DOWNLOAD_FILE: string = API_DOWNLOAD + '/file';
export const API_LOG: string = API + '/log';
// Not named /api/login-...: PUBLIC_API matches by prefix and /api/login is public.
export const API_SIGNIN_HISTORY: string = API + '/signin-history';
export const API_CHANGE_LOG: string = API + '/change-log';
export const API_ANNOUNCEMENT: string = API + '/announcement';
export const API_EMAIL_TEMPLATE: string = API + '/email-template';
export const API_SESSION: string = API + '/session';
export const API_SESSION_ALL: string = API_SESSION + '/all';
export const API_NOTIFICATION_ME: string = API + '/notification/me';
export const API_NOTIFICATION_UNREAD_ME: string = API + '/notification-unread/me';
export const API_USER_ME: string = API + '/user/me';
export const API_PERSON_ME: string = API + '/person/me';
export const API_SERVICE_NOTIFICATION: string = API + '/service/notification';

export const STATIC_PATH_PLACE: string = '/place';
export const STATIC_PATH_IMAGE: string = '/image';

export const PUBLIC_PAGES: string[] = [
    ROOT_PATH,
    PAGE_LOGIN,
    PAGE_FORGOT_PASSWORD,
    PAGE_RESET_PASSWORD,
    PAGE_VERIFY_EMAIL,
    PAGE_PRIVACY,
    PAGE_MAINTENANCE,
    PAGE_NOT_FOUND,
    PAGE_FORBIDDEN,
];

// NOTE: do not add ROOT_PATH ('/') here — every API pathname starts with '/', so
// PUBLIC_API.some(p => pathname.startsWith(p)) would always be true and the session
// check in proxy.ts would never run for any /api/* route.
export const PUBLIC_API: string[] = [
    API_LOGIN,
    API_PASSWORD,
    API_EMAIL,
    API_POLICY,
    API_HEALTH,
    API_APP_LOGO,
    API_MAINTENANCE_STATUS,
    API_SERVICE_NOTIFICATION,
    API_FARO
];

export const STATIC_PATH_PREFIXES: string[] = [
    STATIC_PATH_PLACE,
    STATIC_PATH_IMAGE
];