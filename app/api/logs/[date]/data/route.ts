import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { date: string } }
) {
    const { date } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Get Tasks (all active ones, though for historical logs we might technically need what was active *then*, 
    // but the system design implies we use current active tasks as the "system")
    const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    if (tasksError) return NextResponse.json({ error: tasksError.message }, { status: 500 });

    // 2. Get Daily Log
    const { data: dailyLog, error: logError } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('log_date', date)
        .single();

    if (logError && logError.code !== 'PGRST116') {
        return NextResponse.json({ error: logError.message }, { status: 500 });
    }

    // 3. Get Task Completions
    const { data: completions, error: compError } = await supabase
        .from('task_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('log_date', date);

    if (compError) return NextResponse.json({ error: compError.message }, { status: 500 });

    // 4. Get Finance Log
    const { data: financeLog } = await supabase
        .from('finance_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('log_date', date)
        .single();

    return NextResponse.json({
        tasks,
        dailyLog: dailyLog || null,
        completions: completions || [],
        financeLog: financeLog || null,
    }, {
        headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59'
        }
    });
}
