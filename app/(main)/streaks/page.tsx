'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Card from '@/components/ui/Card';
import StatusPill from '@/components/ui/StatusPill';

const StreakBrokenModal = dynamic(() => import('@/components/dashboard/StreakBrokenModal'), { ssr: false });

export default function StreaksPage() {
  const [streak, setStreak] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBrokenModal, setShowBrokenModal] = useState(false);

  useEffect(() => {
    async function fetchStreak() {
      try {
        const res = await fetch('/api/dashboard/today');
        const data = await res.json();
        const s = data.streak || { current_streak: 0, longest_streak: 0 };
        setStreak(s);

        // Detection logic for broken streak
        if (s.current_streak === 0 && s.longest_streak > 0) {
          const today = new Date().toISOString().split('T')[0];
          const seenKey = `streak_broken_seen_${today}`;
          if (!localStorage.getItem(seenKey)) {
            setShowBrokenModal(true);
            localStorage.setItem(seenKey, 'true');
          }
        }
      } catch (error) {
        console.error('Failed to fetch streak:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStreak();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold" />
      </div>
    );
  }

  const milestones = [
    { days: 7, label: 'Warrior' },
    { days: 30, label: 'Elite' },
    { days: 100, label: 'Untouchable' },
  ];

  const currentMilestone = milestones.find(m => m.days > (streak?.current_streak || 0)) || milestones[milestones.length - 1];
  const progress = Math.min(((streak?.current_streak || 0) / currentMilestone.days) * 100, 100);

  return (
    <>
      <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-syne font-bold text-text-primary">STREAKS</h1>
          <p className="text-text-muted font-mono text-[10px] uppercase tracking-widest mt-1">
            Consistency is the only metric that matters
          </p>
        </div>

        {/* Main Streak Display */}
        <Card className="relative overflow-hidden p-12 flex flex-col items-center text-center gap-6">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <span className="text-[200px] leading-none">🔥</span>
          </div>

          <div
            className="w-32 h-32 rounded-full border-2 border-gold/20 flex items-center justify-center relative"
            style={{
              transition: 'transform 0.2s ease-out, opacity 0.2s ease-out',
            }}
          >
            <div className="absolute inset-0 rounded-full border-2 border-gold border-t-transparent animate-[spin_3s_linear_infinite]" />
            <span className="text-6xl font-syne font-bold text-gold">{streak?.current_streak || 0}</span>
          </div>

          <div>
            <h2 className="text-xl font-syne font-bold text-text-primary uppercase tracking-widest">
              DAY CURRENT STREAK
            </h2>
            <p className="text-text-muted font-mono text-[11px] mt-2 max-w-xs">
              Keep moving. Every day is a brick in the wall of your character.
            </p>
          </div>

          <div className="w-full max-w-md space-y-2">
            <div className="flex justify-between text-[10px] font-mono text-text-muted uppercase">
              <span>Next Milestone: {currentMilestone.label}</span>
              <span>{streak?.current_streak || 0} / {currentMilestone.days} DAYS</span>
            </div>
            <div className="w-full bg-divider rounded-full h-1">
              <div
                className="bg-gold h-full rounded-full shadow-[0_0_10px_rgba(200,184,154,0.5)]"
                style={{
                  width: `${progress}%`,
                  transition: 'width 1.5s ease-out'
                }}
              />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="flex flex-col gap-4">
            <h3 className="font-syne font-bold text-[14px] text-text-primary uppercase tracking-widest">
              Longest Streak
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-syne font-bold text-text-secondary">
                {streak?.longest_streak || 0}
              </span>
              <span className="text-text-muted font-mono text-[10px] uppercase">Days</span>
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <h3 className="font-syne font-bold text-[14px] text-text-primary uppercase tracking-widest">
              Streak Integrity
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-syne font-bold text-sage">STRICT</span>
            </div>
          </Card>
        </div>

        {/* Motivational Quote */}
        <div className="text-center italic text-text-muted font-syne text-[14px] py-8">
          "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
        </div>
      </div>

      <StreakBrokenModal
        isOpen={showBrokenModal}
        longestStreak={streak?.longest_streak || 0}
        previousStreak={streak?.longest_streak || 0} // Falling back to longest_streak as dummy "previous" if not tracked
        onDismiss={() => setShowBrokenModal(false)}
      />
    </>
  );
}

