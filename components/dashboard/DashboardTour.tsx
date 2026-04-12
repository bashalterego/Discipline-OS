'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TOUR_STEPS = [
    {
        target: 'performance-ring',
        title: 'THE SCORE',
        content: 'Your real-time discipline score. Maintain 8.5+ for ELITE status.'
    },
    {
        target: 'task-checklist',
        title: 'DAILY SYSTEMS',
        content: 'Your non-negotiable commitments. Check these off as you execute.'
    },
    {
        target: 'finance-log',
        title: 'FINANCIAL COMMAND',
        content: 'Discipline includes your resources. Track your flow right here.'
    },
    {
        target: 'reflection',
        title: 'EVENING REFLECTION',
        content: 'Close your day by documenting your wins and failures.'
    }
];

export default function DashboardTour({ onFinish }: { onFinish: () => void }) {
    const [step, setStep] = useState(0);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

    useEffect(() => {
        const updateCoords = () => {
            const targetId = TOUR_STEPS[step].target;
            const element = document.getElementById(targetId);
            if (element) {
                const rect = element.getBoundingClientRect();
                setCoords({
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    height: rect.height
                });
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };

        updateCoords();
        window.addEventListener('resize', updateCoords);
        return () => window.removeEventListener('resize', updateCoords);
    }, [step]);

    const next = () => {
        if (step < TOUR_STEPS.length - 1) {
            setStep(s => s + 1);
        } else {
            onFinish();
        }
    };

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, pointerEvents: 'none' }}>
            {/* Backdrop with hole */}
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.7)',
                clipPath: `polygon(0% 0%, 0% 100%, ${coords.left}px 100%, ${coords.left}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top + coords.height}px, ${coords.left}px ${coords.top + coords.height}px, ${coords.left}px 100%, 100% 100%, 100% 0%)`,
                transition: 'clip-path 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: 'auto'
            }} />

            {/* Tooltip */}
            <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    position: 'absolute',
                    top: coords.top + coords.height + 20,
                    left: Math.max(20, Math.min(window.innerWidth - 300, coords.left + (coords.width / 2) - 140)),
                    width: '280px',
                    padding: '24px',
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-gold)',
                    borderRadius: '12px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                    pointerEvents: 'auto',
                    zIndex: 10000
                }}
            >
                <h4 style={{ fontFamily: 'var(--font-syne)', fontSize: '14px', fontWeight: 800, color: 'var(--color-gold)', letterSpacing: '0.1em', marginBottom: '8px' }}>
                    {TOUR_STEPS[step].title}
                </h4>
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5', marginBottom: '20px' }}>
                    {TOUR_STEPS[step].content}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-dm-mono)' }}>
                            {step + 1} / {TOUR_STEPS.length}
                        </div>
                        <button
                            onClick={onFinish}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--color-text-muted)',
                                fontSize: '9px',
                                fontFamily: 'var(--font-dm-mono)',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                padding: 0
                            }}
                        >
                            CLOSE
                        </button>
                    </div>
                    <button
                        onClick={next}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'var(--color-gold)',
                            color: '#0E0E10',
                            border: 'none',
                            borderRadius: '4px',
                            fontFamily: 'var(--font-syne)',
                            fontWeight: 700,
                            fontSize: '11px',
                            cursor: 'pointer'
                        }}
                    >
                        {step === TOUR_STEPS.length - 1 ? 'LETS GO' : 'NEXT'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
