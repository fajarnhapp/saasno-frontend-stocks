'use client';

import { logout } from "@/service/logoutService";
import { CSRF_HEADER_NAME } from "./csrfUtils";
import { PAGE_MAINTENANCE } from "./endpointUtils";

export const API_MSG_SUCCESS: string = 'Success';

// The backend answers 503 to everyone but the allowed roles while maintenance mode is on.
function goToMaintenancePage(): void {
    if (window.location.pathname !== PAGE_MAINTENANCE) {
        window.location.replace(PAGE_MAINTENANCE);
    }
}

export async function handleResponseTable<T>(
    res: Response,
    redirectFn?: (url: string) => void
): Promise<T> {
    if (res.ok) {
        return res.json();
    }

    if (!res.ok) {
        if (res.status === 401) {
            await logout(res.headers.get(CSRF_HEADER_NAME) || '');
            const redirectUrl = `${window.location.origin}/login?message=Your session has expired. Please log in again.`;
            if (redirectFn) {
                redirectFn(redirectUrl);
            } else {
                window.location.replace(redirectUrl);
            }
        }

        if (res.status === 503) {
            goToMaintenancePage();
        }
    }

    return { data: [], total: 0, grandTotal: 0 } as T;
}

export async function handleResponseApi<T>(
    res: Response,
    redirectFn?: (url: string) => void
): Promise<T> {
    if (res.ok) {
        return res.json();
    }

    if (!res.ok) {
        if (res.status === 401) {
            await logout(res.headers.get(CSRF_HEADER_NAME) || '');
            const redirectUrl = `${window.location.origin}/login?message=Your session has expired. Please log in again.`;
            if (redirectFn) {
                redirectFn(redirectUrl);
            } else {
                window.location.replace(redirectUrl);
            }

            return { message: 'Your session has expired, please log in again' } as T;
        }

        if (res.status === 403) {
            return { message: 'You do not have access to this feature' } as T;
        }

        if (res.status === 503) {
            goToMaintenancePage();
            return { message: 'The system is under maintenance' } as T;
        }
    }

    return res.json();
}