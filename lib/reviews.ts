import { SupabaseClient } from '@supabase/supabase-js';
import { WeeklyReview } from '@/types';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/** Parse a YYYY-MM-DD string safely without timezone offset issues */
function parseLocalDate(dateStr: string): Date {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function toDateStr(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export async function generateWeeklyReview(userId: string, supabase: SupabaseClient, endDate: string) {
    // 1. Calculate date range (Last 7 days including endDate)
    const end = parseLocalDate(endDate);
    const start = parseLocalDate(endDate);
    start.setDate(end.getDate() - 6);

    const startDateStr = toDateStr(start);
    const endDateStr = toDateStr(end);

    // 2. Fetch all data for the week
    const { data: logs, error: logError } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('log_date', startDateStr)
        .lte('log_date', endDateStr)
        .order('log_date', { ascending: true });

    if (logError) {
        console.error('Error fetching logs for review:', logError);
        throw logError;
    }

    if (!logs || logs.length === 0) {
        return null;
    }

    const { data: financeLogs } = await supabase
        .from('finance_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('log_date', startDateStr)
        .lte('log_date', endDateStr);

    const { data: user } = await supabase
        .from('users')
        .select('full_name, archetype')
        .eq('id', userId)
        .single();

    // 3. Aggregate Metrics
    const totalScore = logs.reduce((sum, log) => sum + (log.score || 0), 0);
    const avgScore = totalScore / logs.length;
    const totalTasksCompleted = logs.reduce((sum, log) => sum + (log.tasks_done || 0), 0);
    const financeSurplus = financeLogs?.reduce((sum, f) => sum + ((f.earning || 0) - (f.expenditure || 0)), 0) ?? 0;

    // 4. AI Synthesis with Claude
    let aiVerdict = 'Performance data analyzed. Your consistency is being tracked.';
    let aiDirective = 'Maintain your momentum and eliminate distractions.';

    try {
        const logSummaries = logs.map(l =>
            `${l.log_date}: Score ${(l.score || 0).toFixed(1)}, Tasks ${l.tasks_done || 0}/${l.tasks_total || 0}${l.reflection ? `, Note: "${l.reflection}"` : ''}`
        ).join('\n');

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 400,
            system: `You are the Lead Coach for DisciplineOS. Tone: high-performance, blunt, data-driven, no corporate fluff. Like a world-class personal trainer who knows your numbers.`,
            messages: [{
                role: 'user',
                content: `Analyze this week for ${user?.full_name || 'Warrior'} (${user?.archetype || 'unknown archetype'}).

Weekly Stats:
- Avg Score: ${avgScore.toFixed(2)} / 10
- Tasks Completed: ${totalTasksCompleted}
- Financial Surplus: ${financeSurplus >= 0 ? '+' : ''}${financeSurplus.toFixed(0)}

Daily Log:
${logSummaries}

Respond ONLY in this exact format (no extra commentary):
VERDICT: [2-3 sentences: what worked, what failed]
DIRECTIVE: [1-2 punchy sentences: focus for next week]`
            }]
        });

        const text = (response.content[0] as any).text as string;
        const verdictMatch = text.match(/VERDICT:\s*([\s\S]*?)(?=\nDIRECTIVE:|$)/i);
        const directiveMatch = text.match(/DIRECTIVE:\s*([\s\S]*)/i);

        if (verdictMatch?.[1]) aiVerdict = verdictMatch[1].trim();
        if (directiveMatch?.[1]) aiDirective = directiveMatch[1].trim();
    } catch (e) {
        console.error('Claude API failed for weekly review:', e);
        // Use fallback verdicts — don't throw
    }

    // 5. Save and Return
    const review = {
        user_id: userId,
        start_date: startDateStr,
        end_date: endDateStr,
        avg_score: avgScore,
        total_tasks_completed: totalTasksCompleted,
        finance_surplus: financeSurplus,
        ai_verdict: aiVerdict,
        ai_directive: aiDirective
    };

    const { data, error } = await supabase
        .from('weekly_reviews')
        .upsert(review, { onConflict: 'user_id,start_date' })
        .select()
        .single();

    if (error) {
        console.error('Error saving weekly review:', error);
        throw error;
    }
    return data as WeeklyReview;
}

export async function getWeeklyReviews(userId: string, supabase: SupabaseClient): Promise<WeeklyReview[]> {
    const { data, error } = await supabase
        .from('weekly_reviews')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false });

    if (error) {
        console.error('Error fetching weekly reviews:', error);
        throw error;
    }
    return (data as WeeklyReview[]) || [];
}
