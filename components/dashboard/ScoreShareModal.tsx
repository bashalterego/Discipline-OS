'use client';

import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import PerformanceRing from '@/components/dashboard/PerformanceRing';
import type { PerformanceTier } from '@/types';

interface ScoreShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    score: number;
    tier: PerformanceTier;
    userName: string;
    archetype?: string | null;
}

export default function ScoreShareModal({
    isOpen,
    onClose,
    score,
    tier,
    userName,
    archetype
}: ScoreShareModalProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [generating, setGenerating] = useState(false);

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setGenerating(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: '#0E0E10',
                scale: 2,
                logging: false,
                useCORS: true
            });
            const link = document.createElement('a');
            link.download = `discipline-os-score-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Failed to generate image:', err);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="SHARE YOUR PROGRESS">
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>

                {/* Exportable Card Area */}
                <div ref={cardRef} style={{
                    width: '320px',
                    height: '320px',
                    backgroundColor: '#0E0E10',
                    border: '1px solid #C8B89A',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    padding: '24px'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0.03,
                        pointerEvents: 'none',
                        background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                    }} />

                    <PerformanceRing score={score} tier={tier} />

                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-syne)', fontSize: '10px', color: '#C8B89A', letterSpacing: '0.2em' }}>
                            {userName.toUpperCase()}
                        </div>
                        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>
                            {archetype?.toUpperCase() || 'WARRIOR'}
                        </div>
                    </div>

                    <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        fontFamily: 'var(--font-syne)',
                        fontSize: '8px',
                        color: 'rgba(255,255,255,0.2)',
                        letterSpacing: '0.1em'
                    }}>
                        DISCIPLINE-OS.NET
                    </div>
                </div>

                <div style={{ width: '100%', display: 'flex', gap: '12px' }}>
                    <Button
                        variant="primary"
                        onClick={handleDownload}
                        className="flex-1"
                        disabled={generating}
                    >
                        {generating ? 'GENERATING...' : 'DOWNLOAD CARD'}
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                        CLOSE
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
