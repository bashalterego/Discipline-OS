import { createClient } from '@/lib/supabase/server';
import { getTodayInKolkata } from '@/lib/utils';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    try {
        const { data: logs, error } = await supabase
            .from('daily_logs')
            .select('log_date, score, tasks_done, tasks_total')
            .eq('user_id', user.id)
            .gte('log_date', startDateStr)
            .order('log_date', { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const safeLogs = logs || [];
        const dateMap = new Map(safeLogs.map((l: any) => [l.log_date, l]));
        const fullHistory = [];

        for (let i = 0; i <= days; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const dStr = d.toISOString().split('T')[0];

            const existing = dateMap.get(dStr) as any;
            if (existing) {
                const score = Number(existing.score);
                let tier = 'CRITICAL';
                if (score >= 9.0) tier = 'ELITE';
                else if (score >= 7.5) tier = 'OPTIMAL';
                else if (score >= 6.0) tier = 'ACTIVE';
                else if (score >= 4.0) tier = 'RECOVERING';

                fullHistory.push({
                    ...existing,
                    performance_tier: tier
                });
            } else {
                fullHistory.push({
                    log_date: dStr,
                    score: 0,
                    tasks_done: 0,
                    tasks_total: 0,
                    performance_tier: 'CRITICAL'
                });
            }
        }

        return NextResponse.json({ history: fullHistory });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
