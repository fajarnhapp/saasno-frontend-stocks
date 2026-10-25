'use client';

import { useEffect, useRef } from 'react';

const STREAM_URL = '/api/service/events';

// Berlangganan sinyal "ada notifikasi baru" lewat SSE. EventSource menyambung ulang sendiri bila putus.
// Callback disimpan di ref supaya koneksi tidak dibuat ulang setiap callback berubah.
export function useNotificationStream(onNewNotification: () => void): void {
    const handler = useRef(onNewNotification);
    useEffect((): void => {
        handler.current = onNewNotification;
    }, [onNewNotification]);

    useEffect((): (() => void) => {
        const source = new EventSource(STREAM_URL);
        const listener = (): void => handler.current();
        source.addEventListener('new-notification', listener);
        return () => {
            source.removeEventListener('new-notification', listener);
            source.close();
        };
    }, []);
}
