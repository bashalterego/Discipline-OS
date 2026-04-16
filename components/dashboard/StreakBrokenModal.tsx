'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StreakBrokenModalProps {
    isOpen: boolean;
    longestStreak: number;
    previousStreak: number; // the streak that just broke
    onDismiss: () => void;
}

export default function StreakBrokenModal({ isOpen, longestStreak, previousStreak, onDismiss }: StreakBrokenModalProps) {
    const [displayed, setDisplayed] = useState(previousStreak);

    // Animate counter DOWN from previousStreak to 0
    useEffect(() => {
        if (!isOpen || previousStreak === 0) return;
        const duration = 1200;
        const start = Date.now();
        const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = Math.pow(1 - progress, 2);
            setDisplayed(Math.round(eased * previousStreak));
            if (progress < 1) requestAnimationFrame(tick);
        };
        const delay = setTimeout(() => requestAnimationFrame(tick), 800);
        return () => clearTimeout(delay);
    }, [previousStreak, isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        backgroundColor: 'rgba(10, 4, 4, 0.97)',
                        backdropFilter: 'blur(24px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '24px',
                    }}
                >
                    {/* ... rest of the component content ... */}
                    {/* Red ambient glow */}
                    <div style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none',
                        background: 'radial-gradient(ellipse at center, rgba(191,70,70,0.08) 0%, transparent 65%)',
                    }} />

                    <motion.div
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                        style={{ width: '100%', maxWidth: '440px', textAlign: 'center', position: 'relative' }}
                    >
                        {/* Emoji */}
                        <motion.div
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 0.15 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            style={{
                                position: 'absolute', top: '-60px', left: '50%',
                                transform: 'translateX(-50%)',
                                fontSize: '120px', lineHeight: 1, pointerEvents: 'none',
                                filter: 'grayscale(1)',
                            }}
                        >
                            🔥
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                fontFamily: 'var(--font-dm-mono)', fontSize: '10px',
                                letterSpacing: '0.35em', color: 'rgba(191,123,123,0.7)',
                                marginBottom: '20px',
                            }}
                        >
                            STREAK BROKEN
                        </motion.p>

                        {/* Streak count-down */}
                        <div style={{ marginBottom: '8px', position: 'relative', minHeight: '90px' }}>
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                style={{
                                    fontFamily: 'var(--font-syne)', fontWeight: 800,
                                    fontSize: '88px', lineHeight: 1,
                                    color: displayed === 0 ? '#BF7B7B' : 'var(--color-text-primary)',
                                    transition: 'color 0.3s ease',
                                    display: 'block',
                                }}
                            >
                                {displayed}
                            </motion.span>
                        </div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            style={{
                                fontFamily: 'var(--font-dm-mono)', fontSize: '12px',
                                letterSpacing: '0.12em', color: 'rgba(191,123,123,0.6)',
                                marginBottom: '40px',
                            }}
                        >
                            DAYS — GONE
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.4 }}
                        >
                            <p style={{
                                fontFamily: 'var(--font-syne)', fontWeight: 800,
                                fontSize: '22px', color: 'var(--color-text-primary)',
                                lineHeight: 1.3, marginBottom: '16px',
                            }}>
                                You broke the chain.
                            </p>
                            <p style={{
                                fontFamily: 'var(--font-dm-mono)', fontSize: '14px',
                                color: 'var(--color-text-secondary)', lineHeight: 1.7,
                                marginBottom: '8px',
                            }}>
                                {previousStreak} days of work, erased by one day of silence.
                            </p>
                            <p style={{
                                fontFamily: 'var(--font-dm-mono)', fontSize: '13px',
                                color: 'rgba(191,123,123,0.8)', lineHeight: 1.7,
                                fontStyle: 'italic',
                                marginBottom: '8px',
                            }}>
                                Nobody is coming to fix this for you.
                            </p>
                            {longestStreak > previousStreak && (
                                <p style={{
                                    fontFamily: 'var(--font-dm-mono)', fontSize: '11px',
                                    color: 'var(--color-text-muted)', lineHeight: 1.7,
                                    marginTop: '4px',
                                }}>
                                    Your record was {longestStreak} days. You know it's possible.
                                </p>
                            )}
                        </motion.div>

                        {/* Bottom divider shimmer */}
                        <motion.div
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ scaleX: 1, opacity: 1 }}
                            transition={{ delay: 1.8, duration: 0.6 }}
                            style={{
                                height: '1px', margin: '32px 0',
                                background: 'linear-gradient(90deg, transparent, rgba(191,123,123,0.4), transparent)',
                            }}
                        />

                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2.1 }}
                            whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(191,123,123,0.3)' }}
                            whileTap={{ scale: 0.97 }}
                            onClick={onDismiss}
                            style={{
                                width: '100%', padding: '18px',
                                backgroundColor: 'transparent',
                                border: '1px solid rgba(191,123,123,0.5)',
                                borderRadius: '10px',
                                fontFamily: 'var(--font-syne)', fontWeight: 800,
                                fontSize: '14px', letterSpacing: '0.25em',
                                color: '#BF7B7B', cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            START AGAIN
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
