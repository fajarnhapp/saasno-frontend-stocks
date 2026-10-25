import { RoleAssignmentUpdate } from "@/type/role-assignment";
import { RoleMenuFilter } from "@/type/filter/RoleMenuFilter";
import { CSRF_HEADER_NAME, SetCsrfFn, updateToken } from "@/utils/csrfUtils";
import { toQuery } from "@/utils/queryUtils";

export async function updateRoleMenu(body: RoleAssignmentUpdate, csrf: string, setCsrf: SetCsrfFn): Promise<Response> {
    const doUpdate = async (csrfToken: string) => {
        const res: Response = await fetch('/api/role-menu', {
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

export async function readRoleMenu(filter: RoleMenuFilter, setCsrf: SetCsrfFn): Promise<Response> {
    const params = toQuery(filter);
    const url = `/api/role-menu?order=registered${params.toString() ? `&${params}` : ''}`;
    const res: Response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });
    return updateToken(res, setCsrf);
}
