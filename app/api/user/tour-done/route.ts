import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { error: updateError } = await supabase
            .from('users')
            .update({ dashboard_tour_done: true })
            .eq('id', user.id);

        if (updateError) {
            console.warn('Tour completion sync to DB failed:', updateError.message);
            // We return success anyway because we have localStorage fallback 
            // and we don't want to show a 500 to the user.
            return NextResponse.json({ success: true, synced: false });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('API Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
