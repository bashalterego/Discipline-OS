import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { confirmation } = await request.json();
        if (confirmation !== 'DELETE') {
            return NextResponse.json({ error: 'Invalid confirmation' }, { status: 400 });
        }

        // Initialize admin client with service role key
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        console.log(`Starting deletion for user: ${user.id}`);

        // 1. Delete user data from all public tables in order
        // Order: task_completions -> finance_logs -> daily_logs -> streaks -> commitments -> achievements -> tasks -> users

        const tables = [
            'task_completions',
            'finance_logs',
            'daily_logs',
            'streaks',
            'commitments',
            'achievements',
            'tasks'
        ];

        for (const table of tables) {
            const { error: deleteError } = await supabaseAdmin
                .from(table)
                .delete()
                .eq('user_id', user.id);

            if (deleteError) {
                console.error(`Error deleting from ${table}:`, deleteError.message);
                // We continue despite errors in individual tables to ensure we try everything
            }
        }

        // 2. Delete from public.users (profile)
        const { error: profileDeleteError } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', user.id);

        if (profileDeleteError) {
            console.error('Error deleting public profile:', profileDeleteError.message);
        }

        // 3. Delete from auth.users (requires service_role key)
        const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

        if (authDeleteError) {
            console.error('Error deleting auth user:', authDeleteError.message);
            // If this fails, it's likely due to the service_role key being invalid
            if (authDeleteError.message.includes('API key')) {
                return NextResponse.json({
                    error: 'System configuration error: Invalid Service Role Key. Please contact support or update .env.local.'
                }, { status: 500 });
            }
            return NextResponse.json({ error: authDeleteError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Account deleted successfully' });
    } catch (err: any) {
        console.error('CRITICAL ERROR in /api/user/delete-account:', err);
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}
