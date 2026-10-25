export interface SessionInfo {
    handle: string;
    userId: string;
    username: string;
    ip?: string | null;
    userAgent?: string | null;
    registered: string;
    expired: string;
    current: boolean;
}
