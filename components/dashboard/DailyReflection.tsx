'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Card from '@/components/ui/Card';
import { useDashboardStore } from '@/store/useDashboardStore';

const CloseDayModal = dynamic(() => import('@/components/dashboard/CloseDayModal'), { ssr: false });

interface DailyReflectionProps {
    initialText: string | null;
}

export default function DailyReflection({ initialText }: DailyReflectionProps) {
    const { dailyLog, score, tier, closeLog, isEditing, startEditLog, saveEditedLog } = useDashboardStore();
    const [text, setText] = useState(initialText || '');
    const [saving, setSaving] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);

    const handleBlur = async () => {
        if (isEditing) return;
        setSaving(true);
        try {
            await fetch('/api/dashboard/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'reflection', payload: { text } }),
            });
        } catch (err) {
            console.error('Failed to sync reflection:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (dailyLog) dailyLog.reflection = text;
            await saveEditedLog();
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Card id="reflection" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{
                        fontFamily: 'var(--font-syne)',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'var(--color-text-muted)',
                        letterSpacing: '0.1em',
                    }}>
                        DAILY REFLECTION
                    </h3>
                    {(saving || isEditing) && (
                        <span style={{
                            fontFamily: 'var(--font-dm-mono)',
                            fontSize: '9px',
                            color: isEditing ? 'var(--color-amber)' : 'var(--color-gold)'
                        }}>
                            {isEditing ? 'EDITING MODE' : 'SAVING...'}
                        </span>
                    )}
                </div>

                {isEditing && (
                    <div style={{
                        backgroundColor: 'rgba(255, 191, 0, 0.1)',
                        border: '0.5px solid var(--color-amber)',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{ fontSize: '14px' }}>⚠️</span>
                        <span style={{
                            fontFamily: 'var(--font-dm-mono)',
                            fontSize: '11px',
                            color: 'var(--color-amber)',
                            letterSpacing: '0.02em'
                        }}>
                            You are editing a closed log — save changes when done.
                        </span>
                    </div>
                )}

                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onBlur={handleBlur}
                    readOnly={dailyLog?.log_closed && !isEditing}
                    placeholder="How was your day? Any failures or wins?"
                    rows={5}
                    style={{
                        width: '100%',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '0.5px solid var(--color-border)',
                        borderRadius: '6px',
                        padding: '12px',
                        color: 'var(--color-text-primary)',
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: '13px',
                        lineHeight: 1.6,
                        outline: 'none',
                        resize: 'none',
                        marginBottom: '16px'
                    }}
                />

                <button
                    onClick={isEditing ? handleSave : (dailyLog?.log_closed ? startEditLog : () => setShowCloseModal(true))}
                    disabled={saving}
                    className={dailyLog?.log_closed && !isEditing ? 'btn-outline' : 'btn-primary'}
                    style={{
                        width: '100%',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        backgroundColor: isEditing ? 'var(--color-amber)' : undefined,
                        borderColor: isEditing ? 'var(--color-amber)' : undefined,
                        color: isEditing ? '#000' : undefined
                    }}
                >
                    {isEditing ? (
                        <>
                            <span style={{ fontSize: '14px' }}>💾</span>
                            SAVE CHANGES
                        </>
                    ) : dailyLog?.log_closed ? (
                        <>
                            <span style={{ fontSize: '14px' }}>✏️</span>
                            EDIT TODAY'S LOG
                        </>
                    ) : (
                        <>
                            <span style={{ fontSize: '14px' }}>🏁</span>
                            CLOSE DAY & CHECK ACHIEVEMENTS
                        </>
                    )}
                </button>
            </Card>

            <CloseDayModal
                isOpen={showCloseModal}
                score={score}
                tier={tier}
                onConfirm={async () => { await closeLog(); }}
                onDismiss={() => setShowCloseModal(false)}
            />
        </>
    );
}

