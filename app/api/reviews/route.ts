import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateWeeklyReview, getWeeklyReviews } from '@/lib/reviews';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const reviews = await getWeeklyReviews(user.id, supabase);
        return NextResponse.json({ reviews });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { endDate } = await request.json();

    try {
        const review = await generateWeeklyReview(user.id, supabase, endDate);
        if (!review) {
            return NextResponse.json({
                error: 'Insufficient data for a weekly review. Please save at least one daily log first.'
            }, { status: 400 });
        }
        return NextResponse.json({ success: true, review });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
