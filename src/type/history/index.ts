import { BaseFilter } from "../filter/BaseFilter";

export interface LoginHistory {
    id?: string;
    userId?: string;
    username?: string;
    success?: boolean;
    reason?: string;
    ip?: string;
    userAgent?: string;
    registered?: string;
}

export interface ChangeLog {
    id?: string;
    entityType?: string;
    entityId?: string;
    entityLabel?: string;
    action?: string;
    field?: string;
    oldValue?: string;
    newValue?: string;
    changedBy?: string;
    registered?: string;
}

export interface LoginHistoryFilter extends BaseFilter {
    username?: string;
    ip?: string;
}

export interface ChangeLogFilter extends BaseFilter {
    entityType?: string;
    entityLabel?: string;
    changedBy?: string;
}
