'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PerformanceTier } from '@/types';

interface CloseDayModalProps {
    isOpen: boolean;
    score: number;
    tier: PerformanceTier;
    onConfirm: () => Promise<void>;
    onDismiss: () => void;
}

const TIER_DATA: Record<PerformanceTier, { label: string; color: string; glow: string; lines: string[] }> = {
    ELITE: {
        label: 'ELITE',
        color: '#C8B89A',
        glow: 'rgba(200, 184, 154, 0.4)',
        lines: [
            'You are operating at a level most people only dream about.',
            'This day will compound. Stack another one.',
        ],
    },
    OPTIMAL: {
        label: 'OPTIMAL',
        color: '#7B9E87',
        glow: 'rgba(123, 158, 135, 0.35)',
        lines: [
            'Solid execution. You showed up and you made it count.',
            'The gap between you and mediocrity widens every day like this.',
        ],
    },
    ACTIVE: {
        label: 'ACTIVE',
        color: '#C8B89A',
        glow: 'rgba(200, 184, 154, 0.2)',
        lines: [
            'You met the standard. Good — but standard is the floor, not the ceiling.',
            'Tomorrow, push one level higher.',
        ],
    },
    RECOVERING: {
        label: 'RECOVERING',
        color: '#E8A84C',
        glow: 'rgba(232, 168, 76, 0.3)',
        lines: [
            'Today was a warning. Complacency compounds too.',
            'You know exactly what you didn\'t do. Fix it tomorrow.',
        ],
    },
    CRITICAL: {
        label: 'CRITICAL FAILURE',
        color: '#BF7B7B',
        glow: 'rgba(191, 123, 123, 0.35)',
        lines: [
            'This is the version of you that falls behind.',
            'You can lie to yourself, but the score doesn\'t lie. Rebuild.',
        ],
    },
};


function AnimatedScore({ target }: { target: number }) {
    const [displayed, setDisplayed] = useState(0);

    useEffect(() => {
        const duration = 1800;
        const start = Date.now();

        const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayed(eased * target);
            if (progress < 1) requestAnimationFrame(tick);
        };

        const raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target]);

    const tierData = TIER_DATA[getStaticTier(displayed)];
    const radius = 90;
    const stroke = 9;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (displayed / 10) * circumference;

    return (
        <div style={{ position: 'relative', width: radius * 2, height: radius * 2, margin: '0 auto' }}>
            <svg height={radius * 2} width={radius * 2} style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}>
                <circle
                    stroke="rgba(255,255,255,0.05)"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke={tierData.color}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{
                        strokeDashoffset,
                        transition: 'stroke-dashoffset 0.05s linear',
                        filter: `drop-shadow(0 0 8px ${tierData.glow})`,
                    }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
                <span style={{
                    fontFamily: 'var(--font-syne)', fontSize: '42px', fontWeight: 800,
                    color: 'var(--color-text-primary)', lineHeight: 1,
                }}>
                    {displayed.toFixed(1)}
                </span>
                <span style={{
                    fontFamily: 'var(--font-dm-mono)', fontSize: '10px', fontWeight: 600,
                    letterSpacing: '0.12em', color: tierData.color, marginTop: '6px',
                }}>
                    / 10.0
                </span>
            </div>
        </div>
    );
}

function getStaticTier(score: number): PerformanceTier {
    if (score >= 9.0) return 'ELITE';
    if (score >= 7.5) return 'OPTIMAL';
    if (score >= 6.0) return 'ACTIVE';
    if (score >= 4.0) return 'RECOVERING';
    return 'CRITICAL';
}

