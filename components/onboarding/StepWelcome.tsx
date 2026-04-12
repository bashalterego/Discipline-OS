'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SLIDES = [
    {
        title: 'THE DISCIPLINE RING',
        description: 'Your daily score is calculated in real-time. Aim for the GOLD (8.5+).',
        type: 'score'
    },
    {
        title: 'DAILY SYSTEMS',
        description: 'A strict checklist of non-negotiable actions that define your day.',
        type: 'checklist'
    },
    {
        title: 'SELF CONTROL',
        description: 'Track internal battles. Food, focus, and urges. Points for every win.',
        type: 'selfctrl'
    },
    {
        title: 'STREAK IGNITION',
        description: 'Consistency builds character. Protect the flame at all costs.',
        type: 'streak'
    },
    {
        title: 'FINANCIAL COMMAND',
        description: 'Discipline across all domains. Track your resources alongside your grit.',
        type: 'finance'
    }
];

export default function StepWelcome({ onComplete }: { onComplete: () => void }) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const next = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(s => s + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div style={{ textAlign: 'center', minHeight: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div style={{ height: '140px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {currentSlide === 0 && <ScoreAnimation />}
                        {currentSlide === 1 && <ChecklistAnimation />}
                        {currentSlide === 2 && <SelfCtrlAnimation />}
                        {currentSlide === 3 && <StreakAnimation />}
                        {currentSlide === 4 && <FinanceAnimation />}
                    </div>

                    <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: '18px', fontWeight: 800, color: 'var(--color-gold)', letterSpacing: '0.1em', marginBottom: '12px' }}>
                        {SLIDES[currentSlide].title}
                    </h2>
                    <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: '1.6', maxWidth: '320px', margin: '0 auto 32px' }}>
                        {SLIDES[currentSlide].description}
                    </p>
                </motion.div>
            </AnimatePresence>

            <button
                onClick={next}
                className="btn-primary"
                style={{ alignSelf: 'center', width: '240px' }}
            >
                {currentSlide === SLIDES.length - 1 ? "LET'S BUILD YOUR SYSTEM" : 'NEXT'}
            </button>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '24px' }}>
                {SLIDES.map((_, i) => (
                    <div
                        key={i}
                        style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            backgroundColor: i === currentSlide ? 'var(--color-gold)' : 'var(--color-border)',
                            transition: 'all 0.3s'
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

function ScoreAnimation() {
    return (
        <div style={{ position: 'relative', width: '100px', height: '100px' }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-border)" strokeWidth="4" />
                <motion.circle
                    cx="50" cy="50" r="45" fill="none" stroke="var(--color-gold)" strokeWidth="4" strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 0.85 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-syne)', fontWeight: 800 }}>
                8.5
            </div>
        </div>
    );
}

function ChecklistAnimation() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '160px' }}>
            {[0, 1, 2].map(i => (
                <motion.div
                    key={i}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.2 }}
                    style={{ height: '24px', backgroundColor: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--color-border)', borderRadius: '4px', display: 'flex', alignItems: 'center', padding: '0 8px' }}
                >
                    <motion.div
                        animate={{ backgroundColor: i === 0 ? 'var(--color-sage)' : 'rgba(0,0,0,0)' }}
                        transition={{ delay: 0.8 + i * 0.2 }}
                        style={{ width: '8px', height: '8px', border: '1px solid var(--color-border)', borderRadius: '2px', marginRight: '8px' }}
                    />
                    <div style={{ height: '4px', width: '60px', backgroundColor: 'var(--color-border)', borderRadius: '2px' }} />
                </motion.div>
            ))}
        </div>
    );
}

function SelfCtrlAnimation() {
    return (
        <div style={{ display: 'flex', gap: '12px' }}>
            {[0, 1, 2, 3].map(i => (
                <motion.div
                    key={i}
                    animate={{
                        scale: [1, 1.2, 1],
                        backgroundColor: i <= 2 ? 'var(--color-gold)' : 'rgba(0,0,0,0)'
                    }}
                    transition={{ delay: i * 0.3 }}
                    style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid var(--color-gold)' }}
                />
            ))}
        </div>
    );
}

function StreakAnimation() {
    return (
        <div style={{ position: 'relative' }}>
            <motion.div
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ fontSize: '48px' }}
            >
                🔥
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: '8px', fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '24px' }}
            >
                12
            </motion.div>
        </div>
    );
}

function FinanceAnimation() {
    return (
        <div style={{ width: '180px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--color-border)', borderRadius: '8px', textAlign: 'left' }}>
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>CASH ON HAND</div>
            <motion.div
                animate={{ color: ['var(--color-text-primary)', 'var(--color-sage)', 'var(--color-text-primary)'] }}
                style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '18px', fontWeight: 600 }}
            >
                $ 4,250.00
            </motion.div>
            <div style={{ height: '8px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '40px', height: '4px', backgroundColor: 'var(--color-sage)', borderRadius: '2px' }} />
                <div style={{ width: '40px', height: '4px', backgroundColor: 'var(--color-red)', borderRadius: '2px' }} />
            </div>
        </div>
    );
}
