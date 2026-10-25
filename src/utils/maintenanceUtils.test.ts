import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatUntil, toDatetimeLocal, toggleRole, upcomingOrEmpty, withSuper } from './maintenanceUtils.ts';

describe('formatUntil', () => {
    it('formats the end time for people', () => {
        assert.equal(formatUntil('2026-10-23T18:00'), '23 Oct 2026, 18:00');
        assert.equal(formatUntil('2027-01-05T07:05'), '5 Jan 2027, 07:05');
    });

    it('shows other values as they are, and nothing for nothing', () => {
        assert.equal(formatUntil('soon'), 'soon');
        assert.equal(formatUntil(null), '');
        assert.equal(formatUntil(undefined), '');
        assert.equal(formatUntil('2026-13-01T10:00'), '2026-13-01T10:00');
    });
});

describe('toDatetimeLocal', () => {
    it('gives the format a datetime-local input expects', () => {
        assert.equal(toDatetimeLocal(new Date(2026, 9, 23, 8, 5)), '2026-10-23T08:05');
    });
});

describe('roles', () => {
    it('always puts SUPER first and never twice', () => {
        assert.deepEqual(withSuper([]), ['SUPER']);
        assert.deepEqual(withSuper(['MANAJER', 'SUPER']), ['SUPER', 'MANAJER']);
    });

    it('adds and removes a role, but SUPER stays', () => {
        assert.deepEqual(toggleRole(['SUPER'], 'MANAJER'), ['SUPER', 'MANAJER']);
        assert.deepEqual(toggleRole(['SUPER', 'MANAJER'], 'MANAJER'), ['SUPER']);
        assert.deepEqual(toggleRole(['SUPER', 'MANAJER'], 'SUPER'), ['SUPER', 'MANAJER']);
    });
});

describe('upcomingOrEmpty', () => {
    it('keeps an end time that is still ahead', () => {
        assert.equal(upcomingOrEmpty('2026-10-23T18:00', '2026-10-23T10:00'), '2026-10-23T18:00');
    });

    it('drops one that has passed, is now, or is missing or unreadable', () => {
        assert.equal(upcomingOrEmpty('2026-10-23T09:00', '2026-10-23T10:00'), '');
        assert.equal(upcomingOrEmpty('2026-10-23T10:00', '2026-10-23T10:00'), '');
        assert.equal(upcomingOrEmpty(null, '2026-10-23T10:00'), '');
        assert.equal(upcomingOrEmpty('soon', '2026-10-23T10:00'), '');
    });
});
