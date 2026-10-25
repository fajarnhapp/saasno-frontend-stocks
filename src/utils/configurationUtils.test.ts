import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { canBeEmpty, configGroup, filterConfigurations, formatConfigKey, isSecretKey } from './configurationUtils.ts';

const rows = [
    { id: 'FRONTEND_URL', value: 'https://app.example.com' },
    { id: 'PASSWORD_MIN_LENGTH', value: '8' },
    { id: 'MAX_LOGIN_ATTEMPTS', value: '5' },
    { id: 'MAINTENANCE_MODE', value: 'false' },
    { id: 'MAINTENANCE_MESSAGE', value: '' },
    { id: 'APP_NAME', value: 'Saasno' },
    { id: 'BRAND_HUE', value: '293' },
    { id: 'DOWNLOAD_RETENTION_DAYS', value: '7' },
    { id: 'LOGIN_IP_ALLOWLIST', value: '10.0.0.0/8' },
];

const ids = (list: { id?: string }[]): string[] => list.map((row) => row.id ?? '');

describe('formatConfigKey', () => {
    it('makes a readable name', () => {
        assert.equal(formatConfigKey('FRONTEND_URL'), 'Frontend URL');
        assert.equal(formatConfigKey('PASSWORD_MIN_LENGTH'), 'Password Min Length');
    });
});

describe('configGroup', () => {
    it('puts every setting in a group', () => {
        assert.equal(configGroup('PASSWORD_MIN_LENGTH'), 'security');
        assert.equal(configGroup('MAX_LOGIN_ATTEMPTS'), 'security');
        assert.equal(configGroup('LOGIN_IP_ALLOWLIST'), 'security');
        assert.equal(configGroup('MAINTENANCE_MODE'), 'maintenance');
        assert.equal(configGroup('APP_NAME'), 'appearance');
        assert.equal(configGroup('BRAND_HUE'), 'appearance');
        assert.equal(configGroup('DOWNLOAD_RETENTION_DAYS'), 'retention');
        assert.equal(configGroup('NOTIFICATION_RETENTION_DAYS'), 'retention');
        assert.equal(configGroup('FRONTEND_URL'), 'general');
        assert.equal(configGroup(''), 'general');
    });
});

describe('filterConfigurations', () => {
    it('keeps everything for an empty query', () => {
        assert.equal(filterConfigurations(rows, '').length, rows.length);
        assert.equal(filterConfigurations(rows, '   ').length, rows.length);
    });

    it('matches the key, the readable name and the value, in any case', () => {
        assert.deepEqual(ids(filterConfigurations(rows, 'frontend')), ['FRONTEND_URL']);
        assert.deepEqual(ids(filterConfigurations(rows, 'min length')), ['PASSWORD_MIN_LENGTH']);
        assert.deepEqual(ids(filterConfigurations(rows, 'saasno')), ['APP_NAME']);
        assert.deepEqual(ids(filterConfigurations(rows, 'EXAMPLE.com')), ['FRONTEND_URL']);
        assert.deepEqual(ids(filterConfigurations(rows, 'password_min')), ['PASSWORD_MIN_LENGTH']);
    });

    it('needs every word, in any order', () => {
        assert.deepEqual(ids(filterConfigurations(rows, 'login attempts')), ['MAX_LOGIN_ATTEMPTS']);
        assert.deepEqual(ids(filterConfigurations(rows, 'attempts login')), ['MAX_LOGIN_ATTEMPTS']);
        assert.deepEqual(filterConfigurations(rows, 'login nonsense'), []);
    });

    it('filters by group, alone or with a query', () => {
        assert.deepEqual(ids(filterConfigurations(rows, '', 'maintenance')), ['MAINTENANCE_MODE', 'MAINTENANCE_MESSAGE']);
        assert.deepEqual(ids(filterConfigurations(rows, 'login', 'security')), ['MAX_LOGIN_ATTEMPTS', 'LOGIN_IP_ALLOWLIST']);
        assert.deepEqual(filterConfigurations(rows, 'frontend', 'security'), []);
        assert.equal(filterConfigurations(rows, '', 'all').length, rows.length);
    });

    it('copes with rows that have no value or no id', () => {
        assert.deepEqual(ids(filterConfigurations([{ id: 'X' }, {}], 'x')), ['X']);
    });
});

describe('mail settings', () => {
    it('groups the eight MAIL_ settings under Email', () => {
        for (const key of ['MAIL_HOST', 'MAIL_PORT', 'MAIL_USERNAME', 'MAIL_PASSWORD', 'MAIL_AUTH', 'MAIL_STARTTLS', 'MAIL_FROM', 'MAIL_FROM_NAME']) {
            assert.equal(configGroup(key), 'mail');
        }
        assert.equal(formatConfigKey('MAIL_HOST'), 'Mail Host');
    });

    it('treats only the password as a secret', () => {
        assert.equal(isSecretKey('MAIL_PASSWORD'), true);
        assert.equal(isSecretKey('MAIL_USERNAME'), false);
        assert.equal(isSecretKey('PASSWORD_MIN_LENGTH'), false);
    });

    it('knows which settings may be left empty', () => {
        assert.equal(canBeEmpty('MAIL_HOST'), true);
        assert.equal(canBeEmpty('MAIL_USERNAME'), true);
        assert.equal(canBeEmpty('MAIL_FROM_NAME'), true);
        assert.equal(canBeEmpty('MAIL_PORT'), false);
        assert.equal(canBeEmpty('MAIL_FROM'), false);
        assert.equal(canBeEmpty('FRONTEND_URL'), false);
        assert.equal(canBeEmpty('LOGIN_IP_ALLOWLIST'), true);
    });

    it('finds the mail settings with the Email group filter', () => {
        const all = [{ id: 'MAIL_HOST', value: 'smtp.example.com' }, { id: 'MAIL_PASSWORD', value: '********' }, { id: 'APP_NAME', value: 'Saasno' }];
        assert.deepEqual(filterConfigurations(all, '', 'mail').map((row) => row.id), ['MAIL_HOST', 'MAIL_PASSWORD']);
    });
});
