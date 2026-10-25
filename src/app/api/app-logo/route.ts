import { API_BACKEND_PUBLIC, BACKEND_URL } from '@/utils/endpointUtils';

export const dynamic = 'force-dynamic';

// The logo is shown on the login page, so this route needs no session.
export async function GET(): Promise<Response> {
    try {
        const res: Response = await fetch(`${BACKEND_URL + API_BACKEND_PUBLIC}/app-logo`, { cache: 'no-store' });
        if (!res.ok) {
            return new Response(null, { status: 404 });
        }
        return new Response(res.body, {
            status: 200,
            headers: { 'Content-Type': 'image/png', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'public, max-age=3600' },
        });
    } catch {
        return new Response(null, { status: 404 });
    }
}
