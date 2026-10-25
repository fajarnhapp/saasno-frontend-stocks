// Whether maintenance mode is on right now (anyone may see this) and, if known, when it ends (yyyy-MM-ddTHH:mm, server time).
export interface MaintenanceStatus {
    active: boolean;
    message: string;
    until: string | null;
}

export interface AppSetting {
    appName: string;
    brandHue: number;
    brandChroma: number;
    hasLogo: boolean;
    logoVersion: number;
    maintenance: MaintenanceStatus;
}
