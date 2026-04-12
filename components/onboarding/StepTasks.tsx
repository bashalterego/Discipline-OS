'use client';

const DEFAULT_TASKS = [
    { id: 'wake', name: 'Wake up 5:00–5:30 AM', type: 'boolean', points: 1.0 },
    { id: 'cardio', name: 'Morning cardio 30 min', type: 'duration', points: 1.0 },
    { id: 'read', name: 'Study book 30 min', type: 'duration', points: 1.0 },
    { id: 'uni', name: 'University on time', type: 'boolean', points: 1.0 },
    { id: 'gym', name: 'Gym session', type: 'boolean', points: 1.0 },
    { id: 'study', name: 'Study 2 hrs', type: 'duration', points: 1.0 },
    { id: 'selfctrl', name: 'Self control (food / social media / NoFap)', type: 'scale_0_3', points: 3.0 },
    { id: 'sleep', name: 'Sleep by 11 PM', type: 'boolean', points: 1.0 },
];

interface StepTasksProps {
    selectedTaskIds: string[];
    onChange: (ids: string[]) => void;
}

export default function StepTasks({ selectedTaskIds, onChange }: StepTasksProps) {
    function toggle(id: string) {
        if (selectedTaskIds.includes(id)) {
            onChange(selectedTaskIds.filter((x) => x !== id));
        } else {
            onChange([...selectedTaskIds, id]);
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h2
                    style={{
                        fontFamily: 'var(--font-syne)',
                        fontWeight: 700,
                        fontSize: '22px',
                        color: 'var(--color-text-primary)',
                        marginBottom: '8px',
                    }}
                >
                    Your core tasks.
                </h2>
                <p
                    style={{
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: '12px',
                        color: 'var(--color-text-muted)',
                    }}
                >
                    These are your daily commitments. All 8 are recommended.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {DEFAULT_TASKS.map((task) => {
                    const isSelected = selectedTaskIds.includes(task.id);
                    return (
                        <button
                            key={task.id}
                            onClick={() => toggle(task.id)}
                            style={{
                                padding: '12px 16px',
                                backgroundColor: isSelected
                                    ? 'rgba(200, 184, 154, 0.06)'
                                    : 'rgba(255,255,255,0.02)',
                                border: isSelected
                                    ? '0.5px solid var(--color-gold)'
                                    : '0.5px solid var(--color-border)',
                                borderRadius: '8px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {/* Checkbox */}
                                <div
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '4px',
                                        border: `0.5px solid ${isSelected ? 'var(--color-gold)' : 'var(--color-border)'}`,
                                        backgroundColor: isSelected ? 'var(--color-gold)' : 'transparent',
                                        flexShrink: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {isSelected && (
                                        <span style={{ color: '#0E0E10', fontSize: '10px', fontWeight: 700 }}>✓</span>
                                    )}
                                </div>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-syne)',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                                    }}
                                >
                                    {task.name}
                                </span>
                            </div>
                            <span
                                style={{
                                    fontFamily: 'var(--font-dm-mono)',
                                    fontSize: '10px',
                                    color: 'var(--color-text-muted)',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {task.points}pt{task.points !== 1 ? 's' : ''}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div
                style={{
                    fontFamily: 'var(--font-dm-mono)',
                    fontSize: '11px',
                    color: 'var(--color-text-muted)',
                    textAlign: 'center',
                }}
            >
                {selectedTaskIds.length} / {DEFAULT_TASKS.length} tasks selected
            </div>
        </div>
    );
}
