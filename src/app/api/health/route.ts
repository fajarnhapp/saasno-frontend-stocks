import { API_BACKEND_PUBLIC, BACKEND_URL } from '@/utils/endpointUtils';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 200 when the frontend and the backend (with its own dependencies) are up, 503 otherwise. Only UP/DOWN is reported.
export async function GET(): Promise<NextResponse> {
    let backend: { status?: string; version?: string; components?: Record<string, string> } = { status: 'DOWN' };
    try {
        const res: Response = await fetch(`${BACKEND_URL + API_BACKEND_PUBLIC}/health`, {
            cache: 'no-store',
            signal: AbortSignal.timeout(3000),
        });
        backend = await res.json();
    } catch {
        backend = { status: 'DOWN' };
    }

    const up: boolean = backend.status === 'UP';
    return NextResponse.json(
        { status: up ? 'UP' : 'DOWN', backend },
        { status: up ? 200 : 503, headers: { 'Cache-Control': 'no-store' } }
    );
}
