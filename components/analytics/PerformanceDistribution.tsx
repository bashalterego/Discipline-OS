'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useMemo } from 'react';

interface DistributionEntry {
    name: string;
    value: number;
    color: string;
}

interface PerformanceDistributionProps {
    data: any[]; // Daily logs
}

export default function PerformanceDistribution({ data }: PerformanceDistributionProps) {
    const distributionData = useMemo(() => {
        const counts: Record<string, number> = {
            ELITE: 0,
            ACTIVE: 0,
            CRITICAL: 0,
        };

        data.forEach((log) => {
            const tier = log.performance_tier || 'CRITICAL';
            if (counts[tier] !== undefined) {
                counts[tier]++;
            }
        });

        return [
            { name: 'ELITE', value: counts.ELITE, color: 'var(--color-gold)' },
            { name: 'ACTIVE', value: counts.ACTIVE, color: 'var(--color-sage)' },
            { name: 'CRITICAL', value: counts.CRITICAL, color: 'var(--color-accent-red)' },
        ].filter(d => d.value > 0);
    }, [data]);

    return (
        <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={1000}
                    >
                        {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--color-card)',
                            border: '0.5px solid var(--color-border)',
                            borderRadius: '8px',
                            fontFamily: 'var(--font-syne)',
                            fontSize: '10px'
                        }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span style={{ color: 'var(--color-text-muted)', fontSize: '10px', fontFamily: 'var(--font-dm-mono)' }}>{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
