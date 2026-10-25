import { API_BACKEND_PUBLIC, BACKEND_URL } from '@/utils/endpointUtils';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// The privacy policy text; anyone may read it, so there is no session check.
// The body is read and sent again (not the backend response itself): fetch has already unzipped it, and its headers would still say it is zipped.
export async function GET(req: NextRequest): Promise<Response> {
    const language: string = req.nextUrl.searchParams.get('lang') === 'id' ? 'id' : 'en';
    try {
        const res: Response = await fetch(`${BACKEND_URL + API_BACKEND_PUBLIC}/privacy?lang=${language}`, { cache: 'no-store' });
        return NextResponse.json(await res.json(), { status: res.status });
    } catch {
        return NextResponse.json({ message: 'The policy could not be loaded' }, { status: 502 });
    }
}
