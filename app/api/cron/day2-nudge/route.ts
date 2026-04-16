import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { canSendEmail } from '@/lib/email-rate-limit';
import { day2NudgeTemplate } from '@/lib/email-templates';

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
        // Users whose created_at in IST timezone was yesterday
        // We use raw SQL via rpc or a filtered query
        // Using a Supabase approach: fetch users and filter in JS for reliability
        const { data: users, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, email, full_name, created_at')
            .eq('onboarding_done', true)
            .eq('notifications_enabled', true);

        if (userError) {
            return NextResponse.json({ error: userError.message }, { status: 500 });
        }

        // Calculate yesterday in IST
        const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        const yesterdayIST = new Date(nowIST);
        yesterdayIST.setDate(yesterdayIST.getDate() - 1);
        const yesterdayISTStr = yesterdayIST.toLocaleDateString('en-CA'); // YYYY-MM-DD

        for (const user of users || []) {
            try {
                // Convert user's created_at to IST date
                const createdAtIST = new Date(user.created_at).toLocaleDateString('en-CA', {
                    timeZone: 'Asia/Kolkata',
                });

                if (createdAtIST !== yesterdayISTStr) {
                    skipped++;
                    continue;
                }

                // Rate limit check
                const canSend = await canSendEmail(user.id);
                if (!canSend) {
                    skipped++;
                    continue;
                }

                const html = day2NudgeTemplate({
                    userId: user.id,
                    fullName: user.full_name || 'Warrior',
                });

                const result = await sendEmail(
                    user.email,
                    "Day 2 — don't let it die before it starts",
                    html
                );

                if (result.success) {
                    sent++;
                } else {
                    skipped++;
                    errors.push(`${user.id}: ${result.error}`);
                }
            } catch (userErr: any) {
                console.error(`[day2-nudge] Error for user ${user.id}:`, userErr);
                errors.push(`${user.id}: ${userErr.message}`);
                skipped++;
            }
        }
    } catch (err: any) {
        console.error('[day2-nudge] Fatal error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }

    return NextResponse.json({ sent, skipped, errors });
}
