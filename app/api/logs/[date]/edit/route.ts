import { createClient } from '@/lib/supabase/server';
import { calculateDailyScore } from '@/lib/scoring';
import { NextResponse } from 'next/server';
import { calculateNewStreak } from '@/lib/streak';
import { generateWeeklyReview } from '@/lib/reviews';

export async function PUT(
    request: Request,
    { params }: { params: { date: string } }
) {
    const { date: logDate } = await params;
    const supabase = await createClient();

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. 7-day Guard
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(logDate);
    const diffTime = today.getTime() - targetDate.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);

    if (diffDays > 7) {
        return NextResponse.json({ error: 'Log is older than 7 days and permanently locked' }, { status: 403 });
    }

    const { taskCompletions, financeData, reflection, mood, energy } = await request.json();

    // 2. Fetch active tasks for score recalculation
    const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('is_active', true);

    if (!tasks) return NextResponse.json({ error: 'Tasks not found' }, { status: 500 });

    // 3. Atomic Updates
    try {
        // A. Upsert task completions
        if (taskCompletions && taskCompletions.length > 0) {
            const { error: compError } = await supabase
                .from('task_completions')
                .upsert(
                    taskCompletions.map((c: { task_id: string, completed: boolean }) => ({
                        ...c,
                        user_id: authUser.id,
                        log_date: logDate,
                        updated_at: new Date().toISOString()
                    })),
                    { onConflict: 'user_id,task_id,log_date' }
                );
            if (compError) throw compError;
        }

        // B. Upsert finance log
        if (financeData) {
            const { error: finError } = await supabase
                .from('finance_logs')
                .upsert({
                    ...financeData,
                    user_id: authUser.id,
                    log_date: logDate,
                }, { onConflict: 'user_id,log_date' });
            if (finError) throw finError;
        }

        // C. Update Daily Log (Recalculate Score)
        const { data: currentCompletions } = await supabase
            .from('task_completions')
            .select('*')
            .eq('user_id', authUser.id)
            .eq('log_date', logDate);

        const newScore = calculateDailyScore(currentCompletions || [], tasks);
        const tasksDone = (currentCompletions || []).filter((c: any) => c.completed).length;

        const { error: logError } = await supabase
            .from('daily_logs')
            .update({
                score: newScore,
                tasks_done: tasksDone,
                tasks_total: tasks.length,
                reflection,
                mood,
                energy,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', authUser.id)
            .eq('log_date', logDate);

        if (logError) throw logError;

        // 4. Downstream: Recalculate Streak
        // Fetch user settings for streak threshold
        const { data: userProfile } = await supabase.from('users').select('strict_mode, recovery_mode').eq('id', authUser.id).single();

        // Simple streak rebuild: Fetch all logs from the beginning of time (or last 30/60/90 days)
        // For efficiency, we just grab all daily logs in order.
        const { data: allLogs } = await supabase
            .from('daily_logs')
            .select('log_date, score, is_rest_day')
            .eq('user_id', authUser.id)
            .order('log_date', { ascending: true });

        if (allLogs) {
            let currentStreak = 0;
            let longestStreak = 0;
            let lastActiveDate: string | null = null;
            let streakBrokenAt: string | null = null;

            // Mock streak object for calculateNewStreak
            let streakState = { current_streak: 0, longest_streak: 0, last_active_date: null, streak_broken_at: null } as any;

            for (const log of allLogs) {
                const updates = calculateNewStreak(
                    streakState,
                    log.log_date,
                    log.score,
                    log.is_rest_day,
                    { strict_mode: userProfile?.strict_mode || false, recovery_mode: userProfile?.recovery_mode || false }
                );
                streakState = { ...streakState, ...updates };
            }

            await supabase
                .from('streaks')
                .upsert({
                    user_id: authUser.id,
                    current_streak: streakState.current_streak,
                    longest_streak: streakState.longest_streak,
                    last_active_date: streakState.last_active_date,
                    streak_broken_at: streakState.streak_broken_at,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
        }

        // 5. Downstream: Update Weekly Review (if exists)
        // Find if this logDate fall into a review period.
        // Reviews are YYYY-MM-DD (start_date) to YYYY-MM-DD (end_date).
        const { data: review } = await supabase
            .from('weekly_reviews')
            .select('*')
            .eq('user_id', authUser.id)
            .lte('start_date', logDate)
            .gte('end_date', logDate)
            .single();

        if (review) {
            // Re-trigger review generation for that end_date
            await generateWeeklyReview(authUser.id, supabase, review.end_date);
        }

        return NextResponse.json({ success: true, newScore });

    } catch (err: any) {
        console.error('Edit transaction failed:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
