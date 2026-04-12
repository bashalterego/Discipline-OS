'use client';


interface StepCommitmentProps {
    commitment: { title: string; durationDays: 30 | 60 | 90 } | null;
    onChange: (value: { title: string; durationDays: 30 | 60 | 90 } | null) => void;
}

const COMMITMENT_OPTIONS = [
    { value: 30, label: '30 DAYS', description: 'Short sprint to prove yourself.' },
    { value: 60, label: '60 DAYS', description: 'Build real momentum.' },
    { value: 90, label: '90 DAYS', description: 'Long enough to form identity.' },
];

export default function StepCommitment({ commitment, onChange }: StepCommitmentProps) {
    const title = commitment?.title ?? '';
    const durationDays = commitment?.durationDays ?? 30;

    function update(key: string, value: unknown) {
        onChange({ title, durationDays, [key]: value } as { title: string; durationDays: 30 | 60 | 90 });
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '20px', color: 'var(--color-text-primary)' }}>
                    FINAL COMMITMENT.
                </h2>
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    What are you fighting for in this phase?
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="label-text" style={{ fontSize: '10px' }}>COMMITMENT MISSION</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => update('title', e.target.value)}
                    placeholder="90 Days of Unshakeable Focus"
                    style={{
                        width: '100%',
                        padding: '12px 14px',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '0.5px solid var(--color-border)',
                        borderRadius: '8px',
                        color: 'var(--color-text-primary)',
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: '13px',
                        outline: 'none',
                    }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label className="label-text" style={{ fontSize: '10px' }}>PHASE DURATION</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    {COMMITMENT_OPTIONS.map((d) => {
                        const isSelected = durationDays === d.value;
                        return (
                            <button
                                key={d.value}
                                onClick={() => update('durationDays', d.value)}
                                style={{
                                    padding: '16px 8px',
                                    backgroundColor: isSelected ? 'rgba(200, 184, 154, 0.05)' : 'rgba(255,255,255,0.02)',
                                    border: isSelected ? '1px solid var(--color-gold)' : '0.5px solid var(--color-border)',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{
                                    fontFamily: 'var(--font-syne)',
                                    fontWeight: 800,
                                    fontSize: '14px',
                                    color: isSelected ? 'var(--color-gold)' : 'var(--color-text-primary)',
                                    marginBottom: '4px'
                                }}>
                                    {d.label}
                                </div>
                                <div style={{
                                    fontFamily: 'var(--font-dm-mono)',
                                    fontSize: '9px',
                                    color: 'var(--color-text-muted)',
                                    lineHeight: '1.3'
                                }}>
                                    {d.description}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div style={{ padding: '12px', border: '0.5px solid var(--color-gold)', borderRadius: '8px', backgroundColor: 'rgba(200, 184, 154, 0.03)', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: 'var(--color-gold)' }}>
                    "The pain of discipline is far less than the pain of regret."
                </p>
            </div>
        </div>
    );
}
