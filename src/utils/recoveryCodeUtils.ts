// One-time recovery codes look like ABCDE-FGHJK (letters without look-alikes, and digits 2-9).
const CODE = /^[A-HJ-NP-Z2-9]{5}-?[A-HJ-NP-Z2-9]{5}$/;

// Uppercase, no spaces, with the dash in the middle: "abcde fghjk" -> "ABCDE-FGHJK".
export function normalizeRecoveryCode(input: string): string {
    const compact: string = input.toUpperCase().replace(/[\s-]/g, '');
    return compact.length === 10 ? `${compact.slice(0, 5)}-${compact.slice(5)}` : input.trim().toUpperCase();
}

export function isRecoveryCode(input: string): boolean {
    return CODE.test(input.toUpperCase().replace(/\s/g, ''));
}

// The text saved when the user downloads their codes.
export function recoveryCodesToText(codes: string[], appName: string): string {
    return [
        `${appName} - two-step verification recovery codes`,
        'Each code works once. Keep them somewhere safe.',
        '',
        ...codes,
        '',
    ].join('\n');
}
