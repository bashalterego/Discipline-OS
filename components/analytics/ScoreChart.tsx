'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { useMemo } from 'react';

interface ScoreEntry {
    log_date: string;
    score: number;
}

interface ScoreChartProps {
    data: ScoreEntry[];
}

export default function ScoreChart({ data }: ScoreChartProps) {
    const chartData = useMemo(() => {
        return data.map(d => ({
            ...d,
            displayDate: new Date(d.log_date).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric'
            })
        }));
    }, [data]);

    return (
        <div style={{ width: '100%', height: 300, marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-gold)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--color-gold)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="displayDate"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontFamily: 'var(--font-dm-mono)' }}
                        minTickGap={30}
                    />
                    <YAxis
                        domain={[0, 10]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontFamily: 'var(--font-dm-mono)' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--color-card)',
                            border: '0.5px solid var(--color-border)',
                            borderRadius: '8px',
                            fontFamily: 'var(--font-syne)',
                            fontSize: '12px'
                        }}
                        itemStyle={{ color: 'var(--color-gold)' }}
                        labelStyle={{ color: 'var(--color-text-muted)', marginBottom: '4px' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="var(--color-gold)"
                        fillOpacity={1}
                        fill="url(#colorScore)"
                        strokeWidth={2}
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
