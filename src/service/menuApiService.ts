import { RoleApiFilter } from "@/type/filter/MenuApiFilter";
import { RoleAssignmentUpdate } from "@/type/role-assignment";
import { CSRF_HEADER_NAME, SetCsrfFn, updateToken } from "@/utils/csrfUtils";
import { API_ROLE_API } from "@/utils/endpointUtils";
import { toQuery } from "@/utils/queryUtils";

export async function updateRoleApi(body: RoleAssignmentUpdate, csrf: string, setCsrf: SetCsrfFn): Promise<Response> {
    const doUpdate = async (csrfToken: string) => {
        const res: Response = await fetch(API_ROLE_API, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                [CSRF_HEADER_NAME]: csrfToken,
            },
            body: JSON.stringify(body),
        });
        return res;
    };
    const res = await doUpdate(csrf);
    if (res.status === 406) {
        return await doUpdate(res.headers.get(CSRF_HEADER_NAME) || '');
    }
    return updateToken(res, setCsrf);
}

export async function readRoleApi(filter: RoleApiFilter, setCsrf: SetCsrfFn): Promise<Response> {
    const params = toQuery(filter);
    const url = `${API_ROLE_API}?order=registered${params.toString() ? `&${params}` : ''}`;
    const res: Response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });
    return updateToken(res, setCsrf);
}
