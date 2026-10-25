import test from 'node:test';
import assert from 'node:assert/strict';
import { withDefaultOrigin } from './originUtils.ts';

test('the default local origin is always in the list, even when the list is empty', () => {
    assert.deepEqual(withDefaultOrigin([]), ['http://localhost:3000']);
});

test('adds the database origins after it, without duplicates, empty entries or trailing slashes', () => {
    assert.deepEqual(
        withDefaultOrigin(['https://a.com/', 'http://localhost:3000', '', 'https://a.com']),
        ['http://localhost:3000', 'https://a.com'],
    );
});
