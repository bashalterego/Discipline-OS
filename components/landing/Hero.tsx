'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Link from 'next/link';

export default function Hero() {
    const scoreRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<SVGCircleElement>(null);

    useEffect(() => {
        // Animation for the score number
        const scoreObj = { value: 0 };
        gsap.to(scoreObj, {
            value: 9.2,
            duration: 2,
            ease: "power2.out",
            onUpdate: () => {
                if (scoreRef.current) {
                    scoreRef.current.textContent = scoreObj.value.toFixed(1);
                }
            }
        });

        // Animation for the ring fill
        if (ringRef.current) {
            const circumference = 2 * Math.PI * 180; // r=180
            gsap.fromTo(ringRef.current,
                { strokeDashoffset: circumference },
                {
                    strokeDashoffset: circumference * (1 - 0.92), // fill 92%
                    duration: 2,
                    ease: "power2.out"
                }
            );
        }
    }, []);

    return (
        <section
            style={{
                height: '100vh',
                width: '100%',
                backgroundColor: '#0E0E10',
                display: 'flex',
                alignItems: 'center',
                padding: '0 8%',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Background Noise Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0.03,
                pointerEvents: 'none',
                background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }} />

            {/* Left Content */}
            <div style={{ flex: 1, zIndex: 1, position: 'relative' }}>
                <h1 style={{
                    fontFamily: 'var(--font-syne)',
                    fontWeight: 800,
                    fontSize: '72px',
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.1,
                    marginBottom: '20px'
                }}>
                    Your discipline.<br />
                    <span className="gradient-text">Quantified.</span>
                </h1>
                <p style={{
                    fontFamily: 'var(--font-dm-mono)',
                    fontSize: '16px',
                    color: 'var(--color-text-secondary)',
                    maxWidth: '480px',
                    lineHeight: 1.7,
                    marginBottom: '40px'
                }}>
                    A personal operating system for people who refuse to be average.
                    Real behavioral data meets AI-driven evolution.
                </p>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Link
                        href="/onboarding"
                        style={{
                            fontFamily: 'var(--font-syne)',
                            fontWeight: 700,
                            fontSize: '13px',
                            letterSpacing: '0.06em',
                            color: '#0E0E10',
                            background: 'linear-gradient(135deg, #C8B89A, #E8A84C)',
                            borderRadius: '6px',
                            padding: '16px 40px',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 24px rgba(200, 184, 154, 0.25)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.filter = 'brightness(1.1)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.filter = 'none';
                            e.currentTarget.style.transform = 'none';
                        }}
                    >
                        START YOUR SYSTEM
                    </Link>
                    <Link
                        href="#how-it-works"
                        style={{
                            fontFamily: 'var(--font-syne)',
                            fontWeight: 600,
                            fontSize: '13px',
                            letterSpacing: '0.06em',
                            color: 'var(--color-gold)',
                            background: 'transparent',
                            border: '1px solid var(--color-gold)',
                            borderRadius: '6px',
                            padding: '16px 40px',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(200, 184, 154, 0.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        SEE HOW IT WORKS
                    </Link>
                </div>
            </div>

            {/* Right Content: SVG Score Ring */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                {/* Hero Background Glow */}
                <div style={{
                    position: 'absolute',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(200, 184, 154, 0.08) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />

                <div
                    className="rotate-slow"
                    style={{
                        width: '400px',
                        height: '400px',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1
                    }}
                >
                    <svg width="400" height="400" viewBox="0 0 400 400" style={{ transform: 'rotate(-90deg)' }}>
                        {/* Track */}
                        <circle
                            cx="200"
                            cy="200"
                            r="180"
                            fill="none"
                            stroke="#2A2A2E"
                            strokeWidth="12"
                        />
                        {/* Fill */}
                        <circle
                            ref={ringRef}
                            cx="200"
                            cy="200"
                            r="180"
                            fill="none"
                            stroke="var(--color-gold)"
                            strokeWidth="12"
                            strokeDasharray={`${2 * Math.PI * 180}`}
                            strokeLinecap="round"
                            style={{ filter: 'drop-shadow(0 0 8px rgba(200, 184, 154, 0.4))' }}
                        />
                    </svg>
                </div>

                {/* Content Overlay - Not rotating */}
                <div style={{
                    position: 'absolute',
                    textAlign: 'center',
                    pointerEvents: 'none'
                }}>
                    <div
                        ref={scoreRef}
                        style={{
                            fontFamily: 'var(--font-syne)',
                            fontSize: '84px',
                            fontWeight: 800,
                            color: 'var(--color-text-primary)',
                            lineHeight: 1
                        }}
                    >
                        0.0
                    </div>
                    <div style={{
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: '11px',
                        color: 'var(--color-text-muted)',
                        letterSpacing: '0.2em',
                        marginTop: '8px'
                    }}>
                        DISCIPLINE SCORE
                    </div>
                </div>

                {/* Subtle Glow */}
                <div style={{
                    position: 'absolute',
                    width: '350px',
                    height: '350px',
                    background: 'radial-gradient(circle, rgba(200, 184, 154, 0.05) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none'
                }} />
            </div>

            <style jsx>{`
                @keyframes rotate-360 {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .rotate-slow {
                    animation: rotate-360 20s linear infinite;
                }
            `}</style>
        </section>
    );
}
