'use client';

import { motion } from 'framer-motion';
import type { User } from '@/types';

const TIERS: {
    id: User['difficulty_tier'];
    label: string;
    description: string;
    threshold: string;
    rule: string;
}[] = [
        {
            id: 'beginner',
            label: 'BEGINNER',
            description: 'For those starting their journey. More forgiving windows for error.',
            threshold: '5.0+ SCORE',
            rule: 'Standard recovery rules apply.'
        },
        {
            id: 'intermediate',
            label: 'INTERMEDIATE',
            description: 'Focused accountability. Requires consistent daily output.',
            threshold: '6.5+ SCORE',
            rule: 'Higher score needed to maintain streak.'
        },
        {
            id: 'elite',
            label: 'ELITE',
            description: 'No compromise. Strict Mode is permanently active.',
            threshold: '7.0+ SCORE',
            rule: 'Near-perfect execution is the baseline.'
        },
    ];

interface StepDifficultyProps {
    difficultyTier: User['difficulty_tier'];
    onChange: (value: User['difficulty_tier']) => void;
}

export default function StepDifficulty({ difficultyTier, onChange }: StepDifficultyProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '20px', color: 'var(--color-text-primary)' }}>
                    SELECT YOUR INTENSITY.
                </h2>
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    This sets the threshold for your daily streak.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {TIERS.map((tier) => {
                    const isSelected = difficultyTier === tier.id;
                    return (
                        <button
                            key={tier.id}
                            onClick={() => onChange(tier.id)}
                            style={{
                                padding: '24px',
                                backgroundColor: isSelected ? 'rgba(200, 184, 154, 0.05)' : 'rgba(255,255,255,0.02)',
                                border: isSelected ? '1px solid var(--color-gold)' : '0.5px solid var(--color-border)',
                                borderRadius: '12px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '14px', color: isSelected ? 'var(--color-gold)' : 'var(--color-text-primary)', letterSpacing: '0.05em' }}>
                                    {tier.label}
                                </div>
                                <div style={{
                                    fontFamily: 'var(--font-dm-mono)',
                                    fontSize: '10px',
                                    color: isSelected ? 'var(--color-gold)' : 'var(--color-text-muted)',
                                    padding: '4px 8px',
                                    backgroundColor: isSelected ? 'rgba(200, 184, 154, 0.1)' : 'rgba(255,255,255,0.05)',
                                    borderRadius: '4px',
                                    border: `0.5px solid ${isSelected ? 'var(--color-gold)' : 'var(--color-border)'}`
                                }}>
                                    {tier.threshold}
                                </div>
                            </div>

                            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: isSelected ? 'var(--color-text-secondary)' : 'var(--color-text-muted)', lineHeight: '1.5', marginBottom: '12px', maxWidth: '80%' }}>
                                {tier.description}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', fontFamily: 'var(--font-dm-mono)', color: isSelected ? 'var(--color-gold)' : 'var(--color-text-muted)' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M12 6v6l4 2" /></svg>
                                <span>{tier.rule}</span>
                            </div>

                            {isSelected && (
                                <motion.div
                                    layoutId="difficulty-indicator"
                                    style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', backgroundColor: 'var(--color-gold)' }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
