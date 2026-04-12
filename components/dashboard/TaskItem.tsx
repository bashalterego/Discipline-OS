'use client';

import { memo } from 'react';
import type { Task, TaskCompletion } from '@/types';
import { useDashboardStore } from '@/store/useDashboardStore';
import { clsx } from 'clsx';

interface TaskItemProps {
    task: Task;
    completion?: TaskCompletion;
    onToggle: (taskId: string, completed: boolean) => void;
    onValueChange: (taskId: string, value: number) => void;
}

export default memo(function TaskItem({ task, completion, onToggle, onValueChange }: TaskItemProps) {
    const { dailyLog, isEditing } = useDashboardStore();
    const isCompleted = completion?.completed ?? false;
    const isLocked = dailyLog?.log_closed && !isEditing;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: `0.5px solid ${isCompleted ? 'var(--color-sage)' : 'var(--color-border)'}`,
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                opacity: isLocked ? 0.6 : 1,
                pointerEvents: isLocked ? 'none' : 'auto',
                filter: isLocked ? 'grayscale(0.5)' : 'none'
            }}
        >
            {/* Clickable Area: Icon + Info */}
            <div
                onClick={() => onToggle(task.id, !isCompleted)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            >
                {/* Checkbox Icon */}
                <div
                    style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        border: `1.5px solid ${isCompleted ? 'var(--color-sage)' : 'var(--color-text-muted)'}`,
                        backgroundColor: isCompleted ? 'var(--color-sage)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    {isCompleted && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0E0E10" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    )}
                </div>

                {/* Task Info */}
                <div style={{ flex: 1 }}>
                    <div style={{
                        fontFamily: 'var(--font-syne)',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: isCompleted ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        transition: 'all 0.2s ease'
                    }}>
                        {task.name}
                    </div>
                    <div style={{
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: '10px',
                        color: 'var(--color-text-muted)',
                        marginTop: '2px'
                    }}>
                        {task.points.toFixed(1)} PTS • {task.type.toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Quantitative tasks: number input */}
            {task.type === 'quantitative' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                        type="number"
                        value={completion?.value_logged ?? ''}
                        onChange={(e) => onValueChange(task.id, parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        style={{
                            width: '50px',
                            padding: '4px 8px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: '0.5px solid var(--color-border)',
                            borderRadius: '4px',
                            color: 'var(--color-text-primary)',
                            fontFamily: 'var(--font-dm-mono)',
                            fontSize: '12px',
                            textAlign: 'right',
                            outline: 'none',
                        }}
                    />
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-dm-mono)' }}>
                        {task.target_unit}
                    </span>
                </div>
            )}

            {/* Duration tasks: checkbox only (handled by main toggle above) */}

            {task.type === 'scale_0_3' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>Self Control</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {[0, 1, 2, 3].map((val) => (
                            <div
                                key={val}
                                onClick={() => onValueChange(task.id, val)}
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    backgroundColor: (completion?.value_logged ?? -1) >= val
                                        ? 'var(--color-gold)'
                                        : 'rgba(255,255,255,0.12)',
                                    flexShrink: 0,
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});
