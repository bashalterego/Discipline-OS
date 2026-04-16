import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { calculateDailyScore, getPerformanceTier } from '@/lib/scoring';
import { calculateNewStreak } from '@/lib/streak';
import { checkAchievements } from '@/lib/achievements';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getTodayIST(): string {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

function verifyCronAuth(request: Request): boolean {
    return request.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: Request) {
    if (!verifyCronAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let closed = 0;
    let skipped = 0;
    const errors: string[] = [];
    const todayIST = getTodayIST();

    try {
        // Find all unclosed logs for today
        const { data: unclosedLogs, error: logError } = await supabaseAdmin
            .from('daily_logs')
            .select('id, user_id, log_date, is_rest_day')
            .eq('log_date', todayIST)
            .eq('log_closed', false);

        if (logError) {
            return NextResponse.json({ error: logError.message }, { status: 500 });
        }

        for (const log of unclosedLogs || []) {
            try {
                // Fetch user settings
                const { data: user } = await supabaseAdmin
                    .from('users')
                    .select('strict_mode, recovery_mode, freeze_tokens')
                    .eq('id', log.user_id)
                    .single();

                // Fetch active tasks
                const { data: tasks } = await supabaseAdmin
                    .from('tasks')
                    .select('*')
                    .eq('user_id', log.user_id)
                    .eq('is_active', true);

                // Fetch completions for this log
                const { data: completions } = await supabaseAdmin
                    .from('task_completions')
                    .select('*')
                    .eq('user_id', log.user_id)
                    .eq('log_date', todayIST);

                const score = calculateDailyScore(completions || [], tasks || []);
                const tasksDone = (completions || []).filter(c => c.completed).length;

                // Update log as closed with final score
                const { error: updateError } = await supabaseAdmin
                    .from('daily_logs')
                    .update({
                        log_closed: true,
                        score,
                        tasks_done: tasksDone,
                        tasks_total: (tasks || []).length,
                        efficiency_pct: (tasks || []).length > 0
                            ? Math.round((tasksDone / (tasks || []).length) * 100)
                            : 0,
                    })
                    .eq('id', log.id);

                if (updateError) {
                    errors.push(`${log.user_id}: log update - ${updateError.message}`);
                    skipped++;
                    continue;
                }

                // Update streak
                const { data: streak } = await supabaseAdmin
                    .from('streaks')
                    .select('*')
                    .eq('user_id', log.user_id)
                    .single();

                if (streak && user) {
                    const streakUpdate = calculateNewStreak(
                        streak,
                        todayIST,
                        score,
                        log.is_rest_day || false,
                        { strict_mode: user.strict_mode, recovery_mode: user.recovery_mode }
                    );

                    await supabaseAdmin
                        .from('streaks')
                        .update(streakUpdate)
                        .eq('user_id', log.user_id);
                }

                // Check achievements
                try {
                    await checkAchievements(log.user_id, supabaseAdmin);
                } catch (achieveErr: any) {
                    console.error(`[close-logs] Achievement check failed for ${log.user_id}:`, achieveErr);
                }

                // Award streak freeze token if score >= 9.0
                if (score >= 9.0 && user) {
                    await supabaseAdmin
                        .from('users')
                        .update({ freeze_tokens: (user.freeze_tokens || 0) + 1 })
                        .eq('id', log.user_id);
                }

                closed++;
            } catch (logErr: any) {
                console.error(`[close-logs] Error for log ${log.id}:`, logErr);
                errors.push(`${log.user_id}: ${logErr.message}`);
                skipped++;
            }
        }
    } catch (err: any) {
        console.error('[close-logs] Fatal error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }

    return NextResponse.json({ closed, skipped, errors });
}
