'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

export default function FinalCTA() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.fromTo(".cta-content",
                { y: 60, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1.5,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 80%",
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            style={{
                padding: '160px 8%',
                backgroundColor: '#141416',
                borderTop: '1px solid var(--color-border)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Subtle radial warmth */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(200, 184, 154, 0.08) 0%, transparent 60%)',
                pointerEvents: 'none'
            }} />

            <div className="cta-content" style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{
                    fontFamily: 'var(--font-syne)',
                    fontWeight: 800,
                    fontSize: '56px',
                    color: 'var(--color-text-primary)',
                    marginBottom: '40px',
                    lineHeight: 1.1
                }}>
                    Stop tracking.<br />
                    Start becoming.
                </h2>
                <Link
                    href="/onboarding"
                    style={{
                        display: 'inline-block',
                        fontFamily: 'var(--font-syne)',
                        fontWeight: 700,
                        fontSize: '14px',
                        letterSpacing: '0.1em',
                        color: '#0E0E10',
                        background: 'linear-gradient(135deg, #C8B89A, #E8A84C)',
                        borderRadius: '6px',
                        padding: '20px 60px',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 24px rgba(200, 184, 154, 0.25)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.filter = 'brightness(1.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.filter = 'none';
                        e.currentTarget.style.transform = 'none';
                    }}
                >
                    INITIALIZE SYSTEM
                </Link>
                <div style={{
                    fontFamily: 'var(--font-dm-mono)',
                    fontSize: '10px',
                    color: 'var(--color-text-muted)',
                    marginTop: '24px',
                    letterSpacing: '0.2em'
                }}>
                    COMMAND YOUR EVOLUTION
                </div>
            </div>
        </section>
    );
}
