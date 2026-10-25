import { DownloadFormat } from "@/type/download";
import { CSRF_HEADER_NAME, SetCsrfFn, updateToken } from "@/utils/csrfUtils";
import { API_DOWNLOAD, API_DOWNLOAD_ALL, API_DOWNLOAD_FILE } from "@/utils/endpointUtils";
import { jsonRequest, requestWithCsrf } from "@/utils/requestUtils";

export function downloadFileUrl(id: string): string {
    return `${API_DOWNLOAD_FILE}?id=${id}`;
}

export async function readDownloadJobs(setCsrf: SetCsrfFn): Promise<Response> {
    const res: Response = await fetch(API_DOWNLOAD, {
        method: 'GET',
        credentials: 'include'
    });
    return updateToken(res, setCsrf);
}

export async function createDownloadJob(
    type: string,
    format: DownloadFormat,
    filter: Record<string, string> | undefined,
    csrf: string,
    setCsrf: SetCsrfFn,
): Promise<Response> {
    const doCreate = async (csrfToken: string) => {
        return await fetch(API_DOWNLOAD, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                [CSRF_HEADER_NAME]: csrfToken,
            },
            body: JSON.stringify({ type, format, filter }),
        });
    };

    let res = await doCreate(csrf);

    if (res.status === 406) {
        const retryToken = res.headers.get(CSRF_HEADER_NAME) || '';
        res = await doCreate(retryToken);
    }

    return updateToken(res, setCsrf);
}

export async function deleteDownloadJob(id: string, csrf: string, setCsrf: SetCsrfFn): Promise<Response> {
    const doDelete = async (csrfToken: string) => {
        return await fetch(`${API_DOWNLOAD}?id=${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                [CSRF_HEADER_NAME]: csrfToken,
            }
        });
    };

    let res = await doDelete(csrf);

    if (res.status === 406) {
        const retryToken = res.headers.get(CSRF_HEADER_NAME) || '';
        res = await doDelete(retryToken);
    }

    return updateToken(res, setCsrf);
}

// Clears the whole list of the signed-in user (rows and files).
export const deleteAllDownloadJobs = (csrf: string, setCsrf: SetCsrfFn): Promise<Response> =>
    requestWithCsrf(jsonRequest(API_DOWNLOAD_ALL, 'DELETE'), csrf, setCsrf);
