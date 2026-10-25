'use client';

import Link from 'next/link';
import { Wrench } from 'lucide-react';
import { useAppSetting } from '@/context/AppSettingContext';
import { formatUntil } from '@/utils/maintenanceUtils';

// Shown to the people who can still work during maintenance, so nobody forgets it is on.
export default function MaintenanceBanner() {
    const { maintenance } = useAppSetting();
    if (!maintenance.active) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-amber-50 px-4 py-2 text-sm text-amber-800 border-b border-amber-200">
            <Wrench size={15} className="shrink-0" />
            <span className="font-semibold">Maintenance mode is ON.</span>
            <span>
                Other users cannot use the app{maintenance.until ? <> until about <strong>{formatUntil(maintenance.until)}</strong></> : null}.
            </span>
            <Link href="/system/maintenance" className="ml-auto font-semibold underline hover:text-amber-900">Manage</Link>
        </div>
    );
}
