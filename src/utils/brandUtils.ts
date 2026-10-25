export const DEFAULT_BRAND_HUE = 293;
export const DEFAULT_BRAND_CHROMA = 1;
export const MIN_BRAND_CHROMA = 0.3;
export const MAX_BRAND_CHROMA = 1.2;

function toNumber(value: unknown, fallback: number): number {
    const parsed: number = typeof value === 'number' ? value : parseFloat(String(value));
    return Number.isFinite(parsed) ? parsed : fallback;
}

export function clampHue(value: unknown): number {
    return Math.round(Math.min(360, Math.max(0, toNumber(value, DEFAULT_BRAND_HUE))));
}

export function clampChroma(value: unknown): number {
    const clamped: number = Math.min(MAX_BRAND_CHROMA, Math.max(MIN_BRAND_CHROMA, toNumber(value, DEFAULT_BRAND_CHROMA)));
    return Math.round(clamped * 100) / 100;
}

// The two variables globals.css builds every bg-brand-* / text-brand-* colour from.
export function brandCssVariables(hue: unknown, chroma: unknown): Record<string, string> {
    return {
        '--brand-hue': String(clampHue(hue)),
        '--brand-chroma': String(clampChroma(chroma)),
    };
}

// The main brand colour (brand-600) for a swatch, with the same formula as globals.css.
export function brandSwatch(hue: unknown, chroma: unknown): string {
    return `oklch(54.1% ${(0.281 * clampChroma(chroma)).toFixed(3)} ${clampHue(hue)})`;
}
