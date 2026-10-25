import { Menu } from "@/type/menu";
import { MenuFilter } from "@/type/filter/MenuFilter";
import { CSRF_HEADER_NAME, SetCsrfFn, updateToken } from "@/utils/csrfUtils";
import { toQuery } from "@/utils/queryUtils";

export async function createMenu(body: Menu, csrf: string, setCsrf: SetCsrfFn): Promise<Response> {
    const doCreate = async (csrfToken: string) => {
        const res: Response = await fetch('/api/menu', {
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

export async function editMenu(body: Menu, csrf: string, setCsrf: SetCsrfFn): Promise<Response> {
    const doEdit = async (csrfToken: string) => {
        const res: Response = await fetch('/api/menu', {
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

export async function readMenu(filter: MenuFilter, setCsrf: SetCsrfFn): Promise<Response> {
    const params = toQuery(filter);
    const url = `/api/menu?order=registered${params.toString() ? `&${params}` : ''}`;
    const res: Response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });
    return updateToken(res, setCsrf);
}

export async function deleteMenu(id: string, csrf: string, setCsrf: SetCsrfFn): Promise<Response> {
    const doDelete = async (csrfToken: string) => {
        const res: Response = await fetch(`/api/menu?id=${id}`, {
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
