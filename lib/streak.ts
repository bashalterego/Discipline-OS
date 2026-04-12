import type { Streak } from '@/types';

export function calculateNewStreak(
    streak: Streak,
    logDate: string,
    score: number,
    isRestDay: boolean,
    settings: { strict_mode: boolean; recovery_mode: boolean }
): Partial<Streak> {
    const today = logDate;
    const lastActive = streak.last_active_date;

    // Determine if the day counts towards streak
    let counts = false;
    const threshold = settings.strict_mode ? 8.0 : settings.recovery_mode ? 4.0 : 6.0;

    if (isRestDay) {
        counts = true; // Rest days are safe havens
    } else {
        counts = score >= threshold;
    }

    if (!counts) {
        // Streak broken
        return {
            current_streak: 0,
            streak_broken_at: today,
            last_active_date: lastActive, // keep last active as is to calculate gap next time
        };
    }

    if (!lastActive) {
        return {
            current_streak: 1,
            longest_streak: Math.max(1, streak.longest_streak),
            last_active_date: today,
        };
    }

    const last = new Date(lastActive);
    const current = new Date(today);
    const diffMs = current.getTime() - last.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
        // Consecutive or same-day update
        const isNewDay = diffDays === 1;
        const newStreak = isNewDay ? streak.current_streak + 1 : streak.current_streak;

        return {
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, streak.longest_streak),
            last_active_date: today,
        };
    } else {
        // Gap in days
        return {
            current_streak: 1,
            streak_broken_at: today,
            last_active_date: today,
        };
    }
}
