export interface MaintenanceSummary {
    downloadJobs: number;
    downloadBytes: number;
    auditLogs: number;
    notifications: number;
    downloadRetentionDays: number;
    auditLogRetentionDays: number;
    notificationRetentionDays: number;
}

export interface CleanupResult {
    downloads: number;
    auditLogs: number;
    notifications: number;
}

export interface RoleOption {
    id: string;
    name: string;
}

// The saved maintenance settings. "active" can be false while "enabled" is true: the end time has passed.
export interface MaintenanceMode {
    enabled: boolean;
    active: boolean;
    message: string;
    until: string | null;
    bypassRoles: string[];
    roles: RoleOption[];
}
