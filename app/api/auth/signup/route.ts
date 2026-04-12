import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { email, password, fullName } = await request.json();

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName },
        },
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data.user) {
        return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
    }

    // Insert user profile using admin client to bypass RLS during registration
    const adminSupabase = await createAdminClient();
    const { error: profileError } = await adminSupabase.from('users').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        onboarding_done: false,
    });

    if (profileError && profileError.code !== '23505') {
        // Ignore duplicate key errors (user may already exist)
        return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ user: data.user });
}
