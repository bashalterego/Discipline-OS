'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import StatusPill from '@/components/ui/StatusPill';
import dynamic from 'next/dynamic';

const LogEditModal = dynamic(() => import('@/components/dashboard/LogEditModal'), { ssr: false });

interface ReflectionEntry {
  log_date: string;
  score: number;
  mood: number | null;
  energy: number | null;
  reflection: string | null;
  ai_reflection: string | null;
  tasks_done: number;
  tasks_total: number;
  is_rest_day: boolean;
  log_closed: boolean;
}

const MOOD_LABELS: Record<number, string> = { 1: '😔', 2: '😐', 3: '🙂', 4: '😄', 5: '🤩' };
const ENERGY_LABELS: Record<number, string> = { 1: '🪫', 2: '😴', 3: '⚡', 4: '🔥', 5: '💥' };

function getTierVariant(score: number): 'gold' | 'sage' | 'red' {
  if (score >= 8) return 'gold';
  if (score >= 5) return 'sage';
  return 'red';
}

function isWithinEditWindow(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  const diff = (today.getTime() - target.getTime()) / (1000 * 3600 * 24);
  return diff <= 7;
}

export default function ReflectionPage() {
  const [entries, setEntries] = useState<ReflectionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fetchHistory = () => {
    setLoading(true);
    fetch('/api/reflection/history?days=30')
      .then(r => r.json())
      .then(d => setEntries(d.entries || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div style={{ height: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontFamily: 'var(--font-dm-mono)', fontSize: '12px' }}>
        LOADING JOURNAL...
      </div>
    );
  }

  const visibleEntries = entries.filter(e => e.reflection || e.ai_reflection || isWithinEditWindow(e.log_date));

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
          REFLECTION JOURNAL
        </h1>
        <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
          {visibleEntries.length} ENTRIES IN THE LAST 30 DAYS
        </p>
      </div>

      {/* Entries */}
      {visibleEntries.length === 0 ? (
        <Card style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📓</div>
          <p style={{ fontFamily: 'var(--font-syne)', fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            NO REFLECTIONS YET
          </p>
          <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Close a day from the Dashboard to start building your journal.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {visibleEntries.map((entry: ReflectionEntry) => (
            <Card key={entry.log_date} style={{ padding: '24px', position: 'relative' }}>
              {/* Date row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {new Date(entry.log_date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {entry.tasks_done}/{entry.tasks_total} TASKS
                      {entry.is_rest_day && ' • REST DAY'}
                    </div>
                  </div>

                  {/* Edit/Lock Action */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {isWithinEditWindow(entry.log_date) ? (
                      <button
                        onClick={() => setSelectedDate(entry.log_date)}
                        title="Edit Log"
                        style={{
                          background: 'rgba(255,255,255,0.05)', border: '0.5px solid var(--color-border)',
                          borderRadius: '4px', padding: '4px 8px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '4px',
                          color: 'var(--color-text-secondary)', transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                      >
                        <span style={{ fontSize: '12px' }}>✏️</span>
                        <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', fontWeight: 600 }}>EDIT</span>
                      </button>
                    ) : (
                      <div title="This log is permanently locked" style={{ opacity: 0.4, cursor: 'help' }}>
                        <span style={{ fontSize: '14px' }}>🔒</span>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StatusPill text={`${entry.score.toFixed(1)}`} variant={getTierVariant(entry.score)} />
                  {entry.mood != null && (
                    <span title={`Mood: ${entry.mood}/5`} style={{ fontSize: '18px' }}>
                      {MOOD_LABELS[entry.mood]}
                    </span>
                  )}
                  {entry.energy != null && (
                    <span title={`Energy: ${entry.energy}/5`} style={{ fontSize: '18px' }}>
                      {ENERGY_LABELS[entry.energy]}
                    </span>
                  )}
                </div>
              </div>

              {/* User reflection */}
              {entry.reflection && (
                <div style={{ marginBottom: entry.ai_reflection ? '16px' : '0' }}>
                  <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'var(--color-text-muted)', marginBottom: '6px', letterSpacing: '0.1em' }}>
                    YOUR REFLECTION
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-dm-mono)', fontSize: '13px',
                    color: 'var(--color-text-secondary)', lineHeight: 1.7,
                    backgroundColor: 'rgba(255,255,255,0.02)', padding: '14px',
                    borderRadius: '6px', borderLeft: '2px solid var(--color-border)',
                  }}>
                    {entry.reflection}
                  </p>
                </div>
              )}

              {/* AI reflection */}
              {entry.ai_reflection && (
                <div>
                  <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'var(--color-gold)', marginBottom: '6px', letterSpacing: '0.1em' }}>
                    AI COACH ASSESSMENT
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-dm-mono)', fontSize: '13px',
                    color: 'var(--color-text-secondary)', lineHeight: 1.7,
                    backgroundColor: 'rgba(200,184,154,0.04)', padding: '14px',
                    borderRadius: '6px', borderLeft: '2px solid var(--color-gold)',
                    fontStyle: 'italic',
                  }}>
                    {entry.ai_reflection}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {selectedDate && (
        <LogEditModal
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
          onSave={() => {
            setSelectedDate(null);
            fetchHistory();
          }}
        />
      )}
    </div>
  );
}
