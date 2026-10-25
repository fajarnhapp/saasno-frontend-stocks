import { createHmac } from 'node:crypto';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(text: string): Buffer {
    let bits = '';
    for (const char of text.replace(/=+$/, '').toUpperCase()) {
        const value = ALPHABET.indexOf(char);
        if (value < 0) throw new Error(`Not a base32 character: ${char}`);
        bits += value.toString(2).padStart(5, '0');
    }
    const bytes: number[] = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
    return Buffer.from(bytes);
}

// The 6-digit code an authenticator app shows for a base32 secret (RFC 6238: HMAC-SHA1, 30 seconds).
export function totp(secret: string, atMs: number = Date.now()): string {
    const counter = Buffer.alloc(8);
    counter.writeBigUInt64BE(BigInt(Math.floor(atMs / 1000 / 30)));
    const hmac = createHmac('sha1', base32Decode(secret)).update(counter).digest();
    const offset = hmac[hmac.length - 1] & 0x0f;
    const binary = hmac.readUInt32BE(offset) & 0x7fffffff;
    return String(binary % 1_000_000).padStart(6, '0');
}

// The secret inside an otpauth:// address.
export function secretFromUri(uri: string): string {
    const secret = new URL(uri).searchParams.get('secret');
    if (!secret) throw new Error('No secret in the otpauth address');
    return secret;
}

// Milliseconds until the code changes; a test waits when it is too close, so a code cannot expire between typing and checking.
export function msUntilNextCode(atMs: number = Date.now()): number {
    return 30_000 - (atMs % 30_000);
}
