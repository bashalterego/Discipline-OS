import type { Task, TaskCompletion, PerformanceTier } from '@/types';

export function calculateDailyScore(
    completions: TaskCompletion[],
    tasks: Task[]
): number {
    const activeTasks = tasks.filter((t) => t.is_active);
    const totalPoints = activeTasks.reduce((sum, t) => sum + t.points, 0);

    if (totalPoints === 0) return 0;

    const earnedPoints = completions.reduce((sum, c) => {
        const task = tasks.find((t) => t.id === c.task_id);
        if (!task || !task.is_active) return sum;

        if (task.type === 'scale_0_3') {
            return sum + ((c.value_logged ?? 0) / 3) * task.points;
        }

        if ((task.type === 'quantitative' || task.type === 'duration') && task.target_value) {
            const ratio = Math.min((c.value_logged ?? 0) / task.target_value, 1);
            return sum + ratio * task.points;
        }

        return sum + (c.completed ? task.points : 0);
    }, 0);

    const raw = (earnedPoints / totalPoints) * 10;
    return Math.round(raw * 10) / 10;
}

export function getPerformanceTier(score: number): PerformanceTier {
    if (score >= 9.0) return 'ELITE';
    if (score >= 7.5) return 'OPTIMAL';
    if (score >= 6.0) return 'ACTIVE';
    if (score >= 4.0) return 'RECOVERING';
    return 'CRITICAL';
}

export function doesScoreCountForStreak(
    score: number,
    strictMode: boolean
): boolean {
    return strictMode ? score >= 7.0 : score >= 5.0;
}

export function getEfficiencyPct(
    completions: TaskCompletion[],
    tasks: Task[]
): number {
    const activeTasks = tasks.filter((t) => t.is_active);
    if (activeTasks.length === 0) return 0;
    const done = completions.filter((c) => {
        const task = tasks.find((t) => t.id === c.task_id);
        if (!task) return false;
        if (task.type === 'scale_0_3') return (c.self_control_score ?? 0) > 0;
        return c.completed;
    }).length;
    return Math.round((done / activeTasks.length) * 100);
}