export default function CloseDayModal({ isOpen, score, tier, onConfirm, onDismiss }: CloseDayModalProps) {
    const [step, setStep] = useState<'confirm' | 'reveal' | 'verdict'>('confirm');
    const [sealing, setSealing] = useState(false);
    const tierData = TIER_DATA[tier];

    // Reset step when modal opens
    useEffect(() => {
        if (isOpen) setStep('confirm');
    }, [isOpen]);

    const handleSeal = async () => {
        setSealing(true);
        setStep('reveal');
        await onConfirm();
        setSealing(false);
        // After 2.5s of score reveal, show verdict
        setTimeout(() => setStep('verdict'), 2500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        backgroundColor: 'rgba(0,0,0,0.96)',
                        backdropFilter: 'blur(20px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '24px',
                    }}
                >
                    {/* STEP 0: CONFIRM */}
                    <AnimatePresence mode="wait">
                        {step === 'confirm' && (
                            <motion.div
                                key="confirm"
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                                style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}
                            >
                                <div style={{
                                    fontSize: '56px', marginBottom: '32px',
                                    filter: 'drop-shadow(0 0 24px rgba(200,184,154,0.3))',
                                }}>
                                    🏁
                                </div>
                                <h2 style={{
                                    fontFamily: 'var(--font-syne)', fontWeight: 800,
                                    fontSize: '11px', letterSpacing: '0.35em',
                                    color: 'var(--color-text-muted)', marginBottom: '16px',
                                }}>
                                    SEAL TODAY'S LOG
                                </h2>
                                <h1 style={{
                                    fontFamily: 'var(--font-syne)', fontWeight: 800,
                                    fontSize: '28px', color: 'var(--color-text-primary)',
                                    marginBottom: '16px', lineHeight: 1.15,
                                }}>
                                    Are you ready to<br />face your score?
                                </h1>
                                <p style={{
                                    fontFamily: 'var(--font-dm-mono)', fontSize: '13px',
                                    color: 'var(--color-text-secondary)', lineHeight: 1.65,
                                    marginBottom: '40px',
                                }}>
                                    Once sealed, today's discipline is locked in.<br />
                                    No edits. No excuses.
                                </p>

                                <button
                                    onClick={handleSeal}
                                    disabled={sealing}
                                    className="btn-primary"
                                    style={{
                                        width: '100%', padding: '18px',
                                        fontSize: '14px', fontWeight: 800,
                                        letterSpacing: '0.2em', borderRadius: '10px',
                                        marginBottom: '12px',
                                        boxShadow: '0 0 40px rgba(200, 184, 154, 0.2)',
                                    }}
                                >
                                    SEAL THE DAY
                                </button>
                                <button
                                    onClick={onDismiss}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        fontFamily: 'var(--font-dm-mono)', fontSize: '11px',
                                        color: 'var(--color-text-muted)', letterSpacing: '0.1em',
                                        padding: '8px',
                                    }}
                                >
                                    NOT YET
                                </button>
                            </motion.div>
                        )}

                        {/* STEP 1: SCORE REVEAL */}
                        {step === 'reveal' && (
                            <motion.div
                                key="reveal"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                                style={{ textAlign: 'center', width: '100%', maxWidth: '360px' }}
                            >
                                <p style={{
                                    fontFamily: 'var(--font-dm-mono)', fontSize: '10px',
                                    letterSpacing: '0.3em', color: 'var(--color-text-muted)',
                                    marginBottom: '32px',
                                }}>
                                    TODAY'S PERFORMANCE
                                </p>
                                <AnimatedScore target={score} />
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.2 }}
                                    style={{
                                        fontFamily: 'var(--font-dm-mono)', fontSize: '11px',
                                        color: 'var(--color-text-muted)', marginTop: '24px',
                                        letterSpacing: '0.05em',
                                    }}
                                >
                                    tallying results...
                                </motion.p>
                            </motion.div>
                        )}

                        {/* STEP 2: VERDICT */}
                        {step === 'verdict' && (
                            <motion.div
                                key="verdict"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                                style={{
                                    width: '100%', maxWidth: '460px', textAlign: 'center',
                                    border: `0.5px solid ${tierData.color}22`,
                                    borderRadius: '24px',
                                    padding: '40px 32px',
                                    background: `radial-gradient(ellipse at top, ${tierData.glow}15 0%, transparent 70%)`,
                                    boxShadow: `0 0 80px ${tierData.glow}20`,
                                }}
                            >
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', damping: 18, stiffness: 300, delay: 0.1 }}
                                    style={{
                                        display: 'inline-block',
                                        border: `2px solid ${tierData.color}`,
                                        borderRadius: '8px',
                                        padding: '6px 16px',
                                        marginBottom: '24px',
                                        boxShadow: `0 0 24px ${tierData.glow}`,
                                    }}
                                >
                                    <span style={{
                                        fontFamily: 'var(--font-syne)', fontWeight: 800,
                                        fontSize: '13px', letterSpacing: '0.25em',
                                        color: tierData.color,
                                    }}>
                                        {tierData.label}
                                    </span>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.25 }}
                                    style={{ marginBottom: '16px' }}
                                >
                                    <span style={{
                                        fontFamily: 'var(--font-syne)', fontWeight: 800,
                                        fontSize: '64px', color: tierData.color,
                                        lineHeight: 1,
                                        filter: `drop-shadow(0 0 20px ${tierData.glow})`,
                                    }}>
                                        {score.toFixed(1)}
                                    </span>
                                </motion.div>

                                {tierData.lines.map((line, i) => (
                                    <motion.p
                                        key={i}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 + i * 0.15 }}
                                        style={{
                                            fontFamily: 'var(--font-dm-mono)',
                                            fontSize: i === 0 ? '15px' : '13px',
                                            color: i === 0 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                                            lineHeight: 1.65,
                                            marginBottom: '8px',
                                            fontStyle: i === 1 ? 'italic' : 'normal',
                                        }}
                                    >
                                        {line}
                                    </motion.p>
                                ))}

                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onDismiss}
                                    className="btn-primary"
                                    style={{
                                        width: '100%', padding: '16px',
                                        fontSize: '13px', fontWeight: 800,
                                        letterSpacing: '0.2em', borderRadius: '10px',
                                        marginTop: '32px',
                                    }}
                                >
                                    CONTINUE →
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
