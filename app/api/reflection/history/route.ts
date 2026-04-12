import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('daily_logs')
        .select('log_date, reflection, ai_reflection, mood, energy, score, tasks_done, tasks_total, is_rest_day, log_closed')
        .eq('user_id', authUser.id)
        .gte('log_date', cutoffStr)
        .order('log_date', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ entries: data || [] }, {
        headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59'
        }
    });
}
