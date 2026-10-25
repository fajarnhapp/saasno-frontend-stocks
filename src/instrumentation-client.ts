import { getWebInstrumentations, initializeFaro, type TransportItem } from '@grafana/faro-web-sdk';
import { API_FARO } from '@/utils/endpointUtils';
import { sanitizeItem } from '@/utils/faroUtils';

// Browser monitoring (Grafana Faro): JavaScript errors, page views and Core Web Vitals. Events go to our own /api/faro (same origin), which
// forwards them to Alloy, so the collector is never exposed to the internet and the Content-Security-Policy stays at connect-src 'self'.

try {
    initializeFaro({
        url: API_FARO,
        app: {
            name: 'saasno-frontend',
            environment: process.env.NODE_ENV,
        },
        // Console output is already in the server log, and per-resource timing creates dozens of log lines per page load; what is kept are
        // errors, Core Web Vitals, page/session events and Content-Security-Policy violations.
        instrumentations: getWebInstrumentations({ captureConsole: false, enablePerformanceInstrumentation: false }),
        // One request every 10 seconds at most, so a busy page cannot eat the per-IP rate limit of the login page.
        batching: { enabled: true, sendTimeout: 10000, itemLimit: 30 },
        beforeSend: (item: TransportItem) => sanitizeItem(item),
    });
} catch {
    // Monitoring must never break the application.
}
