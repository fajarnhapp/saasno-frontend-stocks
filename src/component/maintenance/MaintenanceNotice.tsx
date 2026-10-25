'use client';

import { useEffect, useState } from 'react';
import { Clock, Loader2, Wrench } from 'lucide-react';
import AuthCard from '../password/AuthCard';
import { useAppSetting } from '@/context/AppSettingContext';
import { MaintenanceStatus } from '@/type/app-setting';
import { sanitizeMaintenance } from '@/utils/appSettingUtils';
import { API_MAINTENANCE_STATUS, PAGE_LOGIN } from '@/utils/endpointUtils';
import { formatUntil } from '@/utils/maintenanceUtils';

const POLL_MS = 20_000;

// What everyone else sees while maintenance mode is on. It asks the server every 20 seconds and, as soon as maintenance is over, sends
// the visitor to the login page (or straight into the app if the session is still there), so nobody has to refresh.
export default function MaintenanceNotice() {
    const { maintenance: initial } = useAppSetting();
    const [status, setStatus] = useState<MaintenanceStatus>(initial);
    const [finished, setFinished] = useState<boolean>(!initial.active);

    useEffect(() => {
        const check = async () => {
            try {
                const res: Response = await fetch(API_MAINTENANCE_STATUS, { cache: 'no-store' });
                const body: { data?: Partial<MaintenanceStatus> } = await res.json();
                const next: MaintenanceStatus = sanitizeMaintenance(body.data);
                setStatus(next);
                if (!next.active) {
                    setFinished(true);
                }
            } catch {
                // The server may be restarting as part of the maintenance; try again at the next tick.
            }
        };
        const timer = setInterval(check, POLL_MS);
        check();
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (finished) {
            // A full navigation: the page must be loaded again from the server, not from a cache.
            window.location.replace(PAGE_LOGIN);
        }
    }, [finished]);

    if (finished) {
        return (
            <AuthCard icon={<Loader2 size={28} className="animate-spin" />} title="We are back" subtitle="Maintenance is finished. Taking you to the login page...">
                <></>
            </AuthCard>
        );
    }

    return (
        <AuthCard
            icon={<Wrench size={28} />}
            title="Under maintenance"
            subtitle={status.message || 'The system is under maintenance. Please try again later.'}
        >
            {status.until && (
                <div className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    <Clock size={16} className="text-brand-600" />
                    Expected to be back around <strong>{formatUntil(status.until)}</strong>
                </div>
            )}
            <p className="text-center text-xs text-gray-400">This page checks again by itself, there is no need to refresh.</p>
        </AuthCard>
    );
}
