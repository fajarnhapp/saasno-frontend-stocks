import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MAX_IMAGE_BYTES, validateImageFile } from './imageUploadUtils.ts';

describe('validateImageFile', () => {
    it('accepts PNG and JPEG within the size limit', () => {
        assert.equal(validateImageFile({ size: 1000, type: 'image/png' }), null);
        assert.equal(validateImageFile({ size: MAX_IMAGE_BYTES, type: 'image/jpeg' }), null);
    });

    it('rejects other types, including SVG', () => {
        assert.match(validateImageFile({ size: 1000, type: 'image/svg+xml' }) ?? '', /PNG and JPEG/);
        assert.match(validateImageFile({ size: 1000, type: 'application/pdf' }) ?? '', /PNG and JPEG/);
        assert.match(validateImageFile({ size: 1000, type: '' }) ?? '', /PNG and JPEG/);
    });

    it('rejects empty and oversized files', () => {
        assert.match(validateImageFile({ size: 0, type: 'image/png' }) ?? '', /empty/);
        assert.match(validateImageFile({ size: MAX_IMAGE_BYTES + 1, type: 'image/png' }) ?? '', /too large/);
    });

    it('asks for a file when there is none', () => {
        assert.match(validateImageFile(null) ?? '', /Choose/);
        assert.match(validateImageFile(undefined) ?? '', /Choose/);
    });
});
