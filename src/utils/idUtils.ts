export function generateRandomHex(len = 32): string {
    const bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// btoa/String.fromCharCode instead of Buffer so this stays safe to call from the Edge runtime middleware.
export function generateNonce(len = 16): string {
    const bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);
    return btoa(String.fromCharCode(...bytes));
}