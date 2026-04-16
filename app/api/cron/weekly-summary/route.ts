import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { canSendEmail } from '@/lib/email-rate-limit';
import { weeklySummaryTemplate } from '@/lib/email-templates';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function verifyCronAuth(request: Request): boolean {
    return request.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: Request) {
    if (!verifyCronAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let sent = 0;
    let skipped = 0;
    const errors: string[] = [];

    try {
        const { data: users, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, email, full_name')
            .eq('onboarding_done', true)
            .eq('notifications_enabled', true);

        if (userError) {
            return NextResponse.json({ error: userError.message }, { status: 500 });
        }

        for (const user of users || []) {
            try {
                // Rate limit check first
                const canSend = await canSendEmail(user.id);
                if (!canSend) {
                    skipped++;
                    continue;
                }

                // Fetch last 7 closed logs
                const { data: logs } = await supabaseAdmin
                    .from('daily_logs')
                    .select('log_date, score, tasks_done, log_closed')
                    .eq('user_id', user.id)
                    .eq('log_closed', true)
                    .order('log_date', { ascending: false })
                    .limit(7);

                if (!logs || logs.length === 0) {
                    skipped++;
                    continue;
                }

                // Calculate stats
                const avgScore = logs.reduce((sum, l) => sum + (l.score || 0), 0) / logs.length;
                const totalTasks = logs.reduce((sum, l) => sum + (l.tasks_done || 0), 0);
                const daysLogged = logs.length;
                const bestDay = logs.reduce((best, l) => (!best || l.score > best.score) ? l : best, logs[0]).log_date;

                // Fetch streak
                const { data: streak } = await supabaseAdmin
                    .from('streaks')
                    .select('current_streak')
                    .eq('user_id', user.id)
                    .single();

                const html = weeklySummaryTemplate({
                    userId: user.id,
                    fullName: user.full_name || 'Warrior',
                    avgScore,
                    daysLogged,
                    totalTasks,
                    currentStreak: streak?.current_streak || 0,
                    bestDay,
                });

                const result = await sendEmail(
                    user.email,
                    `Week in review — ${avgScore.toFixed(1)}/10 average`,
                    html
                );

                if (result.success) {
                    sent++;
                } else {
                    skipped++;
                    errors.push(`${user.id}: ${result.error}`);
                }
            } catch (userErr: any) {
                console.error(`[weekly-summary] Error for user ${user.id}:`, userErr);
                errors.push(`${user.id}: ${userErr.message}`);
                skipped++;
            }
        }
    } catch (err: any) {
        console.error('[weekly-summary] Fatal error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }

    return NextResponse.json({ sent, skipped, errors });
}
