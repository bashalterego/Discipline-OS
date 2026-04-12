'use client';

interface TopBarProps {
    greeting: string;
    dateLabel: string;
    mode?: 'normal' | 'strict' | 'recovery';
}

const MODE_CONFIG = {
    normal: null,
    strict: { label: 'STRICT MODE', color: 'var(--color-red)' },
    recovery: { label: 'RECOVERY MODE', color: 'var(--color-sage)' },
};

export default function TopBar({ greeting, dateLabel, mode = 'normal' }: TopBarProps) {
    const modeInfo = MODE_CONFIG[mode];

    return (
        <div style={{ marginBottom: '28px' }}>
            {/* Date */}
            <div
                style={{
                    fontFamily: 'var(--font-dm-mono)',
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                }}
            >
                {dateLabel}
            </div>

            {/* Greeting + Mode Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h1
                    style={{
                        fontFamily: 'var(--font-syne)',
                        fontWeight: 700,
                        fontSize: '22px',
                        color: 'var(--color-text-primary)',
                    }}
                >
                    {greeting}
                </h1>
                {modeInfo && (
                    <span
                        style={{
                            fontFamily: 'var(--font-dm-mono)',
                            fontSize: '9px',
                            fontWeight: 500,
                            letterSpacing: '0.1em',
                            color: modeInfo.color,
                            border: `0.5px solid ${modeInfo.color}`,
                            borderRadius: '4px',
                            padding: '3px 8px',
                            textTransform: 'uppercase',
                            opacity: 0.9,
                        }}
                    >
                        {modeInfo.label}
                    </span>
                )}
            </div>
        </div>
    );
}
