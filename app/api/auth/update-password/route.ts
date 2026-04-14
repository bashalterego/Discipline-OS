import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();
        const supabase = await createClient();

        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        if (error) {
            console.error('Password update failed:', error.message);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'Password updated successfully' });
    } catch (err: any) {
        console.error('CRITICAL ERROR in /api/auth/update-password:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
