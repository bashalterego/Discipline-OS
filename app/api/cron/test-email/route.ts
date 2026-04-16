import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import {
    eveningReminderTemplate,
    urgentReminderTemplate,
    day2NudgeTemplate,
    weeklySummaryTemplate,
} from '@/lib/email-templates';

// Dev-only test endpoint — remove or gate before production
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const type = body.type;
        const userId = (body.userId as string)?.trim(); // strip accidental whitespace

        if (!type || !userId) {
            return NextResponse.json({ error: 'Missing type or userId' }, { status: 400 });
        }

        // Fetch user data
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, email, full_name')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found', queriedId: userId, supabaseError: userError?.message }, { status: 404 });
        }

        const { data: streak } = await supabaseAdmin
            .from('streaks')
            .select('current_streak')
            .eq('user_id', userId)
            .single();

        const currentStreak = streak?.current_streak || 5;

        let subject = '';
        let html = '';

        switch (type) {
            case 'evening':
                subject = "Your day isn't logged yet — 3 hours left";
                html = eveningReminderTemplate({
                    userId: user.id,
                    fullName: user.full_name || 'Warrior',
                    currentStreak,
                });
                break;

            case 'urgent':
                subject = `Your ${currentStreak} day streak ends in 90 minutes`;
                html = urgentReminderTemplate({
                    userId: user.id,
                    fullName: user.full_name || 'Warrior',
                    currentStreak,
                });
                break;

            case 'day2':
                subject = "Day 2 — don't let it die before it starts";
                html = day2NudgeTemplate({
                    userId: user.id,
                    fullName: user.full_name || 'Warrior',
                });
                break;

            case 'weekly':
                subject = "Week in review — 7.4/10 average";
                html = weeklySummaryTemplate({
                    userId: user.id,
                    fullName: user.full_name || 'Warrior',
                    avgScore: 7.4,
                    daysLogged: 6,
                    totalTasks: 42,
                    currentStreak,
                    bestDay: new Date().toISOString().split('T')[0],
                });
                break;

            default:
                return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
        }

        const result = await sendEmail(user.email, subject, html);

        return NextResponse.json({
            success: result.success,
            sentTo: user.email,
            type,
            error: result.error,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
