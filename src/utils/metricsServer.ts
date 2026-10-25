import http, { type Server } from 'node:http';
import { Counter, Registry, collectDefaultMetrics } from 'prom-client';

// Prometheus metrics of the Next.js server process (CPU, memory, event loop lag, GC) plus a counter of server-side errors. They are served on a
// separate port, like the backend does on 8081: it is not published to the host, so the application port (and nginx in front of it) never
// exposes them. Prometheus reads it over the shared Docker network (saasno-frontend:9464).
const DEFAULT_PORT = 9464;
const DEFAULT_ADDRESS = '127.0.0.1';

export const registry: Registry = new Registry();

const serverErrors: Counter<'route_type'> = new Counter({
    name: 'saasno_frontend_server_errors_total',
    help: 'Errors thrown while the Next.js server handled a request, by route type (render, route, action, middleware).',
    labelNames: ['route_type'],
    registers: [registry],
});

export function countServerError(routeType: string | undefined): void {
    serverErrors.inc({ route_type: routeType || 'unknown' });
}

let started: Server | null = null;

// The metrics endpoint must never be able to stop the application: every failure here is swallowed.
export function startMetricsServer(env: Record<string, string | undefined> = process.env): Server | null {
    if (started) {
        return started;
    }
    const port: number = env.SAASNO_FRONTEND_METRICS_PORT === undefined ? DEFAULT_PORT : Number(env.SAASNO_FRONTEND_METRICS_PORT);
    if (!Number.isInteger(port) || port < 0 || port > 65535) {
        return null;
    }
    // Port 0 asks the OS for a free port (tests); to switch the endpoint off, set SAASNO_FRONTEND_METRICS_PORT=off.
    const address: string = env.SAASNO_FRONTEND_METRICS_ADDRESS || DEFAULT_ADDRESS;

    collectDefaultMetrics({ register: registry });

    const server: Server = http.createServer(async (req, res) => {
        if (req.method === 'GET' && req.url === '/metrics') {
            try {
                res.writeHead(200, { 'Content-Type': registry.contentType });
                res.end(await registry.metrics());
            } catch {
                res.writeHead(500).end();
            }
            return;
        }
        res.writeHead(404).end();
    });
    server.on('error', (error: Error) => {
        // Typically EADDRINUSE (a second server instance in development): metrics are optional.
        process.stderr.write(`metrics server not started: ${error.message}\n`);
        started = null;
    });
    // Do not keep the process alive just for the metrics endpoint.
    server.unref();
    server.listen(port, address);
    started = server;
    return server;
}
