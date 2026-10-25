import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { countServerError, startMetricsServer } from './metricsServer.ts';

let server: ReturnType<typeof startMetricsServer> = null;

test('stays off for a port that is not a number (SAASNO_FRONTEND_METRICS_PORT=off)', () => {
    assert.equal(startMetricsServer({ SAASNO_FRONTEND_METRICS_PORT: 'off' }), null);
    assert.equal(startMetricsServer({ SAASNO_FRONTEND_METRICS_PORT: '70000' }), null);
});

test('starts on the requested port and address', () => {
    server = startMetricsServer({ SAASNO_FRONTEND_METRICS_PORT: '0', SAASNO_FRONTEND_METRICS_ADDRESS: '127.0.0.1' });
    assert.ok(server);
});
after(() => server?.close());

async function ready(): Promise<string> {
    const running = server;
    assert.ok(running, 'server must start');
    if (!running.listening) {
        await new Promise<void>((resolve) => running.once('listening', () => resolve()));
    }
    return `http://127.0.0.1:${(running.address() as AddressInfo).port}`;
}

test('serves process metrics on GET /metrics', async () => {
    const res = await fetch(`${await ready()}/metrics`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type') ?? '', /text\/plain/);
    const body = await res.text();
    assert.match(body, /^process_cpu_user_seconds_total /m);
    assert.match(body, /^nodejs_eventloop_lag_seconds /m);
    assert.match(body, /^nodejs_heap_size_used_bytes /m);
});

test('counts server errors by route type', async () => {
    countServerError('render');
    countServerError('render');
    countServerError(undefined);
    const body = await (await fetch(`${await ready()}/metrics`)).text();
    assert.match(body, /^saasno_frontend_server_errors_total\{route_type="render"\} 2$/m);
    assert.match(body, /^saasno_frontend_server_errors_total\{route_type="unknown"\} 1$/m);
});

test('answers 404 to everything else', async () => {
    const base = await ready();
    assert.equal((await fetch(`${base}/`)).status, 404);
    assert.equal((await fetch(`${base}/metrics`, { method: 'POST' })).status, 404);
    assert.equal((await fetch(`${base}/actuator/env`)).status, 404);
});

test('does not start a second server', () => {
    assert.equal(startMetricsServer({ SAASNO_FRONTEND_METRICS_PORT: '0' }), server);
});
