import { AuditLogFilter } from "@/type/filter/AuditLogFilter";
import { SetCsrfFn, updateToken } from "@/utils/csrfUtils";
import { API_LOG } from "@/utils/endpointUtils";
import { toQuery } from "@/utils/queryUtils";

export async function readAuditLog(filter: AuditLogFilter, setCsrf: SetCsrfFn): Promise<Response> {
    const params = toQuery(filter);
    const res: Response = await fetch(`${API_LOG}?${params}`, {
        method: 'GET',
        credentials: 'include'
    });
    return updateToken(res, setCsrf);
}

export type ChartRange = '1h' | '3h' | '6h' | '12h';

export async function readAuditLogChart(range: ChartRange, setCsrf: SetCsrfFn): Promise<Response> {
    const res: Response = await fetch(`${API_LOG}/chart?range=${range}`, {
        method: 'GET',
        credentials: 'include',
    });
    return updateToken(res, setCsrf);
}
