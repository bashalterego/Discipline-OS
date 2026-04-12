'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Card from '@/components/ui/Card';

gsap.registerPlugin(ScrollTrigger);

export default function DashboardPreview() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const mockupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            // Floating animation
            gsap.to(mockupRef.current, {
                y: -12,
                duration: 3,
                ease: "power1.inOut",
                repeat: -1,
                yoyo: true
            });

            // Section-level fade
            gsap.fromTo(sectionRef.current,
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: 1.5,
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 85%",
                    }
                }
            );

            // Scroll entry for mockup
            gsap.fromTo(mockupRef.current,
                { y: 80, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 75%",
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
                padding: '120px 8%',
                backgroundColor: '#0E0E10',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflow: 'hidden'
            }}
        >
            <div style={{
                fontFamily: 'var(--font-dm-mono)',
                fontSize: '10px',
                color: 'var(--color-gold)',
                letterSpacing: '0.2em',
                marginBottom: '20px'
            }}>
                YOUR COMMAND CENTER
            </div>

            <div ref={mockupRef} style={{ width: '100%', maxWidth: '1000px', position: 'relative' }}>
                <Card
                    className="premium-card"
                    style={{
                        padding: '0',
                        backgroundColor: '#141416',
                        borderRadius: '12px',
                        boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
                        border: '1px solid var(--color-border)',
                        overflow: 'hidden',
                        display: 'flex',
                        height: '600px',
                        textAlign: 'left'
                    }}
                >
                    {/* Mock Sidebar */}
                    <div style={{ width: '200px', height: '100%', borderRight: '1px solid #1E1E22', padding: '24px', backgroundColor: '#141416' }}>
                        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '11px', color: 'var(--color-gold)', letterSpacing: '0.1em', marginBottom: '32px' }}>
                            DISCIPLINE_OS
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {['Dashboard', 'Tasks', 'Finance', 'Analytics', 'Streaks'].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: i === 0 ? 1 : 0.4 }}>
                                    {i === 0 && <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-gold)' }} />}
                                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: '12px', color: i === 0 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>{item}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div style={{ flex: 1, backgroundColor: '#0E0E10', display: 'flex', flexDirection: 'column' }}>
                        {/* Mock Top Bar */}
                        <div style={{ height: '60px', borderBottom: '1px solid #1E1E22', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
                            <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                                APRIL 12, 2026 — GOOD MORNING, COMMANDER
                            </div>
                            <div style={{ padding: '4px 12px', border: '1px solid var(--color-sage)', borderRadius: '20px', color: 'var(--color-sage)', fontSize: '9px', fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.1em' }}>
                                SYSTEM ACTIVE
                            </div>
                        </div>

                        {/* Module Grid */}
                        <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: '24px' }}>

                            {/* Score Ring Card */}
                            <div
                                className="premium-card"
                                style={{
                                    backgroundColor: '#141416',
                                    border: '1px solid #2A2A2E',
                                    borderRadius: '10px',
                                    padding: '24px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '16px'
                                }}
                            >
                                <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                                        <circle cx="60" cy="60" r="50" fill="none" stroke="#2A2A2E" strokeWidth="6" />
                                        <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-gold)" strokeWidth="6" strokeDasharray="314" strokeDashoffset={314 * (1 - 0.75)} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 4px rgba(200, 184, 154, 0.4))' }} />
                                    </svg>
                                    <div style={{ position: 'absolute', fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '24px' }}>7.5</div>
                                </div>
                                <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>CURRENT SCORE</div>
                            </div>

                            {/* Task List Card */}
                            <div style={{ backgroundColor: '#141416', border: '1px solid #2A2A2E', borderRadius: '10px', padding: '24px' }}>
                                <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--color-gold)', marginBottom: '16px' }}>DAILY CAPABILITIES</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        { label: 'Deep Work (4 Hours)', done: true },
                                        { label: 'No Processed Sugar', done: true },
                                        { label: 'Morning Physical Protocol', done: true },
                                        { label: 'Finance Log Sync', done: false },
                                        { label: 'System Reflection', done: false }
                                    ].map((task, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '16px',
                                                height: '16px',
                                                border: '1px solid ' + (task.done ? 'var(--color-sage)' : '#2A2A2E'),
                                                backgroundColor: task.done ? 'var(--color-sage)' : 'transparent',
                                                borderRadius: '3px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {task.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
                                            </div>
                                            <div style={{
                                                fontFamily: 'var(--font-dm-mono)',
                                                fontSize: '12px',
                                                textDecoration: task.done ? 'line-through' : 'none',
                                                opacity: task.done ? 0.3 : 0.8
                                            }}>
                                                {task.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Finance Card */}
                            <div style={{ backgroundColor: '#141416', border: '1px solid #2A2A2E', borderRadius: '10px', padding: '24px', gridColumn: 'span 2' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--color-gold)' }}>LIQUIDITY TRACKER</div>
                                    <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--color-text-muted)' }}>NET: + ₹12,450</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                    {[
                                        { label: 'COFFEE PROTOCOL', val: '- ₹250', type: 'out' },
                                        { label: 'EQUITY DIVIDEND', val: '+ ₹4,200', type: 'in' },
                                        { label: 'SERVER RENEWAL', val: '- ₹1,100', type: 'out' }
                                    ].map((f, i) => (
                                        <div key={i} style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid #1E1E22' }}>
                                            <div style={{ fontSize: '8px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{f.label}</div>
                                            <div style={{ fontSize: '14px', fontFamily: 'var(--font-syne)', fontWeight: 700, color: f.type === 'in' ? 'var(--color-sage)' : 'var(--color-text-primary)' }}>{f.val}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </Card>
            </div>
        </section>
    );
}
