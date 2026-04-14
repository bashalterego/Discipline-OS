import { createClient } from '@/lib/supabase/server';
import { getTodayInKolkata } from '@/lib/utils';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = getTodayInKolkata();

    // 1. Get User Profile
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

    if (userError) return NextResponse.json({ error: userError.message }, { status: 500 });

    // 2. Get Tasks
    const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    if (tasksError) return NextResponse.json({ error: tasksError.message }, { status: 500 });

    // 3. Get/Create Daily Log
    let { data: dailyLog, error: logError } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('log_date', today)
        .single();

    if (logError && logError.code === 'PGRST116') {
        // Create it
        const { data: newLog, error: createError } = await supabase
            .from('daily_logs')
            .insert({
                user_id: authUser.id,
                log_date: today,
                score: 0,
                tasks_done: 0,
                tasks_total: tasks.length,
            })
            .select()
            .single();

        if (createError) return NextResponse.json({ error: createError.message }, { status: 500 });
        dailyLog = newLog;
    } else if (logError) {
        return NextResponse.json({ error: logError.message }, { status: 500 });
    }

    // 4. Get Task Completions
    const { data: completions, error: compError } = await supabase
        .from('task_completions')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('log_date', today);

    if (compError) return NextResponse.json({ error: compError.message }, { status: 500 });

    // 5. Get Finance Log
    const { data: financeLog } = await supabase
        .from('finance_logs')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('log_date', today)
        .single();

    // 6. Get Streak
    const { data: streak } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

    // 7. Check if this is the first day (only one log exists)
    const { count } = await supabase
        .from('daily_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', authUser.id);

    const isFirstDay = count === 1;

    return NextResponse.json({
        user,
        tasks,
        dailyLog,
        completions: completions || [],
        financeLog: financeLog || null,
        streak: streak || null,
        isFirstDay
    });
}
