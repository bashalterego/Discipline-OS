'use client';

import { useState, useEffect } from 'react';
import { useDashboardStore } from '@/store/useDashboardStore';
import PerformanceRing from '@/components/dashboard/PerformanceRing';
import TaskChecklist from '@/components/dashboard/TaskChecklist';
import FinanceOverview from '@/components/dashboard/FinanceOverview';
import DailyReflection from '@/components/dashboard/DailyReflection';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import StatusPill from '@/components/ui/StatusPill';
import MoodEnergyWidget from '@/components/dashboard/MoodEnergyWidget';
import ScoreRingCard from '@/components/dashboard/ScoreRingCard';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import dynamic from 'next/dynamic';

const DashboardTour = dynamic(() => import('@/components/dashboard/DashboardTour'), { ssr: false });
const ToastAchievement = dynamic(() => import('@/components/dashboard/ToastAchievement'), { ssr: false });
const CelebrationOverlay = dynamic(() => import('@/components/dashboard/CelebrationOverlay'), { ssr: false });
const ScoreShareModal = dynamic(() => import('@/components/dashboard/ScoreShareModal'), { ssr: false });

export default function DashboardPage() {
    const [welcomeDismissed, setWelcomeDismissed] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const {
        user,
        score,
        tier,
        loading,
        error,
        dailyLog,
        financeLog,
        newAchievement,
        isEditing,
        isFirstDay,
        fetchDashboardData,
        toggleRestDay,
        finishTour,
        dismissAchievement
    } = useDashboardStore();

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (loading) return <DashboardSkeleton />;

    if (error) {
        return (
            <div style={{ padding: '40px', color: 'var(--color-red)' }}>
                Error: {error}
            </div>
        );
    }

    const handleRestDayToggle = async () => {
        await toggleRestDay();
    };

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
        }}>
            {isFirstDay && !welcomeDismissed && (
                <div style={{
                    backgroundColor: 'rgba(200, 184, 154, 0.05)',
                    border: '1px solid var(--color-gold)',
                    borderRadius: '12px',
                    padding: '32px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(45deg, rgba(200, 184, 154, 0.05) 0%, transparent 100%)'
                }}>
                    <div>
                        <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: '24px', fontWeight: 800, color: 'var(--color-gold)', marginBottom: '8px' }}>
                            WELCOME TO YOUR SYSTEM, {user?.full_name?.toUpperCase()}.
                        </h2>
                        <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '14px', color: 'var(--color-text-secondary)', maxWidth: '600px', lineHeight: 1.5 }}>
                            Today is Day 1 of your new operating system.
                            Complete your tasks, record your reflection, and build your momentum.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setWelcomeDismissed(true)}>
                        DISMISS
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6">

                {/* Left Column: Performance & Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <Button
                            variant={dailyLog?.is_rest_day ? 'primary' : 'outline'}
                            size="sm"
                            onClick={handleRestDayToggle}
                            className="flex-1"
                        >
                            {dailyLog?.is_rest_day ? 'REST DAY ACTIVE' : 'MARK AS REST DAY'}
                        </Button>
                        {isEditing && (
                            <StatusPill text="EDITING" variant="amber" />
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowShare(true)}
                            style={{ padding: '0 12px' }}
                        >
                            SHARE
                        </Button>
                    </div>

                    <ScoreRingCard
                        score={score}
                        tier={tier}
                        isRestDay={dailyLog?.is_rest_day ?? false}
                        archetype={user?.archetype}
                        difficultyTier={user?.difficulty_tier}
                        freezeTokens={user?.freeze_tokens}
                        onFreeze={async () => {
                            if (confirm('Use 1 Freeze Token to protect your streak today?')) {
                                const res = await fetch('/api/dashboard/log', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ type: 'freeze' })
                                });
                                if (res.ok) window.location.reload();
                                else {
                                    const data = await res.json();
                                    alert(data.error || 'Failed to freeze streak');
                                }
                            }
                        }}
                    />

                    <FinanceOverview initialData={financeLog} />

                    <Card style={{ padding: '20px' }}>
                        <h3 style={{
                            fontFamily: 'var(--font-syne)',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: 'var(--color-text-muted)',
                            letterSpacing: '0.1em',
                            marginBottom: '12px'
                        }}>
                            IDENTITY
                        </h3>
                        <p style={{
                            fontFamily: 'var(--font-dm-mono)',
                            fontSize: '13px',
                            color: 'var(--color-text-secondary)',
                            lineHeight: 1.6,
                            fontStyle: 'italic'
                        }}>
                            "{user?.identity_statement || 'No identity statement set.'}"
                        </p>
                    </Card>
                </div>

                {/* Right Column: Tasks & Reflections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Card style={{ padding: '24px' }}>
                        <TaskChecklist />
                    </Card>

                    <MoodEnergyWidget />

                    <DailyReflection initialText={dailyLog?.reflection || null} />
                </div>
            </div>
            {user?.onboarding_done && !user?.dashboard_tour_done && <DashboardTour onFinish={finishTour} />}

            {/* Achievement Notifications */}
            {newAchievement && (
                ['streak_7', 'streak_14', 'streak_21', 'streak_30', 'streak_60', 'streak_90'].includes(newAchievement.type) ? (
                    <CelebrationOverlay achievement={newAchievement} onDismiss={dismissAchievement} />
                ) : (
                    <ToastAchievement achievement={newAchievement} onDismiss={dismissAchievement} />
                )
            )}

            <ScoreShareModal
                isOpen={showShare}
                onClose={() => setShowShare(false)}
                score={score}
                tier={tier}
                userName={user?.full_name || 'Warrior'}
                archetype={user?.archetype}
            />
        </div>
    );
}
