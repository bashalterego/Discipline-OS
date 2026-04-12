import { useState, useEffect, useMemo } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TaskItem from './TaskItem';
import StatusPill from '@/components/ui/StatusPill';
import { calculateDailyScore, getPerformanceTier } from '@/lib/scoring';
import type { Task, TaskCompletion, DailyLog, FinanceLog } from '@/types';

interface LogEditModalProps {
    date: string;
    onClose: () => void;
    onSave: () => void;
}

const MOOD_OPTIONS = [
    { value: 1, emoji: '😔' }, { value: 2, emoji: '😐' }, { value: 3, emoji: '🙂' }, { value: 4, emoji: '😄' }, { value: 5, emoji: '🤩' },
];
const ENERGY_OPTIONS = [
    { value: 1, emoji: '🪫' }, { value: 2, emoji: '😴' }, { value: 3, emoji: '⚡' }, { value: 4, emoji: '🔥' }, { value: 5, emoji: '💥' },
];

export default function LogEditModal({ date, onClose, onSave }: LogEditModalProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [completions, setCompletions] = useState<TaskCompletion[]>([]);
    const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
    const [financeLog, setFinanceLog] = useState<FinanceLog | null>(null);
    const [error, setError] = useState<string | null>(null);

    const liveScore = useMemo(() => calculateDailyScore(completions, tasks), [completions, tasks]);
    const liveTier = useMemo(() => getPerformanceTier(liveScore), [liveScore]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetch(`/api/logs/${date}/data`);
                if (!res.ok) throw new Error('Failed to load log data');
                const data = await res.json();
                setTasks(data.tasks);
                setCompletions(data.completions);
                setDailyLog(data.dailyLog);
                setFinanceLog(data.financeLog || { cash_in_hand: 0, earning: 0, expenditure: 0, notes: '' });
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [date]);

    const handleTaskToggle = (taskId: string, completed: boolean) => {
        setCompletions(prev => {
            const existing = prev.find(c => c.task_id === taskId);
            if (existing) {
                return prev.map(c => c.task_id === taskId ? { ...c, completed } : c);
            }
            return [...prev, { task_id: taskId, completed, log_date: date } as any];
        });
    };

    const handleTaskValueChange = (taskId: string, value: number) => {
        setCompletions(prev => {
            const existing = prev.find(c => c.task_id === taskId);
            if (existing) {
                return prev.map(c => c.task_id === taskId ? { ...c, value_logged: value, completed: value > 0 } : c);
            }
            return [...prev, { task_id: taskId, value_logged: value, completed: value > 0, log_date: date } as any];
        });
    };

    const handleFinanceChange = (key: keyof FinanceLog, value: string | number) => {
        setFinanceLog(prev => prev ? { ...prev, [key]: value } : null);
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const res = await fetch(`/api/logs/${date}/edit`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskCompletions: completions,
                    financeData: financeLog,
                    reflection: dailyLog?.reflection,
                    mood: dailyLog?.mood,
                    energy: dailyLog?.energy
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save changes');
            }
            onSave();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return null; // Or a spinner

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)', padding: '20px'
        }}>
            <Card style={{
                maxWidth: '600px', width: '100%', maxHeight: '90vh',
                overflowY: 'auto', padding: '32px', border: '1px solid var(--color-border)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                            EDIT LOG: {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </h2>
                        <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                            HISTORICAL READ-WRITE ACCESS GRANTED
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '20px' }}>×</button>
                </div>

                {error && (
                    <div style={{ backgroundColor: 'rgba(255, 69, 58, 0.1)', border: '0.5px solid var(--color-red)', borderRadius: '6px', padding: '12px', marginBottom: '20px', color: 'var(--color-red)', fontFamily: 'var(--font-dm-mono)', fontSize: '12px' }}>
                        ERROR: {error}
                    </div>
                )}

                {/* Live Score Preview */}
                <div style={{
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>PROJECTED SCORE</div>
                        <div style={{ fontFamily: 'var(--font-syne)', fontSize: '32px', fontWeight: 800, color: 'var(--color-gold)' }}>
                            {liveScore.toFixed(1)}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>PROJECTED TIER</div>
                        <StatusPill text={liveTier} variant={liveScore >= 7.5 ? 'gold' : liveScore >= 6.0 ? 'sage' : liveScore >= 4.0 ? 'amber' : 'red'} />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Tasks */}
                    <div>
                        <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.1em', marginBottom: '12px' }}>TASKS</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {tasks.map(t => (
                                <TaskItem
                                    key={t.id}
                                    task={t}
                                    completion={completions.find(c => c.task_id === t.id)}
                                    // Use local handlers here because TaskItem expects store logic normally, but here we override
                                    onToggle={handleTaskToggle}
                                    onValueChange={handleTaskValueChange}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Vitals */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>MOOD</div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {MOOD_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setDailyLog(prev => prev ? { ...prev, mood: opt.value as any } : null)}
                                        style={{
                                            flex: 1, padding: '8px 4px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px',
                                            border: `0.5px solid ${dailyLog?.mood === opt.value ? 'var(--color-gold)' : 'var(--color-border)'}`,
                                            backgroundColor: dailyLog?.mood === opt.value ? 'rgba(200,184,154,0.1)' : 'transparent'
                                        }}
                                    >
                                        {opt.emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>ENERGY</div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {ENERGY_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setDailyLog(prev => prev ? { ...prev, energy: opt.value as any } : null)}
                                        style={{
                                            flex: 1, padding: '8px 4px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px',
                                            border: `0.5px solid ${dailyLog?.energy === opt.value ? 'var(--color-sage)' : 'var(--color-border)'}`,
                                            backgroundColor: dailyLog?.energy === opt.value ? 'rgba(139,177,143,0.1)' : 'transparent'
                                        }}
                                    >
                                        {opt.emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Finance */}
                    <div>
                        <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.1em', marginBottom: '12px' }}>FINANCE</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
                            {['cash_in_hand', 'earning', 'expenditure'].map(key => (
                                <div key={key}>
                                    <label style={{ display: 'block', fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{key.replace(/_/g, ' ').toUpperCase()}</label>
                                    <input
                                        type="number"
                                        value={(financeLog as any)?.[key] || 0}
                                        onChange={e => handleFinanceChange(key as any, parseFloat(e.target.value) || 0)}
                                        style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--color-border)', borderRadius: '4px', padding: '8px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-dm-mono)', fontSize: '13px', textAlign: 'right' }}
                                    />
                                </div>
                            ))}
                        </div>
                        <textarea
                            placeholder="Finance notes..."
                            value={financeLog?.notes || ''}
                            onChange={e => handleFinanceChange('notes', e.target.value)}
                            style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--color-border)', borderRadius: '4px', padding: '8px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-dm-mono)', fontSize: '12px', resize: 'none' }}
                        />
                    </div>

                    {/* Reflection */}
                    <div>
                        <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.1em', marginBottom: '12px' }}>REFLECTION</h3>
                        <textarea
                            value={dailyLog?.reflection || ''}
                            onChange={e => setDailyLog(prev => prev ? { ...prev, reflection: e.target.value } : null)}
                            rows={4}
                            style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--color-border)', borderRadius: '4px', padding: '12px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-dm-mono)', fontSize: '13px', lineHeight: 1.6, resize: 'none' }}
                        />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <Button variant="outline" onClick={onClose} style={{ flex: 1 }}>CANCEL</Button>
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            disabled={saving}
                            style={{ flex: 1, backgroundColor: 'var(--color-gold)', color: '#000' }}
                        >
                            {saving ? 'SAVING...' : 'SAVE CHANGES'}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
