'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Card from '@/components/ui/Card';

gsap.registerPlugin(ScrollTrigger);

const ACHIEVEMENTS = [
    { emoji: '🏅', label: '3 DAY STREAK' },
    { emoji: '☕', label: 'WEEK WARRIOR' },
    { emoji: '🍦', label: 'IRON MONTH' },
    { emoji: '👑', label: 'LEGENDARY' },
    { emoji: '🔥', label: 'ELITE OPERATOR' },
    { emoji: '🛡️', label: 'STEADFAST' },
    { emoji: '🏹', label: 'SURESHOT' }
];

export default function Achievements() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.fromTo(sectionRef.current,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.5,
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 90%",
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
                padding: '100px 0',
                backgroundColor: '#0E0E10',
                overflow: 'hidden'
            }}
        >
            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .marquee-container {
                    display: flex;
                    width: max-content;
                    animation: marquee 40s linear infinite;
                }
                .marquee-container:hover {
                    animation-play-state: paused;
                }
                .badge-card {
                    transition: border-color 0.2s ease;
                }
                .badge-card:hover {
                    border-color: var(--color-gold) !important;
                }
            `}</style>

            <div style={{
                fontFamily: 'var(--font-dm-mono)',
                fontSize: '10px',
                color: 'var(--color-text-muted)',
                letterSpacing: '0.2em',
                textAlign: 'center',
                marginBottom: '40px'
            }}>
                MILESTONES
            </div>

            <div className="marquee-container">
                {[...ACHIEVEMENTS, ...ACHIEVEMENTS].map((item, i) => (
                    <Card key={i} className="premium-card" style={{
                        padding: '16px 24px',
                        margin: '0 12px',
                        backgroundColor: '#141416',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        minWidth: '220px',
                        flexShrink: 0,
                        borderRadius: '10px',
                        border: '1px solid #2A2A2E'
                    }}>
                        <span style={{ fontSize: '28px' }}>{item.emoji}</span>
                        <span style={{
                            fontFamily: 'var(--font-dm-mono)',
                            fontSize: '11px',
                            color: 'var(--color-gold)',
                            letterSpacing: '0.05em'
                        }}>
                            {item.label}
                        </span>
                    </Card>
                ))}
            </div>
        </section>
    );
}
