'use client';

import type { PerformanceTier } from '@/types';

interface PerformanceRingProps {
    score: number;
    tier: PerformanceTier;
}

export default function PerformanceRing({ score, tier }: PerformanceRingProps) {
    const radius = 80;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 10) * circumference;

    const getColor = () => {
        if (score >= 7.5) return 'var(--color-gold)';
        if (score >= 6.0) return 'var(--color-sage)';
        if (score >= 4.0) return 'var(--color-amber)';
        return 'var(--color-accent-red)';
    };

    return (
        <div id="performance-ring" style={{ position: 'relative', width: radius * 2, height: radius * 2, margin: '0 auto' }}>
            <svg
                height={radius * 2}
                width={radius * 2}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            >
                {/* Background Ring */}
                <circle
                    stroke="var(--color-divider)"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                {/* Progress Ring */}
                <circle
                    stroke={getColor()}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-out' }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <span
                    style={{
                        fontFamily: 'var(--font-syne)',
                        fontSize: '36px',
                        fontWeight: 800,
                        color: 'var(--color-text-primary)',
                        lineHeight: 1,
                    }}
                >
                    {score.toFixed(1)}
                </span>
                <span
                    style={{
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: '10px',
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        color: getColor(),
                        marginTop: '4px',
                    }}
                >
                    {tier}
                </span>
            </div>
        </div>
    );
}
