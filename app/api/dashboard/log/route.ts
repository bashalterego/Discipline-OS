import { createClient } from '@/lib/supabase/server';
import { getTodayInKolkata } from '@/lib/utils';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, payload } = await request.json();
    const today = getTodayInKolkata();

    if (type === 'task') {
        const { taskId, updates } = payload;
        const { error } = await supabase
            .from('task_completions')
            .upsert({
                user_id: user.id,
                task_id: taskId,
                log_date: today,
                ...updates,
                updated_at: new Date().toISOString(),
            });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (type === 'finance') {
        const { error } = await supabase
            .from('finance_logs')
            .upsert({
                user_id: user.id,
                log_date: today,
                ...payload,
            });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (type === 'reflection') {
        const { error } = await supabase
            .from('daily_logs')
            .update({ reflection: payload.text })
            .eq('user_id', user.id)
            .eq('log_date', today);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (type === 'mood_energy') {
        const update: Record<string, any> = {};
        if (payload.mood !== undefined) update.mood = payload.mood;
        if (payload.energy !== undefined) update.energy = payload.energy;
        const { error } = await supabase
            .from('daily_logs')
            .update(update)
            .eq('user_id', user.id)
            .eq('log_date', today);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (type === 'rest_day') {
        const { error } = await supabase
            .from('daily_logs')
            .update({ is_rest_day: payload.isRestDay })
            .eq('user_id', user.id)
            .eq('log_date', today);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (type === 'close_log') {
        const { data: log } = await supabase
            .from('daily_logs')
            .select('score')
            .eq('user_id', user.id)
            .eq('log_date', today)
            .single();

        const { error } = await supabase
            .from('daily_logs')
            .update({ log_closed: true })
            .eq('user_id', user.id)
            .eq('log_date', today);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        // Award streak freeze if score >= 9.0
        if (log && log.score >= 9.0) {
            const { data: userData } = await supabase
                .from('users')
                .select('freeze_tokens')
                .eq('id', user.id)
                .single();

            if (userData) {
                await supabase
                    .from('users')
                    .update({ freeze_tokens: userData.freeze_tokens + 1 })
                    .eq('id', user.id);
            }
        }

        // Generate AI reflection in background (non-blocking)
        // ... (keeping existing AI logic)
        (async () => {
            try {
                const protocol = request.url.startsWith('https') ? 'https' : 'http';
                const host = request.headers.get('host');
                const baseUrl = `${protocol}://${host}`;

                await fetch(`${baseUrl}/api/reflection/ai-generate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': request.headers.get('Cookie') || ''
                    },
                });
            } catch (aiErr) {
                console.error('Background AI reflection generation failed:', aiErr);
            }
        })();

        const { checkAchievements } = await import('@/lib/achievements');
        const newAchievements = await checkAchievements(user.id, supabase);
        return NextResponse.json({ success: true, achievements: newAchievements });
    }

    if (type === 'freeze') {
        const { data: userData } = await supabase
            .from('users')
            .select('freeze_tokens, last_freeze_date')
            .eq('id', user.id)
            .single();

        if (!userData || userData.freeze_tokens <= 0) {
            return NextResponse.json({ error: 'No freeze tokens available' }, { status: 400 });
        }

        if (userData.last_freeze_date === today) {
            return NextResponse.json({ error: 'Already used a freeze token today' }, { status: 400 });
        }

        // Use token and update last freeze date
        const { error: userUpdateError } = await supabase
            .from('users')
            .update({
                freeze_tokens: userData.freeze_tokens - 1,
                last_freeze_date: today
            })
            .eq('id', user.id);

        if (userUpdateError) return NextResponse.json({ error: userUpdateError.message }, { status: 500 });

        // Update daily log to mark as freeze/rest if needed, or just let the midnight cron handle it
        // For now, we'll mark the log as a rest day since it's effectively the same for streak preservation
        const { error: logError } = await supabase
            .from('daily_logs')
            .update({ is_rest_day: true, reflection: 'STREAK PROTECTED' })
            .eq('user_id', user.id)
            .eq('log_date', today);

        if (logError) return NextResponse.json({ error: logError.message }, { status: 500 });

        return NextResponse.json({ success: true, tokensRemaining: userData.freeze_tokens - 1 });
    }

    return NextResponse.json({ success: true });
}
