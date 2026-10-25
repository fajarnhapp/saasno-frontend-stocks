import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isRecoveryCode, normalizeRecoveryCode, recoveryCodesToText } from './recoveryCodeUtils.ts';

describe('isRecoveryCode', () => {
    it('accepts codes with or without the dash, in any case', () => {
        assert.equal(isRecoveryCode('ABCDE-FGHJK'), true);
        assert.equal(isRecoveryCode('abcde-fghjk'), true);
        assert.equal(isRecoveryCode('ABCDEFGHJK'), true);
        assert.equal(isRecoveryCode(' abcde fghjk '.trim()), true);
    });

    it('does not take an authenticator code or junk for a recovery code', () => {
        assert.equal(isRecoveryCode('123456'), false);
        assert.equal(isRecoveryCode('ABCDE-FGHI'), false);
        assert.equal(isRecoveryCode('ABCDE-FGHIJ0'), false);
        assert.equal(isRecoveryCode(''), false);
        assert.equal(isRecoveryCode('OOOOO-IIIII'), false);
    });
});

describe('normalizeRecoveryCode', () => {
    it('formats what the user typed', () => {
        assert.equal(normalizeRecoveryCode('abcde fghjk'), 'ABCDE-FGHJK');
        assert.equal(normalizeRecoveryCode('abcdefghjk'), 'ABCDE-FGHJK');
        assert.equal(normalizeRecoveryCode(' abcde-fghjk '), 'ABCDE-FGHJK');
    });

    it('leaves incomplete input alone (only uppercased)', () => {
        assert.equal(normalizeRecoveryCode('abc'), 'ABC');
    });
});

describe('recoveryCodesToText', () => {
    it('lists the codes under a title', () => {
        const text = recoveryCodesToText(['AAAAA-BBBBB', 'CCCCC-DDDDD'], 'Acme');
        assert.match(text, /^Acme - two-step verification recovery codes/);
        assert.match(text, /AAAAA-BBBBB\nCCCCC-DDDDD/);
    });
});
