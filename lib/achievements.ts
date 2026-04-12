import { SupabaseClient } from '@supabase/supabase-js';
import { Achievement, DailyLog, Streak, TaskCompletion, FinanceLog } from '@/types';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function checkAchievements(userId: string, supabase: SupabaseClient) {
    const achievementsToGrant: Omit<Achievement, 'id' | 'created_at' | 'seen'>[] = [];

    // 1. Get current state
    const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
    const { data: streak } = await supabase.from('streaks').select('*').eq('user_id', userId).single();
    const { data: logs } = await supabase.from('daily_logs').select('*').eq('user_id', userId).order('log_date', { ascending: false }).limit(7);
    const { data: financeLogs } = await supabase.from('finance_logs').select('*').eq('user_id', userId).order('log_date', { ascending: false }).limit(7);
    const { data: existingAchievements } = await supabase.from('achievements').select('type').eq('user_id', userId);

    const existingTypes = new Set(existingAchievements?.map(a => a.type) || []);
    const todayLog = logs?.[0];
    const yesterdayLog = logs?.[1];

    // --- STREAK MILESTONES ---
    const streakMilestones = [
        { days: 3, type: 'streak_3', title: '3 days strong. The habit is forming.', emoji: '🏅' },
        { days: 7, type: 'streak_7', title: 'One full week. Go grab a coffee — you earned it.', emoji: '☕' },
        { days: 14, type: 'streak_14', title: '2 weeks. Treat yourself to that meal.', emoji: '🍱' },
        { days: 21, type: 'streak_21', title: '21 days. Science says this is now a habit.', emoji: '🧠' },
        { days: 30, type: 'streak_30', title: '30 days. Go get ice cream — no guilt.', emoji: '🍦' },
        { days: 60, type: 'streak_60', title: '60 days. You are not the same person who started.', emoji: '🔥' },
        { days: 90, type: 'streak_90', title: '90 days. This is who you are now.', emoji: '👑' },
    ];

    if (streak) {
        for (const m of streakMilestones) {
            if (streak.current_streak >= m.days && !existingTypes.has(m.type)) {
                achievementsToGrant.push({
                    user_id: userId,
                    type: m.type,
                    title: m.title.split('.')[0] + '.',
                    message: m.title,
                    badge_emoji: m.emoji,
                    earned_at: new Date().toISOString(),
                    ai_message: null
                });
            }
        }
    }

    // --- SCORE ACHIEVEMENTS ---
    if (todayLog) {
        // Perfect Day
        if (todayLog.score >= 10 && !existingTypes.has('perfect_day')) {
            achievementsToGrant.push({
                user_id: userId,
                type: 'perfect_day',
                title: 'PERFECT SCORE',
                message: 'PERFECT. Everything done. Days like this build legends.',
                badge_emoji: '⭐',
                earned_at: new Date().toISOString(),
                ai_message: null
            });
        }

        // Comeback
        if (yesterdayLog && todayLog.score >= yesterdayLog.score + 3 && !existingTypes.has('comeback_' + todayLog.log_date)) {
            achievementsToGrant.push({
                user_id: userId,
                type: 'comeback_' + todayLog.log_date,
                title: 'THE COMEBACK',
                message: "That's a comeback. Remember this feeling.",
                badge_emoji: '📈',
                earned_at: new Date().toISOString(),
                ai_message: null
            });
        }

        // Elite Tier: score 9.0+ three days in a row
        const last3Logs = logs?.slice(0, 3);
        if (last3Logs?.length === 3 && last3Logs.every(l => l.score >= 9.0) && !existingTypes.has('elite_streak')) {
            achievementsToGrant.push({
                user_id: userId,
                type: 'elite_streak',
                title: 'ELITE PERFORMANCE',
                message: "3 days of ELITE performance. You're locked in.",
                badge_emoji: '💎',
                earned_at: new Date().toISOString(),
                ai_message: null
            });
        }

        // Full Self Control
        const { data: completions } = await supabase.from('task_completions').select('self_control_score').eq('user_id', userId).eq('log_date', todayLog.log_date);
        const maxSelfCtrl = Math.max(...(completions?.map(c => c.self_control_score || 0) || [0]));
        if (maxSelfCtrl === 3 && !existingTypes.has('full_self_control_' + todayLog.log_date)) {
            achievementsToGrant.push({
                user_id: userId,
                type: 'full_self_control_' + todayLog.log_date,
                title: 'IRON WILL',
                message: 'Full self control today. The hardest points to earn.',
                badge_emoji: '🛡️',
                earned_at: new Date().toISOString(),
                ai_message: null
            });
        }

        // Early Bird: wake up task done 5 days straight
        // We look for tasks with 'wake up' in the name
        const { data: wakeUpTasks } = await supabase.from('tasks').select('id').eq('user_id', userId).ilike('name', '%wake up%');
        if (wakeUpTasks && wakeUpTasks.length > 0) {
            const wakeUpIds = wakeUpTasks.map(t => t.id);
            const { data: recentWakeUps } = await supabase.from('task_completions')
                .select('log_date, completed')
                .eq('user_id', userId)
                .in('task_id', wakeUpIds)
                .order('log_date', { ascending: false })
                .limit(5);

            if (recentWakeUps?.length === 5 && recentWakeUps.every(c => c.completed) && !existingTypes.has('early_bird_streak')) {
                achievementsToGrant.push({
                    user_id: userId,
                    type: 'early_bird_streak',
                    title: 'EARLY BIRD',
                    message: '5 AM club, 5 days straight. Most people are still sleeping.',
                    badge_emoji: '🌅',
                    earned_at: new Date().toISOString(),
                    ai_message: null
                });
            }
        }
    }

    // --- FINANCE ACHIEVEMENTS ---
    if (financeLogs && financeLogs.length > 0) {
        const todayFinance = financeLogs[0];

        // First Saving
        if (todayFinance.earning > todayFinance.expenditure && !existingTypes.has('first_saving')) {
            achievementsToGrant.push({
                user_id: userId,
                type: 'first_saving',
                title: 'WEALTH SEED',
                message: 'You saved money today. Small win, big habit.',
                badge_emoji: '💰',
                earned_at: new Date().toISOString(),
                ai_message: null
            });
        }

        // Zero Spend Day
        if (todayFinance.expenditure === 0 && !existingTypes.has('zero_spend_' + todayFinance.log_date)) {
            achievementsToGrant.push({
                user_id: userId,
                type: 'zero_spend_' + todayFinance.log_date,
                title: 'FINANCIAL DISCIPLINE',
                message: 'Zero spend day. Discipline extends to money too.',
                badge_emoji: '🚫',
                earned_at: new Date().toISOString(),
                ai_message: null
            });
        }

        // Weekly Surplus: 7 days earning > spending
        if (financeLogs.length === 7 && financeLogs.every(f => f.earning >= f.expenditure) && !existingTypes.has('weekly_surplus')) {
            achievementsToGrant.push({
                user_id: userId,
                type: 'weekly_surplus',
                title: 'MONEY STREAK',
                message: '7 day money streak. Financial discipline unlocked.',
                badge_emoji: '🏦',
                earned_at: new Date().toISOString(),
                ai_message: null
            });
        }
    }

    // --- GRANT ACHIEVEMENTS ---
    const granted: Achievement[] = [];
    for (const achievement of achievementsToGrant) {
        // Generate AI Message
        let aiMessage = null;
        try {
            const response = await anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 100,
                system: "You are a direct, best-friend style AI coach for DisciplineOS. No corporate talk. Be blunt, supportive, and use the user's name. Personalized to the achievement.",
                messages: [{
                    role: 'user',
                    content: `User: ${user?.full_name || 'My friend'}. Achievement: ${achievement.title}. Context: ${achievement.message}. Current Streak: ${streak?.current_streak || 0} days. Write a short 1-2 sentence personalized message.`
                }]
            });
            aiMessage = (response.content[0] as any).text;
        } catch (e) {
            console.error('Claude API failed:', e);
        }

        try {
            const { data, error } = await supabase.from('achievements').insert({
                ...achievement,
                ai_message: aiMessage
            }).select().single();

            if (!error && data) {
                granted.push(data);
            } else if (error) {
                console.error('Failed to insert achievement:', error);
            }
        } catch (dbError) {
            console.error('Database error in checkAchievements:', dbError);
        }
    }

    return granted;
}
