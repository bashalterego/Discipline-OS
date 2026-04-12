'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Achievement } from '@/types';

interface ToastAchievementProps {
    achievement: Achievement | null;
    onDismiss: () => void;
}

export default function ToastAchievement({ achievement, onDismiss }: ToastAchievementProps) {
    const [show, setShow] = useState(false);
    const duration = 5000; // 5 seconds

    useEffect(() => {
        if (achievement) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
                setTimeout(onDismiss, 500);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [achievement, onDismiss]);

    if (!achievement) return null;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ x: 400, opacity: 0, scale: 0.9 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    exit={{ x: 400, opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 150 }}
                    style={{
                        position: 'fixed',
                        bottom: '32px',
                        right: '32px',
                        zIndex: 10000,
                        width: '340px',
                        backgroundColor: 'rgba(20, 20, 22, 0.8)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(200, 184, 154, 0.3)',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'center',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        pointerEvents: 'auto',
                        overflow: 'hidden'
                    }}
                >
                    {/* Background Progress Bar */}
                    <motion.div
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: duration / 1000, ease: 'linear' }}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            height: '2px',
                            backgroundColor: 'var(--color-gold)',
                            opacity: 0.5
                        }}
                    />

                    <div style={{
                        fontSize: '36px',
                        filter: 'drop-shadow(0 0 10px rgba(200, 184, 154, 0.2))'
                    }}>
                        {achievement.badge_emoji}
                    </div>

                    <div style={{ flex: 1 }}>
                        <h4 style={{
                            fontFamily: 'var(--font-syne)',
                            fontSize: '11px',
                            fontWeight: 800,
                            color: 'var(--color-gold)',
                            letterSpacing: '0.15em',
                            marginBottom: '4px',
                            textTransform: 'uppercase'
                        }}>
                            ACHIEVEMENT UNLOCKED
                        </h4>
                        <h3 style={{
                            fontFamily: 'var(--font-syne)',
                            fontSize: '16px',
                            fontWeight: 800,
                            color: 'var(--color-text-primary)',
                            marginBottom: '4px'
                        }}>
                            {achievement.title}
                        </h3>
                        <p style={{
                            fontFamily: 'var(--font-dm-mono)',
                            fontSize: '11px',
                            color: 'var(--color-text-secondary)',
                            lineHeight: '1.4'
                        }}>
                            {achievement.message}
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setShow(false);
                            setTimeout(onDismiss, 500);
                        }}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        ×
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
