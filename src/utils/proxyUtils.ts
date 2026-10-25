import { SESSION_ID } from '@/proxy';
import { ApiHandler, csrfFilter, csrfResponse } from '@/utils/csrfUtils';
import { BACKEND_URL } from '@/utils/endpointUtils';
import { NextRequest } from 'next/server';

const authorization = (req: NextRequest): string => `Bearer ${req.cookies.get(SESSION_ID)?.value || ''}`;

// Route handler yang hanya meneruskan GET (beserta query string) ke backend; izin dan cakupan dicek di backend.
export const forwardGet = (path: string): ApiHandler => csrfResponse(
    async (req: NextRequest): Promise<Response> => fetch(`${BACKEND_URL + path}${req.nextUrl.search || ''}`, {
        method: 'GET',
        headers: { Authorization: authorization(req) },
        cache: 'no-store',
    })
);

// Meneruskan POST/PUT dengan badan JSON (dengan pemeriksaan CSRF).
export const forwardJson = (method: 'POST' | 'PUT', path: string): ApiHandler => csrfResponse(
    csrfFilter(async (req: NextRequest): Promise<Response> => fetch(BACKEND_URL + path, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: authorization(req) },
        body: JSON.stringify(await req.json()),
    }))
);

// Meneruskan DELETE dengan parameter di query string (dengan pemeriksaan CSRF).
export const forwardDelete = (path: string): ApiHandler => csrfResponse(
    csrfFilter(async (req: NextRequest): Promise<Response> => fetch(`${BACKEND_URL + path}${req.nextUrl.search || ''}`, {
        method: 'DELETE',
        headers: { Authorization: authorization(req) },
    }))
);


// Meneruskan PUT tanpa badan (aksi saja, parameter di query string), dengan pemeriksaan CSRF.
export const forwardPut = (path: string): ApiHandler => csrfResponse(
    csrfFilter(async (req: NextRequest): Promise<Response> => fetch(`${BACKEND_URL + path}${req.nextUrl.search || ''}`, {
        method: 'PUT',
        headers: { Authorization: authorization(req) },
    }))
);

// Meneruskan POST tanpa badan (aksi saja), dengan pemeriksaan CSRF.
export const forwardPost = (path: string): ApiHandler => csrfResponse(
    csrfFilter(async (req: NextRequest): Promise<Response> => fetch(`${BACKEND_URL + path}${req.nextUrl.search || ''}`, {
        method: 'POST',
        headers: { Authorization: authorization(req) },
    }))
);

// Meneruskan unggahan file (multipart) ke backend. Hanya field "file" yang diteruskan; jenis dan isi file diperiksa lagi di backend.
export const forwardUpload = (path: string): ApiHandler => csrfResponse(
    csrfFilter(async (req: NextRequest): Promise<Response> => {
        const incoming: FormData = await req.formData();
        const file: FormDataEntryValue | null = incoming.get('file');
        if (!(file instanceof File)) {
            return Response.json({ message: 'Choose a picture first' }, { status: 400 });
        }
        const outgoing: FormData = new FormData();
        outgoing.append('file', file, file.name);
        return fetch(BACKEND_URL + path, {
            method: 'POST',
            headers: { Authorization: authorization(req) },
            body: outgoing,
        });
    })
);
