'use client';

import { useState, useEffect } from 'react';
import BadgeShelf from '@/components/profile/BadgeShelf';
import Card from '@/components/ui/Card';
import StatusPill from '@/components/ui/StatusPill';
import type { Achievement, User, Streak } from '@/types';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/dashboard/today');
        const data = await res.json();
        setUser(data.user || null);
        setStreak(data.streak || null);
        setNameInput(data.user?.full_name || '');
        setAchievements(data.achievements || []);
      } catch (e) {
        console.error('Failed to load profile', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const saveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === user?.full_name) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: trimmed }),
      });
      setUser(u => u ? { ...u, full_name: trimmed } : u);
    } finally {
      setSavingName(false);
      setEditingName(false);
    }
  };

  if (loading) {
    return (
      <div style={{ height: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontFamily: 'var(--font-dm-mono)', fontSize: '12px' }}>
        LOADING PROFILE...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          backgroundColor: 'rgba(200, 184, 154, 0.1)', border: '1px solid var(--color-gold)',
          margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px',
        }}>
          👤
        </div>

        {editingName ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <input
              autoFocus
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onBlur={saveName}
              onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
              style={{
                fontFamily: 'var(--font-syne)', fontSize: '28px', fontWeight: 800,
                color: 'var(--color-text-primary)', background: 'rgba(255,255,255,0.05)',
                border: '0.5px solid var(--color-gold)', borderRadius: '6px',
                padding: '4px 12px', outline: 'none', textAlign: 'center',
              }}
            />
            {savingName && <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--color-gold)' }}>SAVING...</span>}
          </div>
        ) : (
          <h1
            onClick={() => setEditingName(true)}
            title="Click to edit name"
            style={{
              fontFamily: 'var(--font-syne)', fontSize: '32px', fontWeight: 800,
              color: 'var(--color-text-primary)', marginBottom: '8px', cursor: 'pointer',
              display: 'inline-block', borderBottom: '1px dashed rgba(200,184,154,0.3)',
            }}
          >
            {user?.full_name?.toUpperCase() || 'OPERATOR'}
          </h1>
        )}

        <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
          {!editingName && <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', marginRight: '6px' }}>CLICK NAME TO EDIT •</span>}
          {user?.email}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
        <Card style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '16px' }}>CORE STATS</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <StatRow label="ARCHETYPE"><StatusPill text={user?.archetype?.toUpperCase() || 'NONE'} variant="gold" /></StatRow>
            <StatRow label="DIFFICULTY"><strong style={{ color: 'var(--color-gold)', fontFamily: 'var(--font-syne)', fontSize: '12px' }}>{user?.difficulty_tier?.toUpperCase()}</strong></StatRow>
            <StatRow label="STRICT MODE">
              <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: user?.strict_mode ? 'var(--color-sage)' : 'var(--color-text-muted)' }}>
                {user?.strict_mode ? 'ACTIVE' : 'OFF'}
              </span>
            </StatRow>
          </div>
        </Card>

        <Card style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '16px' }}>MOMENTUM</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <StatRow label="CURRENT STREAK">
              <span style={{ fontFamily: 'var(--font-syne)', fontSize: '18px', fontWeight: 800, color: 'var(--color-gold)' }}>{streak?.current_streak || 0}d</span>
            </StatRow>
            <StatRow label="LONGEST STREAK">
              <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '13px', color: 'var(--color-text-primary)' }}>{streak?.longest_streak || 0}d</span>
            </StatRow>
          </div>
        </Card>
      </div>

      <Card style={{ padding: '24px', marginBottom: '32px' }}>
        <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '16px' }}>IDENTITY STATEMENT</h3>
        <p style={{
          fontFamily: 'var(--font-dm-mono)', fontSize: '14px', color: 'var(--color-text-primary)',
          lineHeight: 1.6, fontStyle: 'italic', backgroundColor: 'rgba(255,255,255,0.02)',
          padding: '20px', borderRadius: '8px', border: '0.5px solid var(--color-border)',
        }}>
          "{user?.identity_statement || 'The discipline to build what others won\'t.'}"
        </p>
      </Card>

      <div>
        <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          ACHIEVEMENTS
          <span style={{ fontSize: '12px', color: 'var(--color-gold)', backgroundColor: 'rgba(200,184,154,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
            {achievements.length}
          </span>
        </h2>
        <BadgeShelf achievements={achievements} />
      </div>
    </div>
  );
}

function StatRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: 'var(--color-text-secondary)' }}>{label}</span>
      {children}
    </div>
  );
}
