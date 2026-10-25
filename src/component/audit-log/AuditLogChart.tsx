'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { RefreshCw } from 'lucide-react';
import { useCsrf } from '@/context/CsrfContext';
import { ChartRange, readAuditLogChart } from '@/service/auditLogService';
import { ChartPoint } from '@/app/api/log/chart/route';

const RANGES: { label: string; value: ChartRange; tickFmt: (ts: number) => string }[] = [
    { label: '1H',  value: '1h',  tickFmt: ts => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    { label: '3H',  value: '3h',  tickFmt: ts => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    { label: '6H',  value: '6h',  tickFmt: ts => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    { label: '12H', value: '12h', tickFmt: ts => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
];

// Colors match MethodBadge (Postman-style)
const METHOD_LINES: { key: keyof ChartPoint; color: string }[] = [
    { key: 'GET',    color: '#0CBB52' },
    { key: 'POST',   color: '#D99A00' },
    { key: 'PUT',    color: '#097BED' },
    { key: 'PATCH',  color: '#623497' },
    { key: 'DELETE', color: '#EB2013' },
    { key: 'OTHER',  color: '#6b7280' },
];

export default function AuditLogChart() {
    const { setCsrf } = useCsrf();
    const [range, setRange] = useState<ChartRange>('12h');
    const currentRangeCfg = RANGES.find(r => r.value === range) ?? RANGES[3];
    const [data, setData] = useState<ChartPoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [visibleLines, setVisibleLines] = useState<Set<string>>(new Set(['total']));
    const [error, setError] = useState<string | null>(null);

    const fetchChart = useCallback(async (r: ChartRange) => {
        setLoading(true);
        setError(null);
        try {
            const res = await readAuditLogChart(r, setCsrf);
            const json = await res.json();
            if (!res.ok) {
                setError(`Backend error ${res.status}`);
                return;
            }
            const points: ChartPoint[] = json.data ?? [];
            setData(points);

            // Show only method lines that have data
            const active = new Set<string>(['total']);
            for (const line of METHOD_LINES) {
                if (points.some(p => (p[line.key] as number) > 0)) {
                    active.add(line.key as string);
                }
            }
            setVisibleLines(active);
        } catch (e) {
            console.error('[AuditLogChart] fetch error', e);
            setError('Failed to load chart data');
        } finally {
            setLoading(false);
        }
    }, [setCsrf]);

    // Loads the chart from the API whenever the range changes; the loading state is set by fetchChart itself.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchChart(range);
    }, [range, fetchChart]);

    const toggleLine = (key: string) => {
        setVisibleLines(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                if (next.size > 1) next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    const totalLogs = data.reduce((sum, p) => sum + p.total, 0);

    return (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
            {/* Header */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-gray-800">Log Activity</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {totalLogs.toLocaleString()} requests in selected period
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Range buttons */}
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                        {RANGES.map(r => (
                            <button
                                key={r.value}
                                onClick={() => setRange(r.value)}
                                className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer
                                    ${range === r.value
                                        ? 'bg-brand-600 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>

                    {/* Refresh button */}
                    <button
                        onClick={() => fetchChart(range)}
                        disabled={loading}
                        className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                        title="Refresh"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Method toggle chips */}
            <div className="mb-4 flex flex-wrap gap-2">
                <button
                    onClick={() => toggleLine('total')}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer
                        ${visibleLines.has('total')
                            ? 'bg-gray-800 text-white border-gray-800'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                        }`}
                >
                    Total
                </button>
                {METHOD_LINES.map(({ key, color }) => (
                    <button
                        key={key as string}
                        onClick={() => toggleLine(key as string)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer
                            ${visibleLines.has(key as string)
                                ? 'text-white border-transparent'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                            }`}
                        style={visibleLines.has(key as string) ? { backgroundColor: color, borderColor: color } : {}}
                    >
                        {key as string}
                    </button>
                ))}
            </div>

            {/* Chart */}
            {error ? (
                <div className="flex h-52 items-center justify-center text-sm text-red-500">
                    {error} — cek console untuk detail
                </div>
            ) : loading && data.length === 0 ? (
                <div className="flex h-52 items-center justify-center text-sm text-gray-400">
                    Loading chart...
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={data} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="timestamp"
                            scale="time"
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            tickFormatter={currentRangeCfg.tickFmt}
                            tick={{ fontSize: 11, fill: '#9ca3af' }}
                            tickLine={false}
                            axisLine={{ stroke: '#e5e7eb' }}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            allowDecimals={false}
                            tick={{ fontSize: 11, fill: '#9ca3af' }}
                            tickLine={false}
                            axisLine={false}
                            width={32}
                        />
                        <Tooltip
                            labelFormatter={ts => new Date(ts as number).toLocaleString([], {
                                month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            })}
                            contentStyle={{
                                fontSize: 12,
                                borderRadius: 8,
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            }}
                            labelStyle={{ fontWeight: 600, marginBottom: 4, color: '#374151' }}
                        />
                        <Legend
                            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                        />

                        {visibleLines.has('total') && (
                            <Line
                                type="monotone"
                                dataKey="total"
                                name="Total"
                                stroke="#374151"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                        )}
                        {METHOD_LINES.map(({ key, color }) =>
                            visibleLines.has(key as string) && (
                                <Line
                                    key={key as string}
                                    type="monotone"
                                    dataKey={key as string}
                                    name={key as string}
                                    stroke={color}
                                    strokeWidth={1.5}
                                    dot={false}
                                    activeDot={{ r: 3 }}
                                />
                            )
                        )}
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
