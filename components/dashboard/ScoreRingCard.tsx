'use client';

import { memo } from 'react';
import Card from '@/components/ui/Card';
import StatusPill from '@/components/ui/StatusPill';
import PerformanceRing from './PerformanceRing';
import type { PerformanceTier } from '@/types';

interface ScoreRingCardProps {
    score: number;
    tier: PerformanceTier;
    isRestDay: boolean;
    archetype?: string | null;
    difficultyTier?: string | null;
    freezeTokens?: number;
    onFreeze?: () => void;
}

export default memo(function ScoreRingCard({
    score,
    tier,
    isRestDay,
    archetype,
    difficultyTier,
    freezeTokens,
    onFreeze
}: ScoreRingCardProps) {
    return (
        <Card style={{ padding: '32px', textAlign: 'center', position: 'relative' }}>
            {isRestDay ? (
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    zIndex: 10
                }}>
                    <StatusPill text="RECOVERY" variant="gold" />
                </div>
            ) : (
                freezeTokens && freezeTokens > 0 && (
                    <button
                        onClick={onFreeze}
                        style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            zIndex: 10,
                            backgroundColor: 'rgba(200, 184, 154, 0.1)',
                            border: '0.5px solid var(--color-gold)',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            color: 'var(--color-gold)',
                            fontFamily: 'var(--font-dm-mono)',
                            fontSize: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(200, 184, 154, 0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(200, 184, 154, 0.1)'}
                    >
                        FREEZE ({freezeTokens})
                    </button>
                )
            )}
            <PerformanceRing score={score} tier={tier} />

            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '0.5px solid var(--color-divider)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--color-text-muted)' }}>ARCHETYPE</span>
                    <StatusPill text={archetype?.toUpperCase() || 'NONE'} variant="gold" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--color-text-muted)' }}>DIFFICULTY</span>
                    <span style={{ fontFamily: 'var(--font-syne)', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {difficultyTier?.toUpperCase()}
                    </span>
                </div>
            </div>
        </Card>
    );
});
