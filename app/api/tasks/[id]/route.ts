import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const allowed = ['name', 'type', 'points', 'target_value', 'target_unit', 'preferred_time', 'is_active', 'sort_order', 'is_core'];
    const update: Record<string, any> = {};
    for (const key of allowed) {
        if (key in body) update[key] = body[key];
    }

    const { data, error } = await supabase
        .from('tasks')
        .update(update)
        .eq('id', params.id)
        .eq('user_id', authUser.id)
        .select()
        .single();

    if (error) {
        // Fallback: If preferred_time column is missing, retry without it
        if (error.message.includes('preferred_time') && 'preferred_time' in update) {
            console.warn('Task update with preferred_time failed, retrying without it:', error.message);
            const { preferred_time, ...fallbackUpdate } = update;
            const { data: retryData, error: retryError } = await supabase
                .from('tasks')
                .update(fallbackUpdate)
                .eq('id', params.id)
                .eq('user_id', authUser.id)
                .select()
                .single();

            if (retryError) return NextResponse.json({ error: retryError.message }, { status: 500 });
            return NextResponse.json({ task: retryData });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ task: data });
}

export async function DELETE(
    _request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Soft-delete: set is_active = false
    const { error } = await supabase
        .from('tasks')
        .update({ is_active: false })
        .eq('id', params.id)
        .eq('user_id', authUser.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
