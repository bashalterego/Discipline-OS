'use client';

import { useEffect, useState } from 'react';
import WeeklyReviewCard from '@/components/dashboard/WeeklyReviewCard';
import type { WeeklyReview } from '@/types';

function getTodayIST(): string {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const ist = new Date(now.getTime() + istOffset);
    return ist.toISOString().split('T')[0];
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<WeeklyReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReviews = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/reviews');
            const data = await res.json();
            if (data.reviews) setReviews(data.reviews);
        } catch {
            setError('Failed to load reviews.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReviews(); }, []);

    const generateLatest = async () => {
        setGenerating(true);
        setError(null);
        try {
            const today = getTodayIST();
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endDate: today }),
            });
            const data = await res.json();
            if (data.success) {
                await fetchReviews();
            } else {
                setError(data.error || 'Failed to generate review.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <main style={{ padding: '40px', maxWidth: '860px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <p style={{ color: 'var(--color-gold)', fontFamily: 'var(--font-dm-mono)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', marginBottom: '8px' }}>
                        WEEKLY INTELLIGENCE
                    </p>
                    <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: '40px', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
                        WEEKLY REVIEWS
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-dm-mono)', fontSize: '13px', marginTop: '8px' }}>
                        AI-synthesized retrospectives & next-week directives.
                    </p>
                </div>

                <button
                    onClick={generateLatest}
                    disabled={generating}
                    className="btn-primary"
                    style={{ padding: '14px 24px', opacity: generating ? 0.7 : 1, cursor: generating ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                >
                    {generating ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor', animation: 'pulse 1s infinite' }} />
                            ANALYZING WEEK...
                        </span>
                    ) : 'GENERATE LATEST REVIEW'}
                </button>
            </div>

            <div style={{ height: '0.5px', backgroundColor: 'var(--color-divider)', marginBottom: '40px' }} />

            {/* Error Banner */}
            {error && (
                <div
                    style={{
                        backgroundColor: 'rgba(255, 80, 80, 0.08)',
                        border: '1px solid rgba(255, 80, 80, 0.3)',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        marginBottom: '24px',
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: '13px',
                        color: '#ff6b6b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'opacity 0.2s ease-out'
                    }}
                >
                    <span style={{ fontSize: '16px' }}>⚠</span>
                    {error}
                    {error.includes('Insufficient') && (
                        <span style={{ marginLeft: '4px', color: 'var(--color-text-muted)' }}>
                            — Use the dashboard to close a day first, then generate a review.
                        </span>
                    )}
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div style={{ color: 'var(--color-gold)', fontFamily: 'var(--font-dm-mono)', padding: '60px 0', textAlign: 'center', letterSpacing: '0.1em' }}>
                    LOADING ARCHIVES...
                </div>
            ) : reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {reviews.map((review) => (
                        <WeeklyReviewCard key={review.id} review={review} />
                    ))}
                </div>
            ) : (
                <div
                    style={{
                        textAlign: 'center',
                        padding: '80px 40px',
                        border: '1px dashed rgba(200, 184, 154, 0.15)',
                        borderRadius: '24px'
                    }}
                >
                    <div style={{ fontSize: '56px', marginBottom: '20px' }}>📂</div>
                    <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                        NO RECORDS YET
                    </h3>
                    <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                        Close at least one day in the Dashboard,<br />then generate your first Weekly Review to unlock AI coaching.
                    </p>
                </div>
            )}
        </main>
    );
}
