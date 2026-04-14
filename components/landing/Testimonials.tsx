'use client';

const TESTIMONIALS = [
    {
        quote: "DisciplineOS turned my vague intentions into a hard, trackable system. The score is addictive.",
        author: "Marcus K.",
        role: "Elite Tier User"
    },
    {
        quote: "The AI reflection knows exactly when I'm sliding. It's like having a digital stoic mentor in my pocket.",
        author: "Sarah L.",
        role: "Scholar Archetype"
    },
    {
        quote: "Finally, a productivity tool that doesn't feel like a toy. It's built for serious output.",
        author: "David R.",
        role: "Warrior Archetype"
    }
];

export default function Testimonials() {
    return (
        <section style={{ padding: '100px 8%', backgroundColor: '#0E0E10' }}>
            <h2 style={{
                fontFamily: 'var(--font-syne)',
                fontSize: '12px',
                fontWeight: 800,
                color: 'var(--color-gold)',
                letterSpacing: '0.2em',
                textAlign: 'center',
                marginBottom: '48px'
            }}>
                VERIFIED BY THE ELITE
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {TESTIMONIALS.map((t, i) => (
                    <div key={i} style={{
                        padding: '40px',
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        border: '0.5px solid var(--color-border)',
                        borderRadius: '16px',
                        transition: 'transform 0.3s ease'
                    }}>
                        <p style={{
                            fontFamily: 'var(--font-dm-mono)',
                            fontSize: '16px',
                            color: 'var(--color-text-secondary)',
                            lineHeight: '1.6',
                            marginBottom: '32px',
                            fontStyle: 'italic'
                        }}>
                            "{t.quote}"
                        </p>
                        <div>
                            <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '14px', color: 'var(--color-text-primary)' }}>
                                {t.author}
                            </div>
                            <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: 'var(--color-gold)', marginTop: '4px' }}>
                                {t.role}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
