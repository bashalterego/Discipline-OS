import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Checks if an email can be sent to the user.
 * - Hard limit: 2 emails per user per day
 * - Resets counter when the date changes
 * - Respects notifications_enabled flag
 *
 * Returns true and increments the counter if email can be sent.
 * Returns false if the user is over-limit or has opted out.
 */
export async function canSendEmail(userId: string): Promise<boolean> {
    const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('notifications_enabled, emails_sent_today, last_email_date, email')
        .eq('id', userId)
        .single();

    if (error || !user) {
        console.error(`[rate-limit] Failed to fetch user ${userId}:`, error);
        return false;
    }

    if (!user.notifications_enabled) {
        return false;
    }

    const todayUTC = new Date().toISOString().split('T')[0]; // YYYY-MM-DD in UTC
    const lastEmailDate = user.last_email_date;

    let currentCount = user.emails_sent_today || 0;

    // Reset counter if it's a new day
    if (lastEmailDate !== todayUTC) {
        currentCount = 0;
    }

    // Hard limit: 2 emails per day
    if (currentCount >= 2) {
        return false;
    }

    // Increment counter and update last_email_date
    const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
            emails_sent_today: currentCount + 1,
            last_email_date: todayUTC,
        })
        .eq('id', userId);

    if (updateError) {
        console.error(`[rate-limit] Failed to update email count for ${userId}:`, updateError);
        return false;
    }

    return true;
}
