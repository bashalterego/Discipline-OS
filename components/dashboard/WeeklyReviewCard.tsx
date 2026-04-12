'use client';

import { motion } from 'framer-motion';
import type { WeeklyReview } from '@/types';
import { format } from 'date-fns';

interface WeeklyReviewCardProps {
    review: WeeklyReview;
}

export default function WeeklyReviewCard({ review }: WeeklyReviewCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px solid rgba(200, 184, 154, 0.2)',
                borderRadius: '24px',
                padding: '32px',
                width: '100%',
                maxWidth: '800px',
                marginBottom: '24px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h3 style={{
                        fontFamily: 'var(--font-syne)',
                        fontSize: '12px',
                        fontWeight: 800,
                        color: 'var(--color-gold)',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        marginBottom: '8px'
                    }}>
                        WEEKLY VERDICT
                    </h3>
                    <h2 style={{
                        fontFamily: 'var(--font-syne)',
                        fontSize: '24px',
                        fontWeight: 800,
                        color: 'var(--color-text-primary)'
                    }}>
                        {format(new Date(review.start_date), 'MMM dd')} — {format(new Date(review.end_date), 'MMM dd, yyyy')}
                    </h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        fontSize: '32px',
                        fontWeight: 800,
                        color: 'var(--color-gold)',
                        fontFamily: 'var(--font-syne)'
                    }}>
                        {review.avg_score.toFixed(1)}
                    </div>
                    <div style={{
                        fontSize: '10px',
                        color: 'var(--color-text-muted)',
                        fontWeight: 700,
                        letterSpacing: '0.1em'
                    }}>
                        AVG DISCIPLINE SCORE
                    </div>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                marginBottom: '32px',
                borderTop: '0.5px solid rgba(200, 184, 154, 0.1)',
                paddingTop: '24px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--color-text-primary)', fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>
                        {review.total_tasks_completed}
                    </div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>
                        TASKS COMPLETED
                    </div>
                </div>
                <div style={{ textAlign: 'center', borderLeft: '0.5px solid rgba(200, 184, 154, 0.1)', borderRight: '0.5px solid rgba(200, 184, 154, 0.1)' }}>
                    <div style={{ color: review.finance_surplus >= 0 ? 'var(--color-sage)' : 'var(--color-clay)', fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>
                        {review.finance_surplus >= 0 ? '+' : ''}{review.finance_surplus.toFixed(0)}
                    </div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>
                        FINANCIAL SURPLUS
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--color-text-primary)', fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>
                        {Math.round(review.avg_score * 10)}%
                    </div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>
                        EFFICIENCY AVG
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
                <p style={{
                    fontFamily: 'var(--font-dm-mono)',
                    fontSize: '14px',
                    color: 'var(--color-text-secondary)',
                    lineHeight: '1.7',
                    padding: '24px',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    {review.ai_verdict}
                </p>
            </div>

            <div style={{
                backgroundColor: 'rgba(200, 184, 154, 0.05)',
                border: '1px solid rgba(200, 184, 154, 0.2)',
                borderRadius: '16px',
                padding: '24px'
            }}>
                <div style={{ fontSize: '10px', color: 'var(--color-gold)', fontWeight: 800, marginBottom: '12px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    NEXT WEEK DIRECTIVE
                </div>
                <p style={{
                    fontFamily: 'var(--font-syne)',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    lineHeight: '1.4'
                }}>
                    "{review.ai_directive}"
                </p>
            </div>
        </motion.div>
    );
}
