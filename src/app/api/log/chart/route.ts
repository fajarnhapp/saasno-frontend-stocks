import { SESSION_ID } from '@/proxy';
import { csrfResponse, ApiHandler } from '@/utils/csrfUtils';
import { API_LOG, BACKEND_URL } from '@/utils/endpointUtils';
import { NextRequest, NextResponse } from 'next/server';

export interface ChartPoint {
    label: string;
    timestamp: number;
    total: number;
    GET: number;
    POST: number;
    PUT: number;
    PATCH: number;
    DELETE: number;
    OTHER: number;
}

type Range = '1h' | '3h' | '6h' | '12h';

interface BucketConfig {
    bucketMs: number;
    buckets: number;
    labelFn: (d: Date) => string;
}

const BUCKET_CONFIGS: Record<Range, BucketConfig> = {
    '1h':  { bucketMs: 5 * 60 * 1000,   buckets: 12, labelFn: d => d.toTimeString().slice(0, 5) },
    '3h':  { bucketMs: 15 * 60 * 1000,  buckets: 12, labelFn: d => d.toTimeString().slice(0, 5) },
    '6h':  { bucketMs: 30 * 60 * 1000,  buckets: 12, labelFn: d => d.toTimeString().slice(0, 5) },
    '12h': { bucketMs: 60 * 60 * 1000,  buckets: 12, labelFn: d => d.toTimeString().slice(0, 5) },
};

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

export const GET: ApiHandler = csrfResponse(
    async (req: NextRequest): Promise<Response> => {
        const range = (req.nextUrl.searchParams.get('range') ?? '12h') as Range;
        const cfg = BUCKET_CONFIGS[range] ?? BUCKET_CONFIGS['12h'];
        const windowMs = cfg.bucketMs * cfg.buckets;

        // Anchor window to current time so labels are always synced with the clock.
        const endMs = Date.now();
        const startMs = endMs - windowMs;

        const params = new URLSearchParams({
            startDate: new Date(startMs).toISOString(),
            order: 'registered',
            sorting: 'ASC',
            offset: '0',
            limit: '10000',
        });

        const url = `${BACKEND_URL}${API_LOG}?${params}`;
        const backendRes = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${req.cookies.get(SESSION_ID)?.value || ''}`,
            },
        });

        if (!backendRes.ok) {
            return NextResponse.json({ data: [] });
        }

        const json = await backendRes.json();
        const logs: Array<{ registered?: string; method?: string }> = json?.data ?? [];

        // Build empty buckets — label at END of each bucket so the last tick = now.
        const buckets: ChartPoint[] = Array.from({ length: cfg.buckets }, (_, i) => {
            const ts = startMs + (i + 1) * cfg.bucketMs;
            return {
                label: cfg.labelFn(new Date(ts)),
                timestamp: ts,
                total: 0,
                GET: 0, POST: 0, PUT: 0, PATCH: 0, DELETE: 0, OTHER: 0,
            };
        });

        // Fill buckets — only logs within the window
        for (const log of logs) {
            if (!log.registered) continue;
            const ts = new Date(log.registered).getTime();
            const idx = Math.floor((ts - startMs) / cfg.bucketMs);
            if (idx < 0 || idx >= cfg.buckets) continue;

            buckets[idx].total++;
            const m = (log.method ?? '').toUpperCase();
            if (METHODS.includes(m as typeof METHODS[number])) {
                (buckets[idx] as unknown as Record<string, number>)[m]++;
            } else {
                buckets[idx].OTHER++;
            }
        }

        return NextResponse.json({ data: buckets });
    }
);
