import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DEFAULT_APP_SETTING, sanitizeAppSetting, sanitizeMaintenance } from './appSettingUtils.ts';

describe('sanitizeAppSetting', () => {
    it('returns the defaults for nothing', () => {
        assert.deepEqual(sanitizeAppSetting(null), DEFAULT_APP_SETTING);
        assert.deepEqual(sanitizeAppSetting(undefined), DEFAULT_APP_SETTING);
        assert.deepEqual(sanitizeAppSetting({}), DEFAULT_APP_SETTING);
    });

    it('keeps good values', () => {
        assert.deepEqual(
            sanitizeAppSetting({ appName: ' Acme ', brandHue: 200, brandChroma: 0.8, hasLogo: true, logoVersion: 1700000000000 }),
            { appName: 'Acme', brandHue: 200, brandChroma: 0.8, hasLogo: true, logoVersion: 1700000000000, maintenance: { active: false, message: '', until: null } },
        );
    });

    it('repairs bad values instead of passing them on', () => {
        const result = sanitizeAppSetting({ appName: '   ', brandHue: 9999, brandChroma: -4, hasLogo: 'yes' as unknown as boolean, logoVersion: -1 });
        assert.equal(result.appName, 'Saasno');
        assert.equal(result.brandHue, 360);
        assert.equal(result.brandChroma, 0.3);
        assert.equal(result.hasLogo, false);
        assert.equal(result.logoVersion, 0);
    });

    it('cuts a very long name', () => {
        assert.equal(sanitizeAppSetting({ appName: 'x'.repeat(100) }).appName.length, 60);
    });
});

describe('sanitizeMaintenance', () => {
    it('is off unless the backend says it is active', () => {
        assert.equal(sanitizeMaintenance(null).active, false);
        assert.equal(sanitizeMaintenance({}).active, false);
        assert.equal(sanitizeMaintenance({ active: 'true' as unknown as boolean }).active, false);
        assert.equal(sanitizeMaintenance({ active: false, message: 'hidden' }).message, '');
    });

    it('keeps the message and a well formed end time', () => {
        assert.deepEqual(sanitizeMaintenance({ active: true, message: 'Back soon', until: '2026-10-23T18:00' }),
            { active: true, message: 'Back soon', until: '2026-10-23T18:00' });
    });

    it('drops an end time it cannot read and cuts a very long message', () => {
        assert.equal(sanitizeMaintenance({ active: true, message: 'm', until: 'tomorrow' }).until, null);
        assert.equal(sanitizeMaintenance({ active: true, message: 'x'.repeat(900), until: null }).message.length, 500);
    });

    it('is read as part of the app setting', () => {
        const result = sanitizeAppSetting({ maintenance: { active: true, message: 'm', until: null } });
        assert.equal(result.maintenance.active, true);
    });
});
