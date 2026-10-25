import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatBytes } from './byteUtils.ts';

describe('formatBytes', () => {
    it('formats sizes with the right unit', () => {
        assert.equal(formatBytes(0), '0 B');
        assert.equal(formatBytes(512), '512 B');
        assert.equal(formatBytes(1024), '1.0 KB');
        assert.equal(formatBytes(1536), '1.5 KB');
        assert.equal(formatBytes(10 * 1024), '10 KB');
        assert.equal(formatBytes(3.2 * 1024 * 1024), '3.2 MB');
        assert.equal(formatBytes(5 * 1024 ** 3), '5.0 GB');
    });

    it('treats anything that is not a positive number as 0 B', () => {
        assert.equal(formatBytes(-5), '0 B');
        assert.equal(formatBytes(NaN), '0 B');
        assert.equal(formatBytes(Infinity), '0 B');
    });
});
