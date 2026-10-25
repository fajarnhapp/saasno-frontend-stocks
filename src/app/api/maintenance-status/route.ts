import { NextResponse } from 'next/server';
import { sanitizeAppSetting } from '@/utils/appSettingUtils';
import { getAppSetting } from '@/utils/appSettingServer';

export const dynamic = 'force-dynamic';

// Whether maintenance is on, for the maintenance page to poll while people wait. No session needed. If the backend cannot be reached
// the answer is "not active", so waiting people are sent to the login page, which then shows the real situation.
export async function GET(): Promise<NextResponse> {
    const setting = sanitizeAppSetting(await getAppSetting());
    return NextResponse.json({ data: setting.maintenance }, { headers: { 'Cache-Control': 'no-store' } });
}
