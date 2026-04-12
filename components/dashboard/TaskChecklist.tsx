'use client';

import { memo } from 'react';
import { useDashboardStore } from '@/store/useDashboardStore';
import TaskItem from './TaskItem';

export default memo(function TaskChecklist() {
    const { tasks, completions, toggleTask, updateTaskValue } = useDashboardStore();

    if (tasks.length === 0) {
        return (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No active tasks found. Go to Settings to add some.
            </div>
        );
    }

    return (
        <div id="task-checklist" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{
                fontFamily: 'var(--font-syne)',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                letterSpacing: '0.1em',
                marginBottom: '8px',
                paddingLeft: '4px'
            }}>
                DAILY SYSTEMS
            </h3>

            {tasks.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    completion={completions.find((c) => c.task_id === task.id)}
                    onToggle={toggleTask}
                    onValueChange={updateTaskValue}
                />
            ))}
        </div>
    );
});
