'use client';

interface StepIdentityProps {
    fullName: string;
    identityStatement: string;
    onChange: (key: string, value: string) => void;
}

export default function StepIdentity({ fullName, identityStatement, onChange }: StepIdentityProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h2
                    style={{
                        fontFamily: 'var(--font-syne)',
                        fontWeight: 700,
                        fontSize: '22px',
                        color: 'var(--color-text-primary)',
                        marginBottom: '8px',
                    }}
                >
                    Who are you becoming?
                </h2>
                <p
                    style={{
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: '12px',
                        color: 'var(--color-text-muted)',
                    }}
                >
                    This becomes your daily anchor. Be specific.
                </p>
            </div>

            <div>
                <label className="label-text" style={{ display: 'block', marginBottom: '8px' }}>
                    YOUR NAME
                </label>
                <input
                    type="text"
                    value={fullName}
                    onChange={(e) => onChange('fullName', e.target.value)}
                    placeholder="Sailesh Kumar"
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '0.5px solid var(--color-border)',
                        borderRadius: '6px',
                        color: 'var(--color-text-primary)',
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: '14px',
                        outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--color-gold)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
                />
            </div>

            <div>
                <label className="label-text" style={{ display: 'block', marginBottom: '8px' }}>
                    IDENTITY STATEMENT
                </label>
                <textarea
                    value={identityStatement}
                    onChange={(e) => onChange('identityStatement', e.target.value)}
                    placeholder="I am a disciplined person who shows up every day, no matter what."
                    rows={3}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '0.5px solid var(--color-border)',
                        borderRadius: '6px',
                        color: 'var(--color-text-primary)',
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: '13px',
                        outline: 'none',
                        resize: 'vertical',
                        lineHeight: 1.6,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--color-gold)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
                />
                <p
                    style={{
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: '10px',
                        color: 'var(--color-text-muted)',
                        marginTop: '6px',
                    }}
                >
                    This will be shown on your dashboard every day.
                </p>
            </div>
        </div>
    );
}
