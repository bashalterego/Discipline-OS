'use client';

import type { User } from '@/types';
import type { CustomTask } from './StepTaskBuilder';

interface StepPointsProps {
    difficultyTier: User['difficulty_tier'];
    tasks: CustomTask[];
}

export default function StepPoints({ difficultyTier, tasks }: StepPointsProps) {
    const totalPoints = tasks.reduce((sum, t) => sum + t.points, 0);
    const threshold = difficultyTier === 'elite' ? 7.0 : difficultyTier === 'intermediate' ? 6.5 : 5.0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '20px', color: 'var(--color-text-primary)' }}>
                    SCORING ENGINE.
                </h2>
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    How your discipline is measured every 24 hours.
                </p>
            </div>

            <div className="card" style={{ padding: '20px', backgroundColor: 'rgba(200, 184, 154, 0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontFamily: 'var(--font-syne)', fontSize: '12px', fontWeight: 800, color: 'var(--color-text-muted)' }}>YOUR SYSTEM CAPACITY</span>
                    <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '14px', fontWeight: 600, color: 'var(--color-gold)' }}>{totalPoints.toFixed(1)} PTS</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto', paddingRight: '8px' }}>
                    {tasks.map((t, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontFamily: 'var(--font-dm-mono)', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px' }}>
                            <span style={{ color: 'var(--color-text-secondary)' }}>{t.name}</span>
                            <span style={{ color: 'var(--color-sage)' }}>{t.points.toFixed(1)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', border: '0.5px solid var(--color-border)', borderRadius: '8px' }}>
                    <h4 style={{ fontFamily: 'var(--font-syne)', fontSize: '11px', fontWeight: 800, marginBottom: '12px', color: 'var(--color-gold)' }}>PERFORMANCE TIERS</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-dm-mono)' }}>
                            <span style={{ color: 'var(--color-sage)' }}>ELITE</span>
                            <span>8.5 - 10.0</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-dm-mono)' }}>
                            <span style={{ color: 'var(--color-text-primary)' }}>OPTIMAL</span>
                            <span>7.0 - 8.4</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-dm-mono)' }}>
                            <span style={{ color: 'var(--color-text-secondary)' }}>ACTIVE</span>
                            <span>5.0 - 6.9</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-dm-mono)' }}>
                            <span style={{ color: 'var(--color-red)' }}>CRITICAL</span>
                            <span>0.0 - 4.9</span>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', border: '0.5px solid var(--color-border)', borderRadius: '8px' }}>
                    <h4 style={{ fontFamily: 'var(--font-syne)', fontSize: '11px', fontWeight: 800, marginBottom: '12px', color: 'var(--color-gold)' }}>STREAK RULES</h4>
                    <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                        To maintain your streak at <strong>{difficultyTier.toUpperCase()}</strong> difficulty, you must maintain a minimum score of <strong>{threshold.toFixed(1)}</strong>.
                    </p>
                    <div style={{ marginTop: '12px', padding: '6px', backgroundColor: 'rgba(200, 184, 154, 0.05)', borderRadius: '4px', fontSize: '10px', border: '0.5px solid var(--color-gold)', color: 'var(--color-gold)', textAlign: 'center' }}>
                        THRESHOLD: {threshold.toFixed(1)}+
                    </div>
                </div>
            </div>
        </div>
    );
}
