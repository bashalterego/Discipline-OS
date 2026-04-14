import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            fullName,
            identityStatement,
            archetype,
            difficultyTier,
            customTasks,
            commitment,
        } = body;

        // Update user profile
        const profileUpdate: any = {
            full_name: fullName,
            identity_statement: identityStatement,
            archetype,
            difficulty_tier: difficultyTier,
            strict_mode: difficultyTier === 'elite',
            onboarding_done: true,
        };

        // Try to include dashboard_tour_done if the column exists
        const { error: profileError } = await supabase
            .from('users')
            .update({ ...profileUpdate, dashboard_tour_done: false })
            .eq('id', user.id);

        if (profileError) {
            console.warn('Profile update fallback triggered:', profileError.message);
            const { error: retryError } = await supabase
                .from('users')
                .update(profileUpdate)
                .eq('id', user.id);

            if (retryError) {
                console.error('Final profile update attempt failed:', retryError.message);
                return NextResponse.json({ error: retryError.message }, { status: 500 });
            }
        }

        // --- Task Seeding Logic ---
        // 1. Check if tasks already exist to prevent redundant seeding or duplicate errors
        const { data: existingTasks, error: checkError } = await supabase
            .from('tasks')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);

        if (checkError) {
            console.error('Checking existing tasks failed:', checkError.message);
        }

        // 2. Only seed if no tasks exist. Skip if they already do.
        if (existingTasks && existingTasks.length > 0) {
            console.log('Tasks already exist for user, skipping seeding.');
        } else {
            const taskRows = customTasks.map((task: any, idx: number) => ({
                user_id: user.id,
                is_core: true,
                is_active: true,
                name: task.name,
                type: task.type,
                points: task.points,
                target_value: task.target_value,
                target_unit: task.target_unit,
                preferred_time: task.preferred_time,
                sort_order: idx + 1,
            }));

            const { error: tasksError } = await supabase.from('tasks').insert(taskRows);
            if (tasksError) {
                // Fallback: If preferred_time column is missing, retry without it
                if (tasksError.message.includes('preferred_time')) {
                    console.warn('Falling back: preferred_time missing in DB');
                    const fallbackRows = taskRows.map(({ preferred_time, ...rest }: any) => rest);
                    const { error: retryError } = await supabase.from('tasks').insert(fallbackRows);
                    if (retryError) {
                        console.error('Task seeding retry failed:', retryError.message);
                        throw new Error(`Task seeding failed: ${retryError.message}`);
                    }
                } else {
                    console.error('Task seeding failed:', tasksError.message);
                    throw new Error(`Task seeding failed: ${tasksError.message}`);
                }
            }
        }

        // Create streak record
        await supabase
            .from('streaks')
            .upsert({ user_id: user.id, current_streak: 0, longest_streak: 0, last_active_date: null }, { onConflict: 'user_id' });

        // Create commitment if provided
        if (commitment?.title) {
            const startDate = new Date().toISOString().split('T')[0];
            const endDate = new Date(Date.now() + commitment.durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            await supabase.from('commitments').insert({
                user_id: user.id,
                title: commitment.title,
                duration_days: commitment.durationDays,
                start_date: startDate,
                end_date: endDate,
                status: 'active',
            });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('CRITICAL ERROR in /api/onboarding/complete:', err);
        return NextResponse.json({ error: err.message || 'Server encountered a critical error during onboarding' }, { status: 500 });
    }
}
