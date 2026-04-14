import { create } from 'zustand';
import { calculateDailyScore, getPerformanceTier } from '@/lib/scoring';
import { getTodayInKolkata } from '@/lib/utils';
import type { Task, TaskCompletion, User, DailyLog, PerformanceTier, Achievement } from '@/types';

interface DashboardState {
    user: User | null;
    tasks: Task[];
    completions: TaskCompletion[];
    dailyLog: DailyLog | null;
    financeLog: any | null;
    score: number;
    tier: PerformanceTier;
    loading: boolean;
    error: string | null;
    achievements: Achievement[];
    newAchievement: Achievement | null;
    isEditing: boolean;
    lastFetched: number | null;
    isFirstDay: boolean;

    // Actions
    setInitialData: (data: {
        user: User;
        tasks: Task[];
        completions: TaskCompletion[];
        dailyLog: DailyLog;
        financeLog: any;
        achievements: Achievement[];
        isFirstDay: boolean;
    }) => void;
    fetchDashboardData: (force?: boolean) => Promise<void>;
    toggleTask: (taskId: string, completed: boolean) => void;
    updateTaskValue: (taskId: string, value: number) => void;
    toggleRestDay: () => Promise<void>;
    syncTask: (taskId: string, updates: Partial<TaskCompletion>) => Promise<void>;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    finishTour: () => Promise<void>;
    closeLog: () => Promise<void>;
    dismissAchievement: () => void;
    updateMoodEnergy: (mood: number | null, energy: number | null) => void;
    startEditLog: () => void;
    saveEditedLog: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
    user: null,
    tasks: [],
    completions: [],
    dailyLog: null,
    financeLog: null,
    score: 0,
    tier: 'CRITICAL',
    loading: true,
    error: null,
    achievements: [],
    newAchievement: null,
    isEditing: false,
    lastFetched: null,
    isFirstDay: false,

