'use client';

import { useEffect } from 'react';
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

export default function DashboardPage() {
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
        setInitialData,
        setLoading,
        setError,
        toggleRestDay,
        finishTour,
        dismissAchievement
    } = useDashboardStore();

    useEffect(() => {
        const loadDashboard = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/dashboard/today');
                if (!res.ok) throw new Error('Failed to load dashboard');
                const data = await res.json();
                setInitialData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, [setInitialData, setLoading, setError]);

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
            display: 'grid',
            gridTemplateColumns: '1fr 1.5fr',
            gap: '24px'
        }} className="dashboard-grid">

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
                </div>

                <ScoreRingCard
                    score={score}
                    tier={tier}
                    isRestDay={dailyLog?.is_rest_day ?? false}
                    archetype={user?.archetype}
                    difficultyTier={user?.difficulty_tier}
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

            <style jsx>{`
                @media (max-width: 900px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
            {user?.onboarding_done && !user?.dashboard_tour_done && <DashboardTour onFinish={finishTour} />}

            {/* Achievement Notifications */}
            {newAchievement && (
                ['streak_7', 'streak_14', 'streak_21', 'streak_30', 'streak_60', 'streak_90'].includes(newAchievement.type) ? (
                    <CelebrationOverlay achievement={newAchievement} onDismiss={dismissAchievement} />
                ) : (
                    <ToastAchievement achievement={newAchievement} onDismiss={dismissAchievement} />
                )
            )}
        </div>
    );
}
