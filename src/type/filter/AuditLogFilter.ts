import { BaseFilter } from "./BaseFilter";

export interface AuditLogFilter extends BaseFilter {
    userId?: string;
    username?: string;
    personName?: string;
    method?: string;
    uri?: string;
    clientIp?: string;
    startDate?: string;
    endDate?: string;
}
