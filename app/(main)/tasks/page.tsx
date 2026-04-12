'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusPill from '@/components/ui/StatusPill';
import type { Task, TaskType } from '@/types';

type TaskTypeOption = { value: TaskType; label: string };

const TASK_TYPES: TaskTypeOption[] = [
  { value: 'boolean', label: 'Boolean (Done / Not Done)' },
  { value: 'quantitative', label: 'Quantitative (e.g. 5km)' },
  { value: 'duration', label: 'Duration (e.g. 60 min)' },
  { value: 'scale_0_3', label: 'Scale 0–3 (consistency rating)' },
];

const TIME_OPTIONS = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
];

const defaultForm = {
  name: '',
  type: 'boolean' as TaskType,
  points: '1.0',
  target_value: '',
  target_unit: '',
  preferred_time: 'morning',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data.tasks || []);
  };

  useEffect(() => {
    fetchTasks().finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          type: form.type,
          points: parseFloat(form.points) || 1.0,
          target_value: form.target_value ? parseFloat(form.target_value) : null,
          target_unit: form.target_unit || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setForm(defaultForm);
        setShowForm(false);
        await fetchTasks();
      } else {
        setCreateError(data.error || 'Failed to create task.');
      }
    } catch (e) {
      setCreateError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (task: Task) => {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !task.is_active }),
    });
    await fetchTasks();
  };

  const handleRename = async (task: Task) => {
    if (!editName.trim()) { setEditingId(null); return; }
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    });
    setEditingId(null);
    await fetchTasks();
  };

  const handleReorder = async (task: Task, direction: 'up' | 'down') => {
    const active = tasks.filter(t => t.is_active);
    const idx = active.findIndex(t => t.id === task.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= active.length) return;

    const swapTask = active[swapIdx];
    await Promise.all([
      fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: swapTask.sort_order }),
      }),
      fetch(`/api/tasks/${swapTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: task.sort_order }),
      }),
    ]);
    await fetchTasks();
  };

  const activeTasks = tasks.filter(t => t.is_active);
  const inactiveTasks = tasks.filter(t => !t.is_active);

  const needsTarget = (type: TaskType) => type === 'quantitative' || type === 'duration';

  const typeLabel = (type: TaskType) => TASK_TYPES.find(t => t.value === type)?.label.split(' ')[0] || type;

  if (loading) {
    return (
      <div style={{ height: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontFamily: 'var(--font-dm-mono)', fontSize: '12px' }}>
        LOADING SYSTEMS...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
            TASK MANAGER
          </h1>
          <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
            {activeTasks.length} ACTIVE SYSTEMS
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowForm(v => !v)}>
          {showForm ? 'CANCEL' : '+ NEW TASK'}
        </Button>
      </div>

      {/* Add Task Form */}
      {showForm && (
        <Card style={{ padding: '24px', marginBottom: '24px', border: '0.5px solid var(--color-gold)' }}>
          <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '12px', fontWeight: 700, color: 'var(--color-gold)', letterSpacing: '0.1em', marginBottom: '20px' }}>
            NEW SYSTEM
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>TASK NAME</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Morning Run"
                style={inputStyle}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>TYPE</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as TaskType }))}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {TASK_TYPES.map(t => (
                    <option key={t.value} value={t.value} style={{ backgroundColor: 'var(--color-bg)' }}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>POINTS</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="10"
                  value={form.points}
                  onChange={e => setForm(f => ({ ...f, points: e.target.value }))}
                  style={{ ...inputStyle, textAlign: 'right' }}
                />
              </div>
            </div>
            {needsTarget(form.type) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>TARGET VALUE</label>
                  <input
                    type="number"
                    value={form.target_value}
                    onChange={e => setForm(f => ({ ...f, target_value: e.target.value }))}
                    placeholder="e.g. 5"
                    style={{ ...inputStyle, textAlign: 'right' }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>UNIT</label>
                  <input
                    type="text"
                    value={form.target_unit}
                    onChange={e => setForm(f => ({ ...f, target_unit: e.target.value }))}
                    placeholder="e.g. km, min"
                    style={inputStyle}
                  />
                </div>
              </div>
            )}
            <div>
              <label style={labelStyle}>PREFERRED TIME</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {TIME_OPTIONS.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setForm(f => ({ ...f, preferred_time: t.value }))}
                    style={{
                      flex: 1, padding: '8px', borderRadius: '6px', cursor: 'pointer',
                      border: `0.5px solid ${form.preferred_time === t.value ? 'var(--color-gold)' : 'var(--color-border)'}`,
                      backgroundColor: form.preferred_time === t.value ? 'rgba(200,184,154,0.1)' : 'rgba(255,255,255,0.02)',
                      color: form.preferred_time === t.value ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-dm-mono)', fontSize: '10px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {t.label.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            {createError && (
              <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: 'var(--color-red)', padding: '8px 12px', backgroundColor: 'rgba(255,80,80,0.08)', borderRadius: '6px', border: '0.5px solid rgba(255,80,80,0.2)' }}>
                ERROR: {createError}
              </div>
            )}
            <Button variant="primary" onClick={handleCreate}>
              {submitting ? 'CREATING...' : 'CREATE SYSTEM'}
            </Button>
          </div>
        </Card>
      )}

      {/* Active Tasks */}
      <Card style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.1em', marginBottom: '16px' }}>
          ACTIVE SYSTEMS
        </h3>
        {activeTasks.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            NO ACTIVE TASKS. CREATE ONE ABOVE.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activeTasks.map((task, idx) => (
              <div key={task.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px',
                border: '0.5px solid var(--color-border)',
              }}>
                {/* Reorder */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <button onClick={() => handleReorder(task, 'up')} disabled={idx === 0} style={arrowStyle(idx === 0)}>▲</button>
                  <button onClick={() => handleReorder(task, 'down')} disabled={idx === activeTasks.length - 1} style={arrowStyle(idx === activeTasks.length - 1)}>▼</button>
                </div>

                {/* Name (editable) */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingId === task.id ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onBlur={() => handleRename(task)}
                      onKeyDown={e => e.key === 'Enter' && handleRename(task)}
                      style={{ ...inputStyle, padding: '6px 8px', fontSize: '13px' }}
                    />
                  ) : (
                    <div
                      onDoubleClick={() => { setEditingId(task.id); setEditName(task.name); }}
                      style={{ fontFamily: 'var(--font-syne)', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', cursor: 'text' }}
                      title="Double-click to rename"
                    >
                      {task.name}
                    </div>
                  )}
                  <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {task.points.toFixed(1)} PTS
                    {task.target_value && ` • ${task.target_value}${task.target_unit ? ' ' + task.target_unit : ''}`}
                  </div>
                </div>

                {/* Type badge */}
                <StatusPill text={typeLabel(task.type)} variant={task.is_core ? 'gold' : 'sage'} />

                {/* Toggle off button */}
                <button
                  onClick={() => handleToggleActive(task)}
                  title="Deactivate task"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '16px', padding: '4px', borderRadius: '4px', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-red)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Inactive Tasks */}
      {inactiveTasks.length > 0 && (
        <Card style={{ padding: '24px', opacity: 0.7 }}>
          <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.1em', marginBottom: '16px' }}>
            ARCHIVED SYSTEMS
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {inactiveTasks.map(task => (
              <div key={task.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
                backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '8px',
                border: '0.5px solid var(--color-divider)',
              }}>
                <div style={{ flex: 1, fontFamily: 'var(--font-syne)', fontSize: '13px', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
                  {task.name}
                </div>
                <button
                  onClick={() => handleToggleActive(task)}
                  style={{ background: 'none', border: '0.5px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '10px', padding: '4px 8px', borderRadius: '4px', fontFamily: 'var(--font-dm-mono)' }}
                >
                  RESTORE
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div style={{ marginTop: '16px', fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
        DOUBLE-CLICK A TASK NAME TO RENAME IT
      </div>
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

const arrowStyle = (disabled: boolean): React.CSSProperties => ({
  background: 'none', border: 'none', cursor: disabled ? 'default' : 'pointer',
  color: disabled ? 'var(--color-divider)' : 'var(--color-text-muted)',
  fontSize: '9px', padding: '0', lineHeight: 1,
});
