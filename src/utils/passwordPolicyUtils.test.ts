import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { describePasswordPolicy, MAX_PASSWORD_LENGTH, validatePassword } from './passwordPolicyUtils.ts';

describe('validatePassword', () => {
    const policy = { minLength: 8, requireComplexity: true };

    it('rejects a password that is too short', () => {
        assert.match(validatePassword('Ab1', policy) ?? '', /at least 8/);
    });

    it('rejects a password that is too long', () => {
        assert.match(validatePassword('Aa1'.repeat(MAX_PASSWORD_LENGTH), policy) ?? '', /at most/);
    });

    it('requires upper case, lower case and a digit when complexity is on', () => {
        assert.ok(validatePassword('alllowercase1', policy));
        assert.ok(validatePassword('ALLUPPERCASE1', policy));
        assert.ok(validatePassword('NoDigitsHere', policy));
        assert.equal(validatePassword('Valid1Password', policy), null);
    });

    it('only checks length when complexity is off', () => {
        const relaxed = { minLength: 6, requireComplexity: false };
        assert.equal(validatePassword('simple', relaxed), null);
        assert.ok(validatePassword('short', relaxed));
    });

    it('falls back to the default policy', () => {
        assert.ok(validatePassword('short1A'));
        assert.equal(validatePassword('LongEnough1'), null);
    });
});

describe('describePasswordPolicy', () => {
    it('mentions complexity only when required', () => {
        assert.match(describePasswordPolicy({ minLength: 10, requireComplexity: true }), /10 characters.*digit/);
        assert.equal(describePasswordPolicy({ minLength: 10, requireComplexity: false }), 'At least 10 characters');
    });
});
