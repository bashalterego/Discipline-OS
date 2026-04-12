import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
        .from('commitments')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ commitments: data || [] });
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { title, duration_days, is_public } = body;

    if (!title || !duration_days) {
        return NextResponse.json({ error: 'title and duration_days are required' }, { status: 400 });
    }

    const startDate = new Date().toISOString().split('T')[0];
    const endDateObj = new Date();
    endDateObj.setDate(endDateObj.getDate() + parseInt(duration_days, 10));
    const endDate = endDateObj.toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('commitments')
        .insert({
            user_id: authUser.id,
            title,
            duration_days: parseInt(duration_days, 10),
            start_date: startDate,
            end_date: endDate,
            is_public: is_public ?? false,
            status: 'active',
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ commitment: data }, { status: 201 });
}
