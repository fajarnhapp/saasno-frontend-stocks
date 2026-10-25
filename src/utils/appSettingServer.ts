import { AppSetting } from '@/type/app-setting';
import { DEFAULT_APP_SETTING, sanitizeAppSetting } from './appSettingUtils';
import { API_BACKEND_PUBLIC, BACKEND_URL } from './endpointUtils';

// Read on the server for every page (name, brand colour, logo). If the backend is slow or down the defaults are used, so the pages still open.
export async function getAppSetting(): Promise<AppSetting> {
    try {
        const res: Response = await fetch(`${BACKEND_URL + API_BACKEND_PUBLIC}/app-setting`, {
            cache: 'no-store',
            signal: AbortSignal.timeout(2000),
        });
        if (!res.ok) {
            return DEFAULT_APP_SETTING;
        }
        const body: { data?: Partial<AppSetting> } = await res.json();
        return sanitizeAppSetting(body.data);
    } catch {
        return DEFAULT_APP_SETTING;
    }
}
