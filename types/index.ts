// ─── User ───────────────────────────────────────────────────────────────────
export interface User {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    identity_statement: string | null;
    archetype: 'athlete' | 'scholar' | 'monk' | 'warrior' | null;
    difficulty_tier: 'beginner' | 'intermediate' | 'elite';
    strict_mode: boolean;
    recovery_mode: boolean;
    timezone: string;
    onboarding_done: boolean;
    dashboard_tour_done: boolean;
    created_at: string;
}

export interface Achievement {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    ai_message: string | null;
    badge_emoji: string;
    earned_at: string;
    seen: boolean;
    created_at: string;
}

// ─── Task ────────────────────────────────────────────────────────────────────
export type TaskType = 'boolean' | 'quantitative' | 'duration' | 'scale_0_3';

export interface Task {
    id: string;
    user_id: string;
    name: string;
    type: TaskType;
    target_value: number | null;
    target_unit: string | null;
    points: number;
    is_core: boolean;
    is_active: boolean;
    sort_order: number;
    preferred_time: 'morning' | 'afternoon' | 'evening' | null;
    created_at: string;
}

// ─── Daily Log ───────────────────────────────────────────────────────────────
export interface DailyLog {
    id: string;
    user_id: string;
    log_date: string; // ISO date string YYYY-MM-DD
    score: number;
    tasks_done: number;
    tasks_total: number;
    efficiency_pct: number;
    mood: 1 | 2 | 3 | 4 | 5 | null;
    energy: 1 | 2 | 3 | 4 | 5 | null;
    reflection: string | null;
    ai_reflection: string | null;
    is_rest_day: boolean;
    log_closed: boolean;
    created_at: string;
}

// ─── Task Completion ─────────────────────────────────────────────────────────
export interface TaskCompletion {
    id: string;
    user_id: string;
    task_id: string;
    log_date: string;
    completed: boolean;
    value_logged: number | null;
    self_control_score: 0 | 1 | 2 | 3 | null;
    failure_reason: string | null;
    created_at: string;
}

// ─── Finance Log ─────────────────────────────────────────────────────────────
export interface FinanceLog {
    id: string;
    user_id: string;
    log_date: string;
    cash_in_hand: number;
    earning: number;
    expenditure: number;
    notes: string | null;
    created_at: string;
}

// ─── Streak ──────────────────────────────────────────────────────────────────
export interface Streak {
    id: string;
    user_id: string;
    current_streak: number;
    longest_streak: number;
    last_active_date: string | null;
    streak_broken_at: string | null;
    created_at: string;
}

// ─── Commitment ──────────────────────────────────────────────────────────────
export interface Commitment {
    id: string;
    user_id: string;
    title: string;
    duration_days: 30 | 60 | 90;
    start_date: string | null;
    end_date: string | null;
    is_public: boolean;
    status: 'active' | 'completed' | 'broken';
    created_at: string;
}

// ─── Scoring ─────────────────────────────────────────────────────────────────
export type PerformanceTier = 'ELITE' | 'OPTIMAL' | 'ACTIVE' | 'RECOVERING' | 'CRITICAL';

// ─── Dashboard Data ──────────────────────────────────────────────────────────
export interface DashboardData {
    log: DailyLog;
    tasks: Task[];
    completions: TaskCompletion[];
    financeLog: FinanceLog | null;
    streak: Streak | null;
    user: User;
}

// ─── Onboarding ──────────────────────────────────────────────────────────────
export interface OnboardingData {
    fullName: string;
    identityStatement: string;
    archetype: User['archetype'];
    difficultyTier: User['difficulty_tier'];
    customTasks: Array<{
        name: string;
        type: TaskType;
        points: number;
        target_value: number | null;
        target_unit: string | null;
        preferred_time: 'morning' | 'afternoon' | 'evening';
    }>;
    commitment: {
        title: string;
        durationDays: 30 | 60 | 90;
    } | null;
}

// ─── Weekly Review ──────────────────────────────────────────────────────────
export interface WeeklyReview {
    id: string;
    user_id: string;
    start_date: string;
    end_date: string;
    avg_score: number;
    total_tasks_completed: number;
    finance_surplus: number;
    ai_verdict: string | null;
    ai_directive: string | null;
    created_at: string;
}

// ─── AI Reflection Context ───────────────────────────────────────────────────
export interface ReflectionContext {
    userName: string;
    todayScore: number;
    tasksCompleted: number;
    tasksTotal: number;
    selfControlScore: number;
    financeLog: { cashInHand: number; earning: number; expenditure: number };
    userReflection: string;
    last7DaysScores: number[];
    currentStreak: number;
}
