import type { AppSetting, MaintenanceStatus } from '../type/app-setting/index.ts';
import { DEFAULT_BRAND_CHROMA, DEFAULT_BRAND_HUE, clampChroma, clampHue } from './brandUtils.ts';

export const DEFAULT_APP_NAME = 'Saasno';

export const NO_MAINTENANCE: MaintenanceStatus = { active: false, message: '', until: null };

export const DEFAULT_APP_SETTING: AppSetting = {
    appName: DEFAULT_APP_NAME,
    brandHue: DEFAULT_BRAND_HUE,
    brandChroma: DEFAULT_BRAND_CHROMA,
    hasLogo: false,
    logoVersion: 0,
    maintenance: NO_MAINTENANCE,
};

export function sanitizeMaintenance(raw: Partial<MaintenanceStatus> | null | undefined): MaintenanceStatus {
    if (raw?.active !== true) {
        return NO_MAINTENANCE;
    }
    const until: string | null = typeof raw.until === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw.until) ? raw.until : null;
    return { active: true, message: typeof raw.message === 'string' ? raw.message.slice(0, 500) : '', until };
}

// Makes whatever the backend sent safe to use: wrong types fall back to the defaults, numbers are kept in range.
export function sanitizeAppSetting(raw: Partial<AppSetting> | null | undefined): AppSetting {
    const name: string = typeof raw?.appName === 'string' ? raw.appName.trim().slice(0, 60) : '';
    return {
        appName: name || DEFAULT_APP_NAME,
        brandHue: clampHue(raw?.brandHue),
        brandChroma: clampChroma(raw?.brandChroma),
        hasLogo: raw?.hasLogo === true,
        logoVersion: typeof raw?.logoVersion === 'number' && raw.logoVersion > 0 ? raw.logoVersion : 0,
        maintenance: sanitizeMaintenance(raw?.maintenance),
    };
}
