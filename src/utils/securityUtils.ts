import { NextRequest } from "next/server";

const rateLimit = new Map<string, { count: number; resetTime: number }>();

// Expired entries are swept periodically so the Map does not keep growing with IPs/sessions that never return.
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
let lastSweep = Date.now();

export function checkRateLimit(ip: string, maxRequests = 100, windowMs = 60000): boolean {
    const now = Date.now();
    if (now - lastSweep > SWEEP_INTERVAL_MS) {
        lastSweep = now;
        for (const [key, entry] of rateLimit) {
            if (now > entry.resetTime) {
                rateLimit.delete(key);
            }
        }
    }
    const record = rateLimit.get(ip);

    if (!record || now > record.resetTime) {
        rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
        return true;
    }

    if (record.count >= maxRequests) {
        return false;
    }

    record.count++;
    return true;
}

export function sanitizeString(input: string): string {
    return input
        .replace(/[<>]/g, '')           // cegah XSS basic
        .replace(/javascript:/gi, '')   // cegah javascript injection
        .trim()
        .substring(0, 1000);            // limit panjang
}

/**
 * Karakter yang diizinkan: huruf Unicode, angka Unicode, spasi,
 * dan tanda baca: . , ; : ( ) / _ - & @ # ' " +
 */
const ALLOWED_INPUT_PATTERN = /^[\p{L}\p{N} .,;:()\/_\-&@#'"+ !$]*$/u;

export function isValidInputString(input: string): boolean {
    return ALLOWED_INPUT_PATTERN.test(input);
}

export function sanitizeInputString(input: string): string {
    return input.replace(/[^\p{L}\p{N} .,;:()\/_\-&@#'"+ !$]/gu, '');
}

export function isValidUUID(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function logSuspicious(request: NextRequest, reason: string): void {
    const ip: string = request.headers.get('x-forwarded-for') ?? 'unknown';
    const ua: string = request.headers.get('user-agent') ?? 'unknown';
    const path: string = request.nextUrl.pathname;
    console.warn(`[SECURITY] ${reason} | IP: ${ip} | Path: ${path} | UA: ${ua} | Time: ${new Date().toISOString()}`);
}
