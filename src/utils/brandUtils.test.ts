import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { brandCssVariables, brandSwatch, clampChroma, clampHue, DEFAULT_BRAND_CHROMA, DEFAULT_BRAND_HUE } from './brandUtils.ts';

describe('clampHue / clampChroma', () => {
    it('keeps values inside the allowed range', () => {
        assert.equal(clampHue(-20), 0);
        assert.equal(clampHue(999), 360);
        assert.equal(clampHue('200.4'), 200);
        assert.equal(clampChroma(0), 0.3);
        assert.equal(clampChroma(5), 1.2);
        assert.equal(clampChroma('0.654'), 0.65);
    });

    it('falls back to the defaults for anything that is not a number', () => {
        assert.equal(clampHue('abc'), DEFAULT_BRAND_HUE);
        assert.equal(clampHue(undefined), DEFAULT_BRAND_HUE);
        assert.equal(clampChroma(NaN), DEFAULT_BRAND_CHROMA);
        assert.equal(clampChroma(null), DEFAULT_BRAND_CHROMA);
    });
});

describe('brandCssVariables', () => {
    it('returns the two variables as strings', () => {
        assert.deepEqual(brandCssVariables(200, 0.8), { '--brand-hue': '200', '--brand-chroma': '0.8' });
    });

    it('never lets an unsafe value reach the stylesheet', () => {
        assert.deepEqual(brandCssVariables('1;} body{display:none', 'red'), { '--brand-hue': '1', '--brand-chroma': '1' });
    });
});

describe('brandSwatch', () => {
    it('uses the brand-600 formula', () => {
        assert.equal(brandSwatch(293, 1), 'oklch(54.1% 0.281 293)');
        assert.equal(brandSwatch(150, 0.5), 'oklch(54.1% 0.141 150)');
    });
});
