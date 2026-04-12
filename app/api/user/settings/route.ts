import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    // Whitelist only allowed fields
    const allowed = ['identity_statement', 'difficulty_tier', 'strict_mode', 'recovery_mode', 'full_name'];
    const update: Record<string, any> = {};
    for (const key of allowed) {
        if (key in body) update[key] = body[key];
    }

    if (Object.keys(update).length === 0) {
        return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('users')
        .update(update)
        .eq('id', authUser.id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ user: data });
}
