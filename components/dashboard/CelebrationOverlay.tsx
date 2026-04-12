'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Achievement } from '@/types';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

interface CelebrationOverlayProps {
    achievement: Achievement | null;
    onDismiss: () => void;
}

export default function CelebrationOverlay({ achievement, onDismiss }: CelebrationOverlayProps) {
    const [show, setShow] = useState(false);
    const { width, height } = useWindowSize();

    useEffect(() => {
        if (achievement) {
            setShow(true);
        }
    }, [achievement]);

    if (!achievement) return null;

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.8, y: 40 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: 'spring',
                damping: 25,
                stiffness: 300,
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        },
        exit: {
            opacity: 0,
            scale: 0.9,
            y: -20,
            transition: { duration: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <AnimatePresence>
            {show && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.92)',
                    backdropFilter: 'blur(12px)',
                    pointerEvents: 'auto',
                    overflow: 'hidden'
                }}>
                    <Confetti
                        width={width}
                        height={height}
                        numberOfPieces={200}
                        recycle={false}
                        colors={['#C8B89A', '#D9D9D9', '#E6E6E6', '#B0A288']}
                    />

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        style={{
                            width: '90%',
                            maxWidth: '460px',
                            backgroundColor: '#141416',
                            border: '1px solid rgba(200, 184, 154, 0.4)',
                            borderRadius: '32px',
                            padding: '48px 32px',
                            textAlign: 'center',
                            boxShadow: '0 0 100px rgba(200, 184, 154, 0.15)',
                            position: 'relative',
                            zIndex: 10
                        }}
                    >
                        <motion.div
                            variants={itemVariants}
                            style={{
                                fontSize: '84px',
                                marginBottom: '24px',
                                filter: 'drop-shadow(0 0 30px rgba(200, 184, 154, 0.3))',
                                display: 'inline-block'
                            }}
                        >
                            {achievement.badge_emoji}
                        </motion.div>

                        <motion.h2
                            variants={itemVariants}
                            style={{
                                fontFamily: 'var(--font-syne)',
                                fontSize: '12px',
                                fontWeight: 800,
                                color: 'var(--color-gold)',
                                letterSpacing: '0.3em',
                                marginBottom: '8px',
                                textTransform: 'uppercase'
                            }}
                        >
                            NEW ACHIEVEMENT UNLOCKED
                        </motion.h2>

                        <motion.h1
                            variants={itemVariants}
                            style={{
                                fontFamily: 'var(--font-syne)',
                                fontSize: '32px',
                                fontWeight: 800,
                                color: 'var(--color-text-primary)',
                                marginBottom: '16px'
                            }}
                        >
                            {achievement.title}
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            style={{
                                fontFamily: 'var(--font-dm-mono)',
                                fontSize: '15px',
                                color: 'var(--color-text-secondary)',
                                lineHeight: '1.6',
                                marginBottom: '32px'
                            }}
                        >
                            "{achievement.message}"
                        </motion.p>

                        {achievement.ai_message && (
                            <motion.div
                                variants={itemVariants}
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                    border: '0.5px solid rgba(200, 184, 154, 0.2)',
                                    padding: '24px',
                                    borderRadius: '16px',
                                    textAlign: 'left',
                                    marginBottom: '40px',
                                    position: 'relative'
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    left: '20px',
                                    backgroundColor: '#141416',
                                    padding: '0 8px',
                                    fontSize: '10px',
                                    color: 'var(--color-gold)',
                                    fontWeight: 800,
                                    letterSpacing: '0.1em'
                                }}>
                                    AI COACH
                                </div>
                                <p style={{
                                    fontFamily: 'var(--font-dm-mono)',
                                    fontSize: '13px',
                                    color: 'var(--color-text-primary)',
                                    fontStyle: 'italic',
                                    lineHeight: '1.6'
                                }}>
                                    {achievement.ai_message}
                                </p>
                            </motion.div>
                        )}

                        <motion.button
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                setShow(false);
                                setTimeout(onDismiss, 400);
                            }}
                            className="btn-primary"
                            style={{
                                width: '100%',
                                padding: '18px',
                                fontSize: '14px',
                                fontWeight: 700,
                                letterSpacing: '0.15em',
                                borderRadius: '12px'
                            }}
                        >
                            CONTINUE ASCENT
                        </motion.button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
