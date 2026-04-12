'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STATS = [
    { value: 10.0, label: 'Maximum discipline score', prefix: '' },
    { value: 90, label: 'Days to build a new identity', prefix: '' },
    { value: 3, label: 'Points for full self control', prefix: '' }
];

export default function Stats() {
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
                        start: "top 80%",
                    }
                }
            );

            gsap.from(".stat-number", {
                textContent: 0,
                duration: 2.5,
                ease: "power2.out",
                snap: { textContent: 0.1 },
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 70%",
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            style={{
                padding: '120px 8%',
                backgroundColor: '#0E0E10',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '40px',
                textAlign: 'center'
            }}
        >
            {STATS.map((stat, i) => (
                <div key={i}>
                    <div
                        className="stat-number"
                        style={{
                            fontFamily: 'var(--font-syne)',
                            fontWeight: 800,
                            fontSize: '72px',
                            color: 'var(--color-gold)',
                            lineHeight: 1
                        }}
                    >
                        {stat.value}
                    </div>
                    <div style={{
                        height: '2px',
                        width: '40px',
                        backgroundColor: 'var(--color-gold)',
                        margin: '12px auto 20px',
                        opacity: 0.6
                    }} />
                    <div style={{
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: '12px',
                        color: 'var(--color-text-muted)',
                        maxWidth: '200px',
                        margin: '0 auto',
                        lineHeight: 1.5
                    }}>
                        {stat.label.toUpperCase()}
                    </div>
                </div>
            ))}
        </section>
    );
}
