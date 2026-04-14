import { createClient } from '@/lib/supabase/server';
import { getTodayInKolkata } from '@/lib/utils';
import { NextResponse } from 'next/server';
import { generateReflection } from '@/lib/ai';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const today = getTodayInKolkata();

        // Rate limiting check
        // We check how many times the user has generated a reflection today
        // We use a dedicated column 'ai_gen_count' if it exists, or fallback to checking the reflection presence
        const { data: dailyLog, error: logFetchError } = await supabase
            .from('daily_logs')
            .select('ai_gen_count, ai_reflection, score, tasks_done, tasks_total, reflection, mood, energy')
            .eq('user_id', user.id)
            .eq('log_date', today)
            .single();

        if (logFetchError && logFetchError.code !== 'PGRST116') {
            return NextResponse.json({ error: logFetchError.message }, { status: 500 });
        }

        const currentCount = dailyLog?.ai_gen_count ?? (dailyLog?.ai_reflection ? 1 : 0);

        if (currentCount >= 3) {
            return NextResponse.json({ error: "Daily AI limit reached. Try again tomorrow." }, { status: 429 });
        }

        // Gather context for AI
        const { data: userProfile } = await supabase.from('users').select('full_name').eq('id', user.id).single();
        const { data: financeLog } = await supabase.from('finance_logs').select('*').eq('user_id', user.id).eq('log_date', today).single();
        const { data: streak } = await supabase.from('streaks').select('current_streak').eq('user_id', user.id).single();

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data: history } = await supabase
            .from('daily_logs').select('score').eq('user_id', user.id)
            .gte('log_date', sevenDaysAgo.toISOString().split('T')[0])
            .order('log_date', { ascending: true });

        const { data: completions } = await supabase
            .from('task_completions').select('*').eq('user_id', user.id).eq('log_date', today);

        const selfControlAvg = completions && completions.length > 0
            ? completions.reduce((s: number, c: any) => s + (c.self_control_score ?? 0), 0) / completions.length
            : 0;

        const context = {
            userName: userProfile?.full_name || 'Operator',
            todayScore: dailyLog?.score ?? 0,
            tasksCompleted: dailyLog?.tasks_done ?? 0,
            tasksTotal: dailyLog?.tasks_total ?? 0,
            selfControlScore: Math.round(selfControlAvg),
            financeLog: {
                cashInHand: financeLog?.cash_in_hand ?? 0,
                earning: financeLog?.earning ?? 0,
                expenditure: financeLog?.expenditure ?? 0
            },
            userReflection: dailyLog?.reflection || 'No reflection written.',
            last7DaysScores: (history || []).map((h: any) => h.score),
            currentStreak: streak?.current_streak ?? 0,
        };

        const aiText = await generateReflection(context);

        // Update with incremented count
        const { error: updateError } = await supabase.from('daily_logs')
            .update({
                ai_reflection: aiText,
                ai_gen_count: currentCount + 1
            })
            .eq('user_id', user.id)
            .eq('log_date', today);

        if (updateError) {
            // Fallback if ai_gen_count column doesn't exist yet
            const { error: fallbackError } = await supabase.from('daily_logs')
                .update({ ai_reflection: aiText })
                .eq('user_id', user.id)
                .eq('log_date', today);

            if (fallbackError) return NextResponse.json({ error: fallbackError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, aiReflection: aiText });
    } catch (err: any) {
        console.error('AI generation failed:', err);
        return NextResponse.json({ error: 'Failed to generate AI reflection' }, { status: 500 });
    }
}
