'use client';

import { useEffect, useState } from 'react';
import ScoreChart from '@/components/analytics/ScoreChart';
import StreakCard from '@/components/analytics/StreakCard';
import PerformanceDistribution from '@/components/analytics/PerformanceDistribution';
import Card from '@/components/ui/Card';
import StatusPill from '@/components/ui/StatusPill';
import { useMemo } from 'react';

export default function AnalyticsPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [streak, setStreak] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [historyRes, streakRes] = await Promise.all([
          fetch('/api/stats/history?days=30'),
          fetch('/api/dashboard/today'), // Reuse today endpoint to get user/streak
        ]);

        const historyData = await historyRes.json();
        const todayData = await streakRes.json();

        setHistory(historyData.history || []);
        setStreak(todayData.streak || { current_streak: 0, longest_streak: 0 });
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold" />
      </div>
    );
  }

  const avgScore = history.length > 0
    ? (history.reduce((sum, h) => sum + h.score, 0) / history.length).toFixed(1)
    : '0.0';

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-syne font-bold text-text-primary">ANALYTICS</h1>
          <p className="text-text-muted font-mono text-[10px] uppercase tracking-widest mt-1">
            Performance History & Trends
          </p>
        </div>
        <div className="flex gap-2">
          <StatusPill text="30 DAYS" variant="gold" />
          <StatusPill text="ACTIVE" variant="sage" />
        </div>
      </div>

      {/* Top Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StreakCard
          currentStreak={streak?.current_streak || 0}
          longestStreak={streak?.longest_streak || 0}
        />

        <Card className="flex flex-col gap-4">
          <h3 className="font-syne font-bold text-[14px] text-text-primary uppercase tracking-widest">
            Average Score
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-syne font-bold text-sage">{avgScore}</span>
            <span className="text-text-muted font-mono text-[10px] uppercase">/ 10</span>
          </div>
        </Card>

        <Card className="flex flex-col gap-4">
          <h3 className="font-syne font-bold text-[14px] text-text-primary uppercase tracking-widest">
            Performance Tier
          </h3>
          <PerformanceDistribution data={history} />
        </Card>
      </div>

      {/* Chart Area */}
      <Card noPadding className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-syne font-bold text-[14px] text-text-primary uppercase tracking-widest">
            Discipline Progress
          </h3>
          <div className="flex gap-4 font-mono text-[10px] text-text-muted">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gold" /> SCORE
            </span>
          </div>
        </div>
        <ScoreChart data={history} />
      </Card>

      {/* Performance Breakdown Table */}
      <Card>
        <h3 className="font-syne font-bold text-[14px] text-text-primary uppercase tracking-widest mb-6">
          Recent Logs
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px]">
            <thead>
              <tr className="border-b-0.5 border-divider text-text-muted">
                <th className="pb-4 font-medium uppercase">Date</th>
                <th className="pb-4 font-medium uppercase">Score</th>
                <th className="pb-4 font-medium uppercase">Tasks</th>
                <th className="pb-4 font-medium uppercase">Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.slice(-7).reverse().map((log) => (
                <tr key={log.log_date} className="text-text-secondary">
                  <td className="py-4">{new Date(log.log_date).toLocaleDateString()}</td>
                  <td className="py-4 font-bold text-gold">{log.score.toFixed(1)}</td>
                  <td className="py-4">{log.tasks_done}/{log.tasks_total}</td>
                  <td className="py-4">
                    <StatusPill
                      text={log.performance_tier}
                      variant={log.performance_tier === 'ELITE' ? 'gold' : log.performance_tier === 'ACTIVE' ? 'sage' : 'red'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
