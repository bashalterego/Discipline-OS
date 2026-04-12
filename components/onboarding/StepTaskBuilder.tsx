'use client';

import { useState } from 'react';
import type { User, TaskType } from '@/types';
import { motion, Reorder, AnimatePresence } from 'framer-motion';

interface CustomTask {
    id: string; // temp id for reordering
    name: string;
    type: TaskType;
    points: number;
    target_value: number | null;
    target_unit: string | null;
    preferred_time: 'morning' | 'afternoon' | 'evening';
}

const SUGGESTIONS: Record<string, Omit<CustomTask, 'id'>[]> = {
    athlete: [
        { name: 'Morning Cardio 30m', type: 'duration', points: 1.0, target_value: 30, target_unit: 'mins', preferred_time: 'morning' },
        { name: 'Gym Session', type: 'boolean', points: 1.0, target_value: 1, target_unit: 'boolean', preferred_time: 'afternoon' },
        { name: 'Protein Goal', type: 'boolean', points: 1.0, target_value: 1, target_unit: 'boolean', preferred_time: 'evening' },
        { name: 'Mobility/Stretching', type: 'duration', points: 0.5, target_value: 15, target_unit: 'mins', preferred_time: 'evening' },
    ],
    scholar: [
        { name: 'Deep Work Session', type: 'duration', points: 1.5, target_value: 120, target_unit: 'mins', preferred_time: 'morning' },
        { name: 'Read 30 Pages', type: 'quantitative', points: 1.0, target_value: 30, target_unit: 'pages', preferred_time: 'afternoon' },
        { name: 'Journaling', type: 'boolean', points: 0.5, target_value: 1, target_unit: 'boolean', preferred_time: 'evening' },
        { name: 'Skill Learning', type: 'duration', points: 1.0, target_value: 60, target_unit: 'mins', preferred_time: 'afternoon' },
    ],
    monk: [
        { name: 'Meditation', type: 'duration', points: 1.0, target_value: 20, target_unit: 'mins', preferred_time: 'morning' },
        { name: 'Digital Detox', type: 'boolean', points: 1.0, target_value: 1, target_unit: 'boolean', preferred_time: 'evening' },
        { name: 'Nature Walk', type: 'duration', points: 0.5, target_value: 30, target_unit: 'mins', preferred_time: 'afternoon' },
        { name: 'Cold Exposure', type: 'boolean', points: 1.0, target_value: 1, target_unit: 'boolean', preferred_time: 'morning' },
    ],
    warrior: [
        { name: 'Wake up 5:00 AM', type: 'boolean', points: 1.0, target_value: 1, target_unit: 'boolean', preferred_time: 'morning' },
        { name: 'Heavy Training', type: 'boolean', points: 1.5, target_value: 1, target_unit: 'boolean', preferred_time: 'afternoon' },
        { name: 'Plan Next Day', type: 'boolean', points: 0.5, target_value: 1, target_unit: 'boolean', preferred_time: 'evening' },
        { name: 'Combat Sports/Skills', type: 'duration', points: 1.0, target_value: 60, target_unit: 'mins', preferred_time: 'afternoon' },
    ]
};

interface StepTaskBuilderProps {
    archetype: User['archetype'];
    tasks: CustomTask[];
    onChange: (tasks: CustomTask[]) => void;
}

