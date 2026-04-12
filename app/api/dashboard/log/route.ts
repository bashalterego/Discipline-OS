import { createClient } from '@/lib/supabase/server';
import { getTodayInKolkata } from '@/lib/utils';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, payload } = await request.json();
    const today = getTodayInKolkata();

    if (type === 'task') {
        const { taskId, updates } = payload;
        const { error } = await supabase
            .from('task_completions')
            .upsert({
                user_id: user.id,
                task_id: taskId,
                log_date: today,
                ...updates,
                updated_at: new Date().toISOString(),
            });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (type === 'finance') {
        const { error } = await supabase
            .from('finance_logs')
            .upsert({
                user_id: user.id,
                log_date: today,
                ...payload,
            });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (type === 'reflection') {
        const { error } = await supabase
            .from('daily_logs')
            .update({ reflection: payload.text })
            .eq('user_id', user.id)
            .eq('log_date', today);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (type === 'mood_energy') {
        const update: Record<string, any> = {};
        if (payload.mood !== undefined) update.mood = payload.mood;
        if (payload.energy !== undefined) update.energy = payload.energy;
        const { error } = await supabase
            .from('daily_logs')
            .update(update)
            .eq('user_id', user.id)
            .eq('log_date', today);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (type === 'rest_day') {
        const { error } = await supabase
            .from('daily_logs')
            .update({ is_rest_day: payload.isRestDay })
            .eq('user_id', user.id)
            .eq('log_date', today);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (type === 'close_log') {
        const { error } = await supabase
            .from('daily_logs')
            .update({ log_closed: true })
            .eq('user_id', user.id)
            .eq('log_date', today);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        // Generate AI reflection in background (non-blocking)
        (async () => {
            try {
                const { data: userProfile } = await supabase.from('users').select('full_name').eq('id', user.id).single();
                const { data: todayLog } = await supabase.from('daily_logs').select('*').eq('user_id', user.id).eq('log_date', today).single();
                const { data: financeLog } = await supabase.from('finance_logs').select('*').eq('user_id', user.id).eq('log_date', today).single();
                const { data: streak } = await supabase.from('streaks').select('current_streak').eq('user_id', user.id).single();

                // Last 7 days scores
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const { data: history } = await supabase
                    .from('daily_logs').select('score').eq('user_id', user.id)
                    .gte('log_date', sevenDaysAgo.toISOString().split('T')[0])
                    .order('log_date', { ascending: true });

                const { data: completions } = await supabase
                    .from('task_completions').select('*').eq('user_id', user.id).eq('log_date', today);

                const selfControlAvg = completions && completions.length > 0
                    ? completions.reduce((s: number, c: any) => s + (c.self_control_score ?? 0), 0) / completions.length
                    : 0;

                const context = {
                    userName: userProfile?.full_name || 'Operator',
                    todayScore: todayLog?.score ?? 0,
                    tasksCompleted: todayLog?.tasks_done ?? 0,
                    tasksTotal: todayLog?.tasks_total ?? 0,
                    selfControlScore: Math.round(selfControlAvg),
                    financeLog: { cashInHand: financeLog?.cash_in_hand ?? 0, earning: financeLog?.earning ?? 0, expenditure: financeLog?.expenditure ?? 0 },
                    userReflection: todayLog?.reflection || 'No reflection written.',
                    last7DaysScores: (history || []).map((h: any) => h.score),
                    currentStreak: streak?.current_streak ?? 0,
                };

                const { generateReflection } = await import('@/lib/ai');
                const aiText = await generateReflection(context);

                await supabase.from('daily_logs')
                    .update({ ai_reflection: aiText })
                    .eq('user_id', user.id)
                    .eq('log_date', today);
            } catch (aiErr) {
                console.error('AI reflection generation failed (non-blocking):', aiErr);
            }
        })();

        const { checkAchievements } = await import('@/lib/achievements');
        const newAchievements = await checkAchievements(user.id, supabase);
        return NextResponse.json({ success: true, achievements: newAchievements });
    }

    return NextResponse.json({ success: true });
}
