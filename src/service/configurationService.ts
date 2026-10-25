import { Configuration } from "@/type/configuration";
import { ConfigurationFilter } from "@/type/filter/ConfigurationFilter";
import { CSRF_HEADER_NAME, SetCsrfFn, updateToken } from "@/utils/csrfUtils";
import { toQuery } from "@/utils/queryUtils";

export async function readConfiguration(filter: ConfigurationFilter, setCsrf: SetCsrfFn): Promise<Response> {
    const params = toQuery(filter);
    const url = `/api/configuration?order=id&sorting=ASC${params.toString() ? `&${params}` : ''}`;
    const res: Response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });
    return updateToken(res, setCsrf);
}

export async function editConfiguration(body: Configuration, csrf: string, setCsrf: SetCsrfFn): Promise<Response> {
    const doEdit = async (csrfToken: string) => {
        const res: Response = await fetch('/api/configuration', {
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
