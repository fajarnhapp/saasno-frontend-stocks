import { NextRequest } from 'next/server';
import { SESSION_ID } from '@/proxy';
import { API_USER_ME, BACKEND_URL } from '@/utils/endpointUtils';
import { addNotificationClient } from '@/utils/notificationHub';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const HEARTBEAT_MS = 25_000;

// Aliran SSE untuk satu user yang login: sinyal "new-notification" saat ada notifikasi baru untuknya.
// Identitas diambil dari backend dengan sesi di cookie, supaya sinyal hanya sampai ke pemiliknya.
export async function GET(req: NextRequest) {
    const sessionId = req.cookies.get(SESSION_ID)?.value || '';
    if (!sessionId) {
        return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }
    let userId: string | undefined;
    try {
        const response = await fetch(BACKEND_URL + API_USER_ME, { headers: { Authorization: `Bearer ${sessionId}` }, cache: 'no-store' });
        const body = await response.json();
        userId = response.ok ? body?.data?.id : undefined;
    } catch {
        userId = undefined;
    }
    if (!userId) {
        return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const encoder = new TextEncoder();
    let cleanup: () => void = () => { };
    const stream = new ReadableStream<Uint8Array>({
        start(controller) {
            const send = (chunk: string): void => {
                try {
                    controller.enqueue(encoder.encode(chunk));
                } catch {
                    cleanup();
                }
            };
            const remove = addNotificationClient(userId, { send });
            // Komentar berkala menjaga koneksi tetap hidup melewati proxy/load balancer yang memutus koneksi diam.
            const timer = setInterval(() => send(': ping\n\n'), HEARTBEAT_MS);
            cleanup = () => {
                clearInterval(timer);
                remove();
                try {
                    controller.close();
                } catch { /* sudah tertutup */ }
            };
            req.signal.addEventListener('abort', cleanup);
            send('retry: 3000\n: connected\n\n');
        },
        cancel() {
            cleanup();
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            // no-transform: mencegah kompresi yang menahan data; X-Accel-Buffering: nginx tidak menampung respons.
            'Cache-Control': 'no-cache, no-transform',
            'X-Accel-Buffering': 'no',
            // Sudah "berkode" identity: server Next.js tidak menggzip (dan menahan) aliran ini.
            'Content-Encoding': 'identity',
            Connection: 'keep-alive',
        },
    });
}
