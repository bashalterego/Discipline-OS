'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
    {
        number: '01',
        title: 'Tactical Execution',
        description: 'Log your daily protocols—from deep work blocks to nutritional standards. Every action is a data point in your evolution.',
        visual: 'tasks'
    },
    {
        number: '02',
        title: 'Behavioral Analysis',
        description: 'Our system calculates your daily Discipline Score based on completion rates, difficulty, and consistency. No more guessing.',
        visual: 'score'
    },
    {
        number: '03',
        title: 'AI Synthesis',
        description: 'Receive personalized weekly verdicts and directives to patch the leaks in your system and optimize for the week ahead.',
        visual: 'ai'
    }
];

export default function HowItWorks() {
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            const steps = gsap.utils.toArray('.step-section');

            gsap.to(steps, {
                xPercent: -100 * (steps.length - 1),
                ease: "none",
                scrollTrigger: {
                    trigger: triggerRef.current,
                    pin: true,
                    scrub: 1,
                    snap: 1 / (steps.length - 1),
                    end: () => "+=" + (triggerRef.current?.offsetWidth || 0) * 2
                }
            });

            // Entry animation
            gsap.from(containerRef.current, {
                opacity: 0,
                duration: 1.2,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 80%",
                }
            });
        }, triggerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={triggerRef} style={{ overflow: 'hidden', backgroundColor: '#0E0E10' }}>
            <section
                ref={containerRef}
                style={{
                    display: 'flex',
                    width: `${STEPS.length * 100}%`,
                    height: '100vh',
                    alignItems: 'center'
                }}
            >
                {STEPS.map((step, i) => (
                    <div
                        key={i}
                        className="step-section"
                        style={{
                            width: '100vw',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 10%',
                            flexShrink: 0,
                            overflow: 'hidden'
                        }}
                    >
                        {/* Left Side: Content */}
                        <div style={{ flex: 1, paddingRight: '100px' }}>
                            <div style={{
                                fontFamily: 'var(--font-dm-mono)',
                                fontSize: '14px',
                                color: 'var(--color-gold)',
                                marginBottom: '24px'
                            }}>
                                STEP {step.number}
                            </div>
                            <h2 style={{
                                fontFamily: 'var(--font-syne)',
                                fontSize: '48px',
                                fontWeight: 800,
                                marginBottom: '24px',
                                color: 'var(--color-text-primary)'
                            }}>
                                {step.title}
                            </h2>
                            <p style={{
                                fontFamily: 'var(--font-dm-mono)',
                                fontSize: '16px',
                                color: 'var(--color-text-secondary)',
                                lineHeight: 1.6,
                                maxWidth: '400px'
                            }}>
                                {step.description}
                            </p>
                        </div>

                        {/* Right Side: Visual */}
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            {step.visual === 'tasks' && (
                                <div
                                    className="premium-card"
                                    style={{
                                        width: '100%',
                                        maxWidth: '400px',
                                        backgroundColor: '#141416',
                                        padding: '32px',
                                        borderRadius: '12px',
                                        border: '1px solid #2A2A2E'
                                    }}
                                >
                                    {[1, 2, 3].map(j => (
                                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', opacity: j === 3 ? 0.3 : 1 }}>
                                            <div style={{ width: '20px', height: '20px', border: '1px solid var(--color-gold)', borderRadius: '4px', backgroundColor: j < 3 ? 'var(--color-gold)' : 'transparent' }} />
                                            <div style={{ width: j === 1 ? '60%' : '80%', height: '10px', backgroundColor: '#2A2A2E', borderRadius: '4px' }} />
                                        </div>
                                    ))}
                                </div>
                            )}
                            {step.visual === 'score' && (
                                <div style={{ position: 'relative', width: '300px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="300" height="300" viewBox="0 0 300 300" style={{ transform: 'rotate(-90deg)' }}>
                                        <circle cx="150" cy="150" r="130" fill="none" stroke="#2A2A2E" strokeWidth="10" />
                                        <circle cx="150" cy="150" r="130" fill="none" stroke="var(--color-gold)" strokeWidth="10" strokeDasharray="816" strokeDashoffset={816 * (1 - 0.85)} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px rgba(200, 184, 154, 0.4))' }} />
                                    </svg>
                                    <div style={{ position: 'absolute', textAlign: 'center' }}>
                                        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '64px', color: 'var(--color-text-primary)' }}>8.5</div>
                                        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>SCORE</div>
                                    </div>
                                </div>
                            )}
                            {step.visual === 'ai' && (
                                <div
                                    className="premium-card"
                                    style={{
                                        width: '100%',
                                        maxWidth: '400px',
                                        backgroundColor: '#141416',
                                        padding: '32px',
                                        borderRadius: '12px',
                                        border: '1px solid #2A2A2E',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--color-sage)', marginBottom: '16px' }}>DIRECTIVE_PATCH_04</div>
                                    <div style={{ width: '100%', height: '2px', backgroundColor: 'rgba(123, 158, 135, 0.2)', marginBottom: '24px' }} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ width: '100%', height: '8px', backgroundColor: '#2A2A2E', borderRadius: '4px' }} />
                                        <div style={{ width: '90%', height: '8px', backgroundColor: '#2A2A2E', borderRadius: '4px' }} />
                                        <div style={{ width: '70%', height: '8px', backgroundColor: '#2A2A2E', borderRadius: '4px' }} />
                                    </div>
                                    {/* Scanline effect */}
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '20px', background: 'linear-gradient(to bottom, transparent, rgba(123, 158, 135, 0.1), transparent)', animation: 'scan 4s linear infinite' }} />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </section>
            <style jsx>{`
                @keyframes scan {
                    0% { transform: translateY(-100px); }
                    100% { transform: translateY(400px); }
                }
            `}</style>
        </div>
    );
}
