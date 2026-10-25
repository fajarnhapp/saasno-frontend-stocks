import { timingSafeEqual } from 'crypto';
import { NextRequest } from 'next/server';
import { pushNewNotification } from '@/utils/notificationHub';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_USERS = 5000;
const LOOPBACK = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];

// Dipanggil server backend (bukan browser) setelah notifikasi tersimpan. Route ini publik di proxy.ts (backend tidak punya
// cookie sesi), jadi pengecekannya di sini: bila SAASNO_NOTIFICATION_PUSH_KEY diatur, header X-Push-Key harus sama (kunci yang
// sama dipasang di backend). Tanpa kunci, hanya panggilan dari mesin yang sama yang diterima, dan hanya di luar produksi,
// karena di balik reverse proxy semua permintaan tampak berasal dari mesin yang sama.
function allowed(req: NextRequest): boolean {
    const key = process.env.SAASNO_NOTIFICATION_PUSH_KEY;
    if (key) {
        const given = req.headers.get('x-push-key');
        if (!given) return false;
        const a = Buffer.from(given);
        const b = Buffer.from(key);
        return a.length === b.length && timingSafeEqual(a, b);
    }
    if (process.env.NODE_ENV === 'production') return false;
    // Route handler tidak punya alamat soket; tanpa reverse proxy, x-forwarded-for tidak ada dan panggilan lokal diterima.
    const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0].trim();
    return !forwarded || LOOPBACK.includes(forwarded);
}

export async function POST(req: NextRequest) {
    if (!allowed(req)) {
        return Response.json({ status: 'Error', message: 'Forbidden' }, { status: 403 });
    }
    const body: unknown = await req.json().catch(() => null);
    const userIds: unknown = (body as { userIds?: unknown } | null)?.userIds;
    if (!Array.isArray(userIds) || userIds.length === 0 || userIds.length > MAX_USERS || !userIds.every((id) => typeof id === 'string' && id)) {
        return Response.json({ status: 'Error', message: 'userIds must be a non-empty array of ids' }, { status: 400 });
    }
    // Yang tidak sedang tersambung tidak perlu dikabari: notifikasinya tetap tersimpan dan muncul saat daftar dimuat.
    return Response.json({ status: 'Success', delivered: pushNewNotification(userIds as string[]) });
}
