import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('token');

        if (!userId) {
            return new Response(
                '<html><body style="font-family:Arial;background:#0E0E10;color:#C8C6BF;padding:40px;text-align:center;"><h1 style="color:#C8B89A;">DISCIPLINE_OS</h1><p>Invalid unsubscribe link.</p></body></html>',
                { status: 400, headers: { 'Content-Type': 'text/html' } }
            );
        }

        const { error } = await supabaseAdmin
            .from('users')
            .update({ notifications_enabled: false })
            .eq('id', userId);

        if (error) {
            console.error('[unsubscribe] Failed:', error);
            return new Response(
                '<html><body style="font-family:Arial;background:#0E0E10;color:#C8C6BF;padding:40px;text-align:center;"><h1 style="color:#C8B89A;">DISCIPLINE_OS</h1><p>Something went wrong. Please try again.</p></body></html>',
                { status: 500, headers: { 'Content-Type': 'text/html' } }
            );
        }

        return new Response(
            `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Unsubscribed</title></head>
<body style="margin:0;background:#0E0E10;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="text-align:center;max-width:480px;padding:40px;">
    <p style="font-size:13px;font-weight:bold;letter-spacing:0.12em;color:#C8B89A;margin-bottom:32px;">DISCIPLINE_OS</p>
    <h1 style="color:#FFFFFF;font-family:Georgia,serif;font-size:28px;margin-bottom:16px;">You've been unsubscribed.</h1>
    <p style="color:#C8C6BF;font-size:16px;line-height:1.8;">You will no longer receive email notifications from DisciplineOS.</p>
  </div>
</body>
</html>`,
            { status: 200, headers: { 'Content-Type': 'text/html' } }
        );
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
