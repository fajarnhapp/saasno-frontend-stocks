import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pathOnly, sanitizeItem, scrubString } from './faroUtils.ts';

test('redacts one-time tokens in query strings', () => {
    assert.equal(scrubString('GET /reset-password?token=abc123&x=1 failed'), 'GET /reset-password?token=[REDACTED]&x=1 failed');
    assert.equal(scrubString('https://a.b/p?otp=123456'), 'https://a.b/p?otp=[REDACTED]');
    assert.equal(scrubString('#access_token=secretvalue'), '#access_token=[REDACTED]');
    assert.equal(scrubString('/cb?id_token=a.b.c&api_key=k1'), '/cb?id_token=[REDACTED]&api_key=[REDACTED]');
});

test('leaves ordinary text and unrelated parameters alone', () => {
    assert.equal(scrubString('Cannot read properties of undefined'), 'Cannot read properties of undefined');
    assert.equal(scrubString('/users?page=2&limit=10'), '/users?page=2&limit=10');
});

test('reduces a page URL to origin and path', () => {
    assert.equal(pathOnly('https://app.example.com/reset-password?token=abc#top'), 'https://app.example.com/reset-password');
    assert.equal(pathOnly('/login?message=x'), '/login');
});

test('sanitizes payload and page url of a transport item without changing its type', () => {
    const item = {
        type: 'exception',
        payload: { type: 'Error', value: 'failed to load /reset-password?token=abc', stacktrace: { frames: [{ filename: 'https://a.b/x.js?code=zzz' }] } },
        meta: { page: { url: 'https://a.b/reset-password?token=abc' }, session: { id: 's1' } },
    };
    const clean = sanitizeItem(item);
    assert.equal(clean.type, 'exception');
    assert.equal(clean.meta?.page?.url, 'https://a.b/reset-password');
    assert.equal(clean.meta?.session && (clean.meta.session as { id: string }).id, 's1');
    assert.ok(!JSON.stringify(clean).includes('abc'), 'token must not survive');
    assert.ok(!JSON.stringify(clean).includes('zzz'), 'code must not survive');
    assert.ok(item.meta.page.url.includes('token=abc'), 'input is not mutated');
});
