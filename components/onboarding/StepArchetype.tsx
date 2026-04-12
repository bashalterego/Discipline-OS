'use client';

import type { User } from '@/types';

const ARCHETYPES: {
    id: User['archetype'];
    label: string;
    description: string;
    icon: string;
    tasks: string[];
}[] = [
        {
            id: 'athlete',
            label: 'ATHLETE',
            description: 'Physical dominance. Movement is your primary vehicle for discipline.',
            icon: '⚡',
            tasks: ['Morning Cardio', 'Gym Session', 'Protein Goal', 'Mobility Work']
        },
        {
            id: 'scholar',
            label: 'SCHOLAR',
            description: 'Intellectual mastery. Learning and deep focus are your core systems.',
            icon: '📖',
            tasks: ['Deep Work (2h)', 'Reading (30m)', 'Research/Writing', 'Learning Session']
        },
        {
            id: 'monk',
            label: 'MONK',
            description: 'Internal control. Stillness, mindfulness, and detachment.',
            icon: '🎯',
            tasks: ['Meditation (20m)', 'Digital Detox', 'Journaling', 'Fasting Window']
        },
        {
            id: 'warrior',
            label: 'WARRIOR',
            description: 'Relentless execution. High output, high pressure, no excuses.',
            icon: '⚔️',
            tasks: ['Wake up 5:00 AM', 'Cold Shower', 'Critical Task #1', 'Heavy Training']
        },
    ];

interface StepArchetypeProps {
    archetype: User['archetype'];
    onChange: (value: User['archetype']) => void;
}

export default function StepArchetype({ archetype, onChange }: StepArchetypeProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '20px', color: 'var(--color-text-primary)' }}>
                    CHOOSE YOUR ARCHETYPE.
                </h2>
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    This pre-populates your system with proven patterns.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                {ARCHETYPES.map((a) => {
                    const isSelected = archetype === a.id;
                    return (
                        <button
                            key={a.id}
                            onClick={() => onChange(a.id)}
                            style={{
                                padding: '20px',
                                backgroundColor: isSelected ? 'rgba(200, 184, 154, 0.05)' : 'rgba(255,255,255,0.02)',
                                border: isSelected ? '1px solid var(--color-gold)' : '0.5px solid var(--color-border)',
                                borderRadius: '12px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                gap: '20px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {isSelected && (
                                <div style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--color-gold)' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                </div>
                            )}

                            <div style={{ fontSize: '32px', display: 'flex', alignItems: 'center' }}>{a.icon}</div>

                            <div style={{ flex: 1 }}>
                                <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '14px', color: isSelected ? 'var(--color-gold)' : 'var(--color-text-primary)', letterSpacing: '0.05em', marginBottom: '4px' }}>
                                    {a.label}
                                </div>
                                <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: '1.4', marginBottom: '12px' }}>
                                    {a.description}
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {a.tasks.map(t => (
                                        <span key={t} style={{ fontSize: '9px', fontFamily: 'var(--font-dm-mono)', padding: '2px 6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', border: '0.5px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                                            {t}
                                        </span>
                                    ))}
                                    <span style={{ fontSize: '9px', fontFamily: 'var(--font-dm-mono)', padding: '2px 6px', color: 'var(--color-gold)' }}>+ More</span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
