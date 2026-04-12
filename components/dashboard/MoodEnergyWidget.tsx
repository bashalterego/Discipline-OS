'use client';

import { useDashboardStore } from '@/store/useDashboardStore';
import Card from '@/components/ui/Card';

const MOOD_OPTIONS = [
    { value: 1, emoji: '😔', label: 'LOW' },
    { value: 2, emoji: '😐', label: 'MEH' },
    { value: 3, emoji: '🙂', label: 'OK' },
    { value: 4, emoji: '😄', label: 'GOOD' },
    { value: 5, emoji: '🤩', label: 'PEAK' },
];

const ENERGY_OPTIONS = [
    { value: 1, emoji: '🪫', label: 'DEAD' },
    { value: 2, emoji: '😴', label: 'LOW' },
    { value: 3, emoji: '⚡', label: 'OK' },
    { value: 4, emoji: '🔥', label: 'HIGH' },
    { value: 5, emoji: '💥', label: 'MAX' },
];

export default function MoodEnergyWidget() {
    const { dailyLog, updateMoodEnergy, isEditing } = useDashboardStore();
    const mood = dailyLog?.mood ?? null;
    const energy = dailyLog?.energy ?? null;
    const isLocked = dailyLog?.log_closed && !isEditing;

    const handleSelect = (type: 'mood' | 'energy', value: number) => {
        if (isLocked) return;
        const current = type === 'mood' ? mood : energy;
        updateMoodEnergy(
            type === 'mood' ? (current === value ? null : value) : mood,
            type === 'energy' ? (current === value ? null : value) : energy,
        );
    };

    return (
        <Card style={{ padding: '20px' }}>
            <h3 style={{
                fontFamily: 'var(--font-syne)', fontSize: '12px', fontWeight: 700,
                color: 'var(--color-text-muted)', letterSpacing: '0.1em', marginBottom: '16px',
            }}>
                VITALS
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Mood */}
                <div>
                    <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'var(--color-text-muted)', marginBottom: '8px', letterSpacing: '0.08em' }}>
                        MOOD
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {MOOD_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => handleSelect('mood', opt.value)}
                                title={opt.label}
                                style={{
                                    flex: 1, padding: '8px 4px', borderRadius: '6px', cursor: 'pointer',
                                    border: `0.5px solid ${mood === opt.value ? 'var(--color-gold)' : 'var(--color-border)'}`,
                                    backgroundColor: mood === opt.value ? 'rgba(200,184,154,0.12)' : 'rgba(255,255,255,0.02)',
                                    fontSize: '18px', lineHeight: 1, transition: 'all 0.15s ease',
                                    transform: mood === opt.value ? 'scale(1.1)' : 'scale(1)',
                                }}
                            >
                                {opt.emoji}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Energy */}
                <div>
                    <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'var(--color-text-muted)', marginBottom: '8px', letterSpacing: '0.08em' }}>
                        ENERGY
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {ENERGY_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => handleSelect('energy', opt.value)}
                                title={opt.label}
                                style={{
                                    flex: 1, padding: '8px 4px', borderRadius: '6px', cursor: 'pointer',
                                    border: `0.5px solid ${energy === opt.value ? 'var(--color-sage)' : 'var(--color-border)'}`,
                                    backgroundColor: energy === opt.value ? 'rgba(139,177,143,0.12)' : 'rgba(255,255,255,0.02)',
                                    fontSize: '18px', lineHeight: 1, transition: 'all 0.15s ease',
                                    transform: energy === opt.value ? 'scale(1.1)' : 'scale(1)',
                                }}
                            >
                                {opt.emoji}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}
