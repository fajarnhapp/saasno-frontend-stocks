import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DEFAULT_LANGUAGE, format, toLanguage, translate } from './languages.ts';

describe('toLanguage', () => {
    it('accepts the supported languages', () => {
        assert.equal(toLanguage('id'), 'id');
        assert.equal(toLanguage('en'), 'en');
    });
    it('falls back to the default for anything else', () => {
        assert.equal(toLanguage(undefined), DEFAULT_LANGUAGE);
        assert.equal(toLanguage('fr'), DEFAULT_LANGUAGE);
        assert.equal(toLanguage(''), DEFAULT_LANGUAGE);
    });
});

describe('format', () => {
    it('fills the names it has a value for', () => {
        assert.equal(format('{a} of {b}', { a: 1, b: 'x' }), '1 of x');
    });
    it('leaves unknown names visible', () => {
        assert.equal(format('Hi {name}', { other: 1 }), 'Hi {name}');
    });
    it('returns the text untouched without values', () => {
        assert.equal(format('Hi {name}'), 'Hi {name}');
    });
});

describe('translate', () => {
    const dictionary = { Save: 'Simpan', 'Showing {from} of {total}': 'Menampilkan {from} dari {total}' };
    it('returns the English text for English', () => {
        assert.equal(translate('en', dictionary, 'Save'), 'Save');
    });
    it('returns the translation for Indonesian', () => {
        assert.equal(translate('id', dictionary, 'Save'), 'Simpan');
    });
    it('shows the English text when there is no translation', () => {
        assert.equal(translate('id', dictionary, 'Unknown text'), 'Unknown text');
    });
    it('fills values after translating', () => {
        assert.equal(translate('id', dictionary, 'Showing {from} of {total}', { from: 1, total: 9 }), 'Menampilkan 1 dari 9');
    });
});
