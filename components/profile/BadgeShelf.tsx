'use client';

import type { Achievement } from '@/types';
import Card from '@/components/ui/Card';

interface BadgeShelfProps {
    achievements: Achievement[];
}

export default function BadgeShelf({ achievements }: BadgeShelfProps) {
    if (achievements.length === 0) {
        return (
            <Card style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.3 }}>🏅</div>
                <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '14px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                    NO ACHIEVEMENTS YET
                </h3>
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    Execute your system to unlock badges.
                </p>
            </Card>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
            {achievements.map((achievement) => (
                <Card
                    key={achievement.id}
                    style={{
                        padding: '20px 16px',
                        textAlign: 'center',
                        border: '1px solid var(--color-border)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'default',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <div style={{ fontSize: '40px', marginBottom: '8px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }}>
                        {achievement.badge_emoji}
                    </div>
                    <div style={{
                        fontFamily: 'var(--font-syne)',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: 'var(--color-gold)',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        lineHeight: '1.2'
                    }}>
                        {achievement.title}
                    </div>
                    <div style={{
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: '9px',
                        color: 'var(--color-text-muted)'
                    }}>
                        {new Date(achievement.earned_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </div>
                </Card>
            ))}
        </div>
    );
}
