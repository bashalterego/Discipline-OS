'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusPill from '@/components/ui/StatusPill';
import type { Commitment } from '@/types';

const DURATION_OPTIONS = [
    { value: 30, label: '30 DAYS', desc: 'Short sprint — prove the basics' },
    { value: 60, label: '60 DAYS', desc: 'Build real momentum' },
    { value: 90, label: '90 DAYS', desc: 'Full transformation cycle' },
];

export default function CommitmentsPage() {
    const [commitments, setCommitments] = useState<Commitment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState<30 | 60 | 90>(30);
    const [isPublic, setIsPublic] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchCommitments = async () => {
        const res = await fetch('/api/commitments');
        const data = await res.json();
        setCommitments(data.commitments || []);
    };

    useEffect(() => {
        fetchCommitments().finally(() => setLoading(false));
    }, []);

    const handleCreate = async () => {
        if (!title.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/commitments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: title.trim(), duration_days: duration, is_public: isPublic }),
            });
            if (res.ok) {
                setTitle(''); setDuration(30); setIsPublic(false); setShowForm(false);
                await fetchCommitments();
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (commitment: Commitment, status: 'completed' | 'broken') => {
        await fetch(`/api/commitments/${commitment.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        await fetchCommitments();
    };

    const getDaysRemaining = (endDate: string) => {
        const end = new Date(endDate + 'T00:00:00');
        const now = new Date();
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    };

    const getProgress = (commitment: Commitment) => {
        if (!commitment.start_date || !commitment.end_date) return 0;
        const start = new Date(commitment.start_date + 'T00:00:00').getTime();
        const end = new Date(commitment.end_date + 'T00:00:00').getTime();
        const now = Date.now();
        return Math.min(100, Math.round(((now - start) / (end - start)) * 100));
    };

    const active = commitments.filter(c => c.status === 'active');
    const past = commitments.filter(c => c.status !== 'active');

    if (loading) {
        return (
            <div style={{ height: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontFamily: 'var(--font-dm-mono)', fontSize: '12px' }}>
                LOADING COMMITMENTS...
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                        COMMITMENTS
                    </h1>
                    <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
                        30 / 60 / 90-DAY PLEDGES
                    </p>
                </div>
                <Button variant="primary" size="sm" onClick={() => setShowForm(v => !v)}>
                    {showForm ? 'CANCEL' : '+ NEW PLEDGE'}
                </Button>
            </div>

            {/* Create Form */}
            {showForm && (
                <Card style={{ padding: '24px', marginBottom: '24px', border: '0.5px solid var(--color-gold)' }}>
                    <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '12px', fontWeight: 700, color: 'var(--color-gold)', letterSpacing: '0.1em', marginBottom: '20px' }}>
                        DECLARE YOUR COMMITMENT
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={labelStyle}>WHAT ARE YOU COMMITTING TO?</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Train every day without missing a single session"
                                style={inputStyle}
                                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>DURATION</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {DURATION_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setDuration(opt.value as 30 | 60 | 90)}
                                        style={{
                                            flex: 1, padding: '12px 8px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center',
                                            border: `0.5px solid ${duration === opt.value ? 'var(--color-gold)' : 'var(--color-border)'}`,
                                            backgroundColor: duration === opt.value ? 'rgba(200,184,154,0.1)' : 'rgba(255,255,255,0.02)',
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        <div style={{ fontFamily: 'var(--font-syne)', fontSize: '13px', fontWeight: 700, color: duration === opt.value ? 'var(--color-gold)' : 'var(--color-text-primary)', marginBottom: '3px' }}>
                                            {opt.label}
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'var(--color-text-muted)' }}>
                                            {opt.desc}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '0.5px solid var(--color-border)' }}>
                            <div>
                                <div style={{ fontFamily: 'var(--font-syne)', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '2px' }}>PUBLIC PLEDGE</div>
                                <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--color-text-muted)' }}>Make this commitment visible on your profile</div>
                            </div>
                            <button
                                onClick={() => setIsPublic(v => !v)}
                                style={{
                                    width: '44px', height: '24px', borderRadius: '12px', flexShrink: 0, border: 'none', cursor: 'pointer', position: 'relative',
                                    backgroundColor: isPublic ? 'var(--color-gold)' : 'rgba(255,255,255,0.1)', transition: 'background-color 0.2s ease',
                                }}
                            >
                                <span style={{ position: 'absolute', top: '3px', left: isPublic ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: isPublic ? '#0E0E10' : 'rgba(255,255,255,0.4)', transition: 'left 0.2s ease' }} />
                            </button>
                        </div>
                        <Button variant="primary" onClick={handleCreate}>
                            {submitting ? 'LOCKING IN...' : `COMMIT FOR ${duration} DAYS`}
                        </Button>
                    </div>
                </Card>
            )}

            {/* Active Commitments */}
            <div style={{ marginBottom: '32px' }}>
                {active.length === 0 && !showForm ? (
                    <Card style={{ padding: '60px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
                        <p style={{ fontFamily: 'var(--font-syne)', fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                            NO ACTIVE COMMITMENTS
                        </p>
                        <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: 'var(--color-text-muted)', maxWidth: '300px', margin: '0 auto 20px' }}>
                            A public commitment is a powerful forcing function. Declare something hard.
                        </p>
                        <Button variant="primary" onClick={() => setShowForm(true)}>+ MAKE A PLEDGE</Button>
                    </Card>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {active.map(c => {
                            const progress = getProgress(c);
                            const daysLeft = getDaysRemaining(c.end_date!);
                            const daysDone = c.duration_days - daysLeft;
                            return (
                                <Card key={c.id} style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div style={{ flex: 1, minWidth: 0, marginRight: '12px' }}>
                                            <div style={{ fontFamily: 'var(--font-syne)', fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '6px', lineHeight: 1.3 }}>
                                                {c.title}
                                            </div>
                                            <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--color-text-muted)' }}>
                                                {c.duration_days}-DAY PLEDGE
                                                {c.is_public && ' • PUBLIC'}
                                                {' • Started '}
                                                {new Date(c.start_date! + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </div>
                                        </div>
                                        <StatusPill text="ACTIVE" variant="sage" />
                                    </div>

                                    {/* Progress */}
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--color-text-muted)' }}>
                                                DAY {daysDone} / {c.duration_days}
                                            </span>
                                            <span style={{ fontFamily: 'var(--font-syne)', fontSize: '14px', fontWeight: 700, color: 'var(--color-gold)' }}>
                                                {daysLeft}d left
                                            </span>
                                        </div>
                                        <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%', width: `${progress}%`,
                                                background: 'linear-gradient(90deg, var(--color-gold), var(--color-sage))',
                                                borderRadius: '2px', transition: 'width 0.5s ease',
                                            }} />
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'var(--color-text-muted)', marginTop: '4px', textAlign: 'right' }}>
                                            {progress}% COMPLETE
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handleStatusChange(c, 'completed')}
                                            style={{ flex: 1, padding: '8px', borderRadius: '6px', cursor: 'pointer', border: '0.5px solid var(--color-sage)', backgroundColor: 'rgba(139,177,143,0.08)', color: 'var(--color-sage)', fontFamily: 'var(--font-dm-mono)', fontSize: '10px', transition: 'all 0.15s' }}
                                        >
                                            ✓ MARK COMPLETE
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(c, 'broken')}
                                            style={{ padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', border: '0.5px solid rgba(255,80,80,0.3)', backgroundColor: 'transparent', color: 'var(--color-red)', fontFamily: 'var(--font-dm-mono)', fontSize: '10px', transition: 'all 0.15s' }}
                                        >
                                            BROKEN
                                        </button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Past Commitments */}
            {past.length > 0 && (
                <>
                    <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: '14px', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.08em', marginBottom: '12px' }}>
                        HISTORY
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {past.map(c => (
                            <Card key={c.id} style={{ padding: '16px 20px', opacity: 0.65 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontFamily: 'var(--font-syne)', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', textDecoration: c.status === 'broken' ? 'line-through' : 'none' }}>
                                            {c.title}
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                            {c.duration_days} DAYS
                                        </div>
                                    </div>
                                    <StatusPill
                                        text={c.status.toUpperCase()}
                                        variant={c.status === 'completed' ? 'gold' : 'red'}
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

const labelStyle: React.CSSProperties = {
    display: 'block', fontFamily: 'var(--font-dm-mono)', fontSize: '9px',
    color: 'var(--color-text-muted)', marginBottom: '6px', letterSpacing: '0.08em',
};

const inputStyle: React.CSSProperties = {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.03)',
    border: '0.5px solid var(--color-border)', borderRadius: '6px',
    padding: '10px 12px', color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-dm-mono)', fontSize: '13px', outline: 'none',
};
