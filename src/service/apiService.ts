import { Api } from "@/type/api";
import { ApiFilter } from "@/type/filter/ApiFiter";
import { CSRF_HEADER_NAME, SetCsrfFn, updateToken } from "@/utils/csrfUtils";
import { toQuery } from "@/utils/queryUtils";
export async function createApi(body: Api, csrf: string, setCsrf: SetCsrfFn): Promise<Response> {
    const doCreate = async (csrfToken: string) => {
        const res: Response = await fetch('/api/api', {
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

export async function editApi(body: Api, csrf: string, setCsrf: SetCsrfFn): Promise<Response> {
    const doEdit = async (csrfToken: string) => {
        const res: Response = await fetch('/api/api', {
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

export async function readApi(filter: ApiFilter, setCsrf: SetCsrfFn): Promise<Response> {
    const params = toQuery(filter);
    const url = `/api/api?order=registered${params.toString() ? `&${params}` : ''}`;
    const res = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });
    return updateToken(res, setCsrf);
}

export async function deleteApi(id: string, csrf: string, setCsrf: SetCsrfFn): Promise<Response> {
    const doDelete = async (csrfToken: string) => {
        const res: Response = await fetch(`/api/api?id=${id}`, {
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