export default function StepTaskBuilder({ archetype, tasks, onChange }: StepTaskBuilderProps) {
    const suggestions = archetype ? SUGGESTIONS[archetype] || [] : [];
    const [editingIdx, setEditingIdx] = useState<number | null>(null);

    const addTask = (t: Omit<CustomTask, 'id'>) => {
        onChange([...tasks, { ...t, id: Math.random().toString() }]);
    };

    const removeTask = (id: string) => {
        onChange(tasks.filter(t => t.id !== id));
    };

    const updateTask = (id: string, updates: Partial<CustomTask>) => {
        onChange(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const addNewBlank = () => {
        addTask({
            name: 'New Task',
            type: 'boolean',
            points: 1.0,
            target_value: 1,
            target_unit: 'boolean',
            preferred_time: 'morning'
        });
        setEditingIdx(tasks.length);
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px', minHeight: '400px' }}>
            {/* Left: Suggestions */}
            <div style={{ borderRight: '1px solid var(--color-border)', paddingRight: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '11px', fontWeight: 800, color: 'var(--color-text-muted)', letterSpacing: '0.1em', marginBottom: '16px' }}>
                    SUGGESTIONS
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => addTask(s)}
                            style={{
                                padding: '10px',
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                border: '0.5px solid var(--color-border)',
                                borderRadius: '6px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                            }}
                        >
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{s.name}</div>
                            <div style={{ fontSize: '9px', color: 'var(--color-gold)' }}>+{s.points} pts</div>
                        </button>
                    ))}
                    <button
                        onClick={addNewBlank}
                        style={{ padding: '10px', border: '1px dashed var(--color-border)', color: 'var(--color-text-muted)', fontSize: '11px', borderRadius: '6px', marginTop: '8px' }}
                    >
                        + CUSTOM TASK
                    </button>
                </div>
            </div>

            {/* Right: Your List */}
            <div>
                <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '11px', fontWeight: 800, color: 'var(--color-text-muted)', letterSpacing: '0.1em', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                    YOUR SYSTEM <span>{tasks.reduce((sum, t) => sum + t.points, 0).toFixed(1)} PTS TOTAL</span>
                </h3>

                <Reorder.Group axis="y" values={tasks} onReorder={onChange} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <AnimatePresence>
                        {tasks.map((task, idx) => (
                            <Reorder.Item key={task.id} value={task}>
                                <div style={{
                                    padding: '12px 16px',
                                    backgroundColor: editingIdx === idx ? 'rgba(200, 184, 154, 0.05)' : 'rgba(255,255,255,0.02)',
                                    border: '0.5px solid var(--color-border)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    gap: '12px',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ cursor: 'grab', color: 'var(--color-text-muted)' }}>⋮⋮</div>

                                    <div style={{ flex: 1 }}>
                                        {editingIdx === idx ? (
                                            <input
                                                autoFocus
                                                value={task.name}
                                                onChange={(e) => updateTask(task.id, { name: e.target.value })}
                                                onBlur={() => setEditingIdx(null)}
                                                onKeyDown={(e) => e.key === 'Enter' && setEditingIdx(null)}
                                                style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--color-gold)', color: 'var(--color-text-primary)', outline: 'none', fontFamily: 'var(--font-dm-mono)' }}
                                            />
                                        ) : (
                                            <div onClick={() => setEditingIdx(idx)} style={{ fontSize: '14px', fontWeight: 600 }}>{task.name}</div>
                                        )}
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                            <select
                                                value={task.preferred_time}
                                                onChange={(e) => updateTask(task.id, { preferred_time: e.target.value as any })}
                                                style={{ background: 'transparent', border: 'none', color: 'var(--color-gold)', fontSize: '10px' }}
                                            >
                                                <option value="morning">Morning</option>
                                                <option value="afternoon">Afternoon</option>
                                                <option value="evening">Evening</option>
                                            </select>
                                            <span style={{ color: 'var(--color-border)' }}>|</span>
                                            <input
                                                type="number"
                                                step="0.5"
                                                value={task.points}
                                                onChange={(e) => updateTask(task.id, { points: parseFloat(e.target.value) })}
                                                style={{ width: '30px', background: 'transparent', border: 'none', color: 'var(--color-sage)', fontSize: '10px' }}
                                            />
                                            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>pts</span>
                                        </div>
                                    </div>

                                    <button onClick={() => removeTask(task.id)} style={{ color: 'var(--color-red)', padding: '4px' }}>×</button>
                                </div>
                            </Reorder.Item>
                        ))}
                    </AnimatePresence>
                </Reorder.Group>

                {tasks.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', fontSize: '12px', border: '1px dashed var(--color-border)', borderRadius: '12px' }}>
                        No tasks added yet. Pick from suggestions or create a custom one.
                    </div>
                )}
            </div>
        </div>
    );
}

export type { CustomTask };
