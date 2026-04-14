import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        const supabase = await createClient();
        const origin = request.headers.get('origin');

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${origin}/auth/update-password`,
        });

        if (error) {
            console.error('Password reset request failed:', error.message);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'Password reset link sent to your email' });
    } catch (err: any) {
        console.error('CRITICAL ERROR in /api/auth/reset-password:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
