'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusPill from '@/components/ui/StatusPill';
import type { User } from '@/types';

type DifficultyTier = 'beginner' | 'intermediate' | 'elite';

const DIFFICULTY_OPTIONS: { value: DifficultyTier; label: string; desc: string }[] = [
  { value: 'beginner', label: 'BEGINNER', desc: 'Forgiving scoring, good for building habits' },
  { value: 'intermediate', label: 'INTERMEDIATE', desc: 'Balanced — standard scoring' },
  { value: 'elite', label: 'ELITE', desc: 'Strict scoring, maximum accountability' },
];

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Local state for edits
  const [identityStatement, setIdentityStatement] = useState('');
  const [difficultyTier, setDifficultyTier] = useState<DifficultyTier>('intermediate');
  const [strictMode, setStrictMode] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard/today')
      .then(r => r.json())
      .then(data => {
        const u = data.user as User;
        setUser(u);
        setIdentityStatement(u?.identity_statement || '');
        setDifficultyTier(u?.difficulty_tier || 'intermediate');
        setStrictMode(u?.strict_mode || false);
        setRecoveryMode(u?.recovery_mode || false);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity_statement: identityStatement,
          difficulty_tier: difficultyTier,
          strict_mode: strictMode,
          recovery_mode: recoveryMode,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ height: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontFamily: 'var(--font-dm-mono)', fontSize: '12px' }}>
        LOADING SETTINGS...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
            SETTINGS
          </h1>
          <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
            SYSTEM CONFIGURATION
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleSave}>
          {saving ? 'SAVING...' : saved ? '✓ SAVED' : 'SAVE CHANGES'}
        </Button>
      </div>

      {/* Identity Statement */}
      <Card style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={sectionTitle}>IDENTITY STATEMENT</h3>
          <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'var(--color-text-muted)' }}>
            {identityStatement.length}/200
          </span>
        </div>
        <textarea
          value={identityStatement}
          onChange={e => setIdentityStatement(e.target.value.slice(0, 200))}
          rows={3}
          placeholder="Who are you becoming? Define it here."
          style={{
            width: '100%', backgroundColor: 'rgba(255,255,255,0.03)',
            border: '0.5px solid var(--color-border)', borderRadius: '6px',
            padding: '12px', color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-dm-mono)', fontSize: '13px',
            lineHeight: 1.6, outline: 'none', resize: 'none',
          }}
        />
      </Card>

      {/* Difficulty Tier */}
      <Card style={{ padding: '24px', marginBottom: '20px' }}>
        <h3 style={{ ...sectionTitle, marginBottom: '16px' }}>DIFFICULTY TIER</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {DIFFICULTY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDifficultyTier(opt.value)}
              style={{
                width: '100%', textAlign: 'left', padding: '14px 16px',
                borderRadius: '8px', cursor: 'pointer',
                border: `0.5px solid ${difficultyTier === opt.value ? 'var(--color-gold)' : 'var(--color-border)'}`,
                backgroundColor: difficultyTier === opt.value ? 'rgba(200,184,154,0.08)' : 'rgba(255,255,255,0.01)',
                transition: 'all 0.15s ease',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-syne)', fontSize: '13px', fontWeight: 600, color: difficultyTier === opt.value ? 'var(--color-gold)' : 'var(--color-text-primary)' }}>
                  {opt.label}
                </div>
                <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  {opt.desc}
                </div>
              </div>
              {difficultyTier === opt.value && (
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-gold)', flexShrink: 0 }} />
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Toggles */}
      <Card style={{ padding: '24px', marginBottom: '20px' }}>
        <h3 style={{ ...sectionTitle, marginBottom: '16px' }}>SYSTEM FLAGS</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ToggleRow
            label="STRICT MODE"
            description="Failed tasks incur score penalties. No mercy."
            value={strictMode}
            onChange={setStrictMode}
          />
          <div style={{ height: '0.5px', backgroundColor: 'var(--color-divider)' }} />
          <ToggleRow
            label="RECOVERY MODE"
            description="Reduced daily requirements during injury or illness."
            value={recoveryMode}
            onChange={setRecoveryMode}
          />
        </div>
      </Card>

      {/* Archetype (read-only) */}
      <Card style={{ padding: '24px', marginBottom: '20px' }}>
        <h3 style={{ ...sectionTitle, marginBottom: '16px' }}>ARCHETYPE</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Set during onboarding. Cannot be changed.
          </p>
          <StatusPill text={user?.archetype?.toUpperCase() || 'NONE'} variant="gold" />
        </div>
      </Card>

      {/* Danger Zone */}
      <Card style={{ padding: '24px', borderColor: 'rgba(255,80,80,0.2)' }}>
        <h3 style={{ ...sectionTitle, color: 'var(--color-red)', marginBottom: '16px' }}>DANGER ZONE</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-syne)', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
              Sign Out
            </p>
            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: 'var(--color-text-muted)' }}>
              End your current session.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            SIGN OUT
          </Button>
        </div>
      </Card>
    </div>
  );
}

function ToggleRow({
  label, description, value, onChange
}: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-syne)', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
          {label}
        </div>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: 'var(--color-text-muted)' }}>
          {description}
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: '44px', height: '24px', borderRadius: '12px', flexShrink: 0,
          border: 'none', cursor: 'pointer', position: 'relative',
          backgroundColor: value ? 'var(--color-gold)' : 'rgba(255,255,255,0.1)',
          transition: 'background-color 0.2s ease',
        }}
      >
        <span style={{
          position: 'absolute', top: '3px',
          left: value ? '23px' : '3px',
          width: '18px', height: '18px', borderRadius: '50%',
          backgroundColor: value ? '#0E0E10' : 'rgba(255,255,255,0.4)',
          transition: 'left 0.2s ease',
        }} />
      </button>
    </div>
  );
}

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-syne)', fontSize: '12px', fontWeight: 700,
  color: 'var(--color-text-muted)', letterSpacing: '0.1em', marginBottom: 0,
};
