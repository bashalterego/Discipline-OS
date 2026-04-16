import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { canSendEmail } from '@/lib/email-rate-limit';
import { urgentReminderTemplate } from '@/lib/email-templates';

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

    let sent = 0;
    let skipped = 0;
    const errors: string[] = [];
    const todayIST = getTodayIST();

    try {
        // Only users with streak >= 3
        const { data: users, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, email, full_name')
            .eq('onboarding_done', true)
            .eq('notifications_enabled', true)
            .eq('timezone', 'Asia/Kolkata');

        if (userError) {
            return NextResponse.json({ error: userError.message }, { status: 500 });
        }

        for (const user of users || []) {
            try {
                // Fetch streak — only continue if >= 3
                const { data: streak } = await supabaseAdmin
                    .from('streaks')
                    .select('current_streak')
                    .eq('user_id', user.id)
                    .single();

                const currentStreak = streak?.current_streak || 0;
                if (currentStreak < 3) {
                    skipped++;
                    continue;
                }

                // Check log is still unclosed
                const { data: log } = await supabaseAdmin
                    .from('daily_logs')
                    .select('log_closed')
                    .eq('user_id', user.id)
                    .eq('log_date', todayIST)
                    .single();

                const hasUnclosedLog = !log || log.log_closed === false;
                if (!hasUnclosedLog) {
                    skipped++;
                    continue;
                }

                // Rate limit check
                const canSend = await canSendEmail(user.id);
                if (!canSend) {
                    skipped++;
                    continue;
                }

                const html = urgentReminderTemplate({
                    userId: user.id,
                    fullName: user.full_name || 'Warrior',
                    currentStreak,
                });

                const result = await sendEmail(
                    user.email,
                    `Your ${currentStreak} day streak ends in 90 minutes`,
                    html
                );

                if (result.success) {
                    sent++;
                } else {
                    skipped++;
                    errors.push(`${user.id}: ${result.error}`);
                }
            } catch (userErr: any) {
                console.error(`[reminder-urgent] Error for user ${user.id}:`, userErr);
                errors.push(`${user.id}: ${userErr.message}`);
                skipped++;
            }
        }
    } catch (err: any) {
        console.error('[reminder-urgent] Fatal error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }

    return NextResponse.json({ sent, skipped, errors });
}
