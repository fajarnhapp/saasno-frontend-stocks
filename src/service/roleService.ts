import { RoleFilter } from "@/type/filter/RoleFilter";
import { Role } from "@/type/role";
import { CSRF_HEADER_NAME, SetCsrfFn, updateToken } from "@/utils/csrfUtils";
import { API_ROLE } from "@/utils/endpointUtils";
import { toQuery } from "@/utils/queryUtils";

export async function createRole(body: Role, csrf: string, setCsrf: SetCsrfFn): Promise<Response> {
    const doCreate = async (csrfToken: string) => {
        const res: Response = await fetch(API_ROLE, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                [CSRF_HEADER_NAME]: csrfToken,
            },
            body: JSON.stringify(body),
        });
        return res;
    };
    const res = await doCreate(csrf);
    if (res.status === 406) {
        return await doCreate(res.headers.get(CSRF_HEADER_NAME) || '');
    }
    return updateToken(res, setCsrf);
}

export async function editRole(body: Role, csrf: string, setCsrf: SetCsrfFn): Promise<Response> {
    const doEdit = async (csrfToken: string) => {
        const res: Response = await fetch(API_ROLE, {
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
    const res = await doEdit(csrf);
    if (res.status === 406) {
        return await doEdit(res.headers.get(CSRF_HEADER_NAME) || '');
    }
    return updateToken(res, setCsrf);
}

export async function readRole(filter: RoleFilter, setCsrf: SetCsrfFn): Promise<Response> {
    const params = toQuery(filter);
    const url = `${API_ROLE}${params.toString() ? `?${params}` : ''}`;
    const res: Response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });
    return updateToken(res, setCsrf);
}

export async function deleteRole(id: string, csrf: string, setCsrf: SetCsrfFn): Promise<Response> {
    const doDelete = async (csrfToken: string) => {
        const res: Response = await fetch(`${API_ROLE}?id=${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                [CSRF_HEADER_NAME]: csrfToken,
            }
        });
        return res;
    };
    const res = await doDelete(csrf);
    if (res.status === 406) {
        return await doDelete(res.headers.get(CSRF_HEADER_NAME) || '');
    }
    return updateToken(res, setCsrf);
}
