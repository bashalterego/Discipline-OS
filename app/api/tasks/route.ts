import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', authUser.id)
        .order('sort_order', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ tasks: data || [] });
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    console.log('[POST /api/tasks] body received:', body);

    const { name, type, points, target_value, target_unit } = body;

    if (!name || !type) {
        return NextResponse.json({ error: 'name and type are required' }, { status: 400 });
    }

    // Get max sort_order to append new task at end
    const { data: existing } = await supabase
        .from('tasks')
        .select('sort_order')
        .eq('user_id', authUser.id)
        .order('sort_order', { ascending: false })
        .limit(1);

    const nextOrder = existing && existing.length > 0 ? (existing[0].sort_order + 1) : 0;
    console.log('[POST /api/tasks] inserting with sort_order:', nextOrder);

    const { data, error } = await supabase
        .from('tasks')
        .insert({
            user_id: authUser.id,
            name,
            type,
            points: parseFloat(points) || 1.0,
            target_value: target_value ? parseFloat(target_value) : null,
            target_unit: target_unit || null,
            is_core: false,
            is_active: true,
            sort_order: nextOrder,
        })
        .select()
        .single();

    console.log('[POST /api/tasks] insert result:', { data, error });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ task: data }, { status: 201 });
}