    setInitialData: (data) => {
        // Self-healing: Deduplicate tasks by name (case-insensitive)
        const uniqueTasks: Task[] = [];
        const seen = new Set<string>();
        const toDelete: string[] = [];

        // Sort by created_at to keep the oldest/first one
        const sortedTasks = [...data.tasks].sort((a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        for (const task of sortedTasks) {
            const key = task.name.trim().toLowerCase();
            if (seen.has(key)) {
                toDelete.push(task.id);
            } else {
                seen.add(key);
                uniqueTasks.push(task);
            }
        }

        if (toDelete.length > 0) {
            console.log(`Self-healing: Found ${toDelete.length} duplicate tasks. Triggering cleanup.`);
            // Fire and forget cleanup
            fetch('/api/debug/deduplicate');
        }

        const score = calculateDailyScore(data.completions, uniqueTasks);
        const tier = getPerformanceTier(score);

        // Resilient fallback: Check localStorage if DB column is missing or false
        const localTourDone = typeof window !== 'undefined' && localStorage.getItem('discipline_os_tour_done') === 'true';
        const user = {
            ...data.user,
            dashboard_tour_done: data.user.dashboard_tour_done || localTourDone
        };

        set({
            user,
            tasks: uniqueTasks,
            completions: data.completions,
            dailyLog: data.dailyLog,
            financeLog: data.financeLog,
            achievements: data.achievements || [],
            score,
            tier,
            loading: false,
            lastFetched: Date.now(),
            isFirstDay: data.isFirstDay
        });
    },

    fetchDashboardData: async (force = false) => {
        const { lastFetched, setLoading, setInitialData, setError } = get();
        const now = Date.now();
        const FIVE_MINUTES = 5 * 60 * 1000;

        if (!force && lastFetched && (now - lastFetched < FIVE_MINUTES)) {
            console.log('Dashboard data served from cache');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/dashboard/today');
            if (!res.ok) throw new Error('Failed to load dashboard');
            const data = await res.json();
            setInitialData(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    },

    toggleTask: (taskId, completed) => {
        const { completions, tasks } = get();
        const existing = completions.find((c) => c.task_id === taskId);

        let newCompletions;
        if (existing) {
            newCompletions = completions.map((c) =>
                c.task_id === taskId ? { ...c, completed, updated_at: new Date().toISOString() } : c
            );
        } else {
            newCompletions = [
                ...completions,
                {
                    task_id: taskId,
                    completed,
                    value_logged: null,
                    log_date: getTodayInKolkata(),
                    created_at: new Date().toISOString(),
                } as TaskCompletion,
            ];
        }

        const score = calculateDailyScore(newCompletions, tasks);
        const tier = getPerformanceTier(score);
        set({ completions: newCompletions, score, tier });

        // Trigger sync
        get().syncTask(taskId, { completed });
    },

    updateTaskValue: (taskId, value) => {
        const { completions, tasks } = get();
        const existing = completions.find((c) => c.task_id === taskId);

        let newCompletions;
        if (existing) {
            newCompletions = completions.map((c) =>
                c.task_id === taskId ? { ...c, value_logged: value, updated_at: new Date().toISOString() } : c
            );
        } else {
            newCompletions = [
                ...completions,
                {
                    task_id: taskId,
                    completed: value > 0,
                    value_logged: value,
                    log_date: getTodayInKolkata(),
                    created_at: new Date().toISOString(),
                } as TaskCompletion,
            ];
        }

        const score = calculateDailyScore(newCompletions, tasks);
        const tier = getPerformanceTier(score);
        set({ completions: newCompletions, score, tier });

        // Trigger sync
        get().syncTask(taskId, { value_logged: value });
    },

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    toggleRestDay: async () => {
        const { dailyLog } = get();
        if (!dailyLog) return;

        const isRestDay = !dailyLog.is_rest_day;

        // Optimistic update
        set({ dailyLog: { ...dailyLog, is_rest_day: isRestDay } });

        try {
            await fetch('/api/dashboard/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'rest_day',
                    payload: { isRestDay }
                }),
            });
        } catch (err) {
            console.error('Failed to sync rest day:', err);
            // Rollback on failure
            set({ dailyLog: { ...dailyLog, is_rest_day: !isRestDay } });
        }
    },

    syncTask: async (taskId: string, updates: Partial<TaskCompletion>) => {
        try {
            await fetch('/api/dashboard/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'task',
                    payload: { taskId, updates }
                }),
            });
        } catch (err) {
            console.error('Failed to sync task:', err);
        }
    },

    finishTour: async () => {
        const { user } = get();
        if (!user) return;

        // Optimistic update + localStorage sync
        if (typeof window !== 'undefined') {
            localStorage.setItem('discipline_os_tour_done', 'true');
        }
        set({ user: { ...user, dashboard_tour_done: true } });

        try {
            await fetch('/api/user/tour-done', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (err) {
            console.error('Failed to sync tour completion:', err);
        }
    },

    closeLog: async () => {
        const { dailyLog } = get();
        if (!dailyLog) return;

        // Optimistic update
        set({ dailyLog: { ...dailyLog, log_closed: true } });

        try {
            const res = await fetch('/api/dashboard/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'close_log' }),
            });
            const data = await res.json();

            if (data.achievements && data.achievements.length > 0) {
                set({
                    achievements: [...get().achievements, ...data.achievements],
                    newAchievement: data.achievements[0]
                });
            }
        } catch (err) {
            console.error('Failed to close log:', err);
        }
    },

    dismissAchievement: () => {
        set({ newAchievement: null });
    },

    updateMoodEnergy: (mood, energy) => {
        const { dailyLog, isEditing } = get();
        if (!dailyLog) return;
        set({ dailyLog: { ...dailyLog, mood: mood as any, energy: energy as any } });

        // Only sync immediately if not in full edit mode (which handles its own saving)
        if (!isEditing) {
            fetch('/api/dashboard/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'mood_energy', payload: { mood, energy } }),
            }).catch(err => console.error('Failed to sync mood/energy:', err));
        }
    },

    startEditLog: () => set({ isEditing: true }),

    saveEditedLog: async () => {
        const { dailyLog, completions, financeLog, isEditing } = get();
        if (!dailyLog || !isEditing) return;

        set({ loading: true });
        try {
            const res = await fetch(`/api/logs/${dailyLog.log_date}/edit`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskCompletions: completions,
                    financeData: financeLog,
                    reflection: dailyLog.reflection,
                    mood: dailyLog.mood,
                    energy: dailyLog.energy
                }),
            });

            if (!res.ok) throw new Error('Failed to save edits');
            const data = await res.json();

            // Update local state with new score and lock it back
            set({
                score: data.newScore,
                tier: getPerformanceTier(data.newScore),
                dailyLog: { ...dailyLog, score: data.newScore, log_closed: true },
                isEditing: false
            });
        } catch (err: any) {
            console.error('Failed to save edited log:', err);
            set({ error: err.message });
        } finally {
            set({ loading: false });
        }
    },
}));
