export interface AuditLog {
    id?: number;
    userId?: string;
    username?: string;
    personName?: string;
    traceId?: string;
    method?: string;
    uri?: string;
    clientIp?: string;
    statusCode?: number;
    executionTimeMs?: number;
    errorMessage?: string | null;
    requestParam?: string | null;
    requestBody?: string | null;
    registered?: string; // ISO timestamp
}
