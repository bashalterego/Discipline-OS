import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

function toDateStr(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export async function POST() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const now = new Date();
    const logs = [];
    const finance = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dateStr = toDateStr(date);
        const score = parseFloat((7 + Math.random() * 3).toFixed(2));
        const earning = Math.floor(500 + Math.random() * 1500);
        const expenditure = Math.floor(100 + Math.random() * 500);

        logs.push({
            user_id: user.id,
            log_date: dateStr,
            score,
            tasks_done: Math.floor(6 + Math.random() * 4),
            tasks_total: 10,
            efficiency_pct: Math.floor(score * 10),
            reflection: i === 0
                ? 'Strong day. Hit everything on the list.'
                : i === 2
                    ? 'Struggled with focus. Recovered by evening.'
                    : null,
            log_closed: true,
            is_rest_day: false
        });

        finance.push({
            user_id: user.id,
            log_date: dateStr,
            earning,
            expenditure,
            cash_in_hand: earning - expenditure,
            notes: null
        });
    }

    const { error: logErr } = await supabase
        .from('daily_logs')
        .upsert(logs, { onConflict: 'user_id,log_date' });

    if (logErr) {
        console.error('Seed logs error:', logErr);
        return NextResponse.json({ error: logErr.message }, { status: 500 });
    }

    await supabase
        .from('finance_logs')
        .upsert(finance, { onConflict: 'user_id,log_date' });

    return NextResponse.json({ success: true, message: `Seeded 7 days of test data through ${toDateStr(now)}.` });
}
