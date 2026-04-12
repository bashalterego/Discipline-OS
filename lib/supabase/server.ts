import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
    const cookieStore = await cookies();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase credentials missing. Returning dummy client.');
        const dummyAuth = {
            getUser: async () => ({ data: { user: null }, error: null }),
            signUp: async () => ({
                data: { user: null },
                error: { message: 'Supabase not configured. Please fill in your .env.local file with valid credentials.' },
            }),
            signInWithPassword: async () => ({
                data: { user: null },
                error: { message: 'Supabase not configured. Please fill in your .env.local file with valid credentials.' },
            }),
            signOut: async () => ({ error: null }),
        };
        return {
            auth: dummyAuth,
            from: () => ({
                select: () => ({ single: async () => ({ data: null, error: null }) }),
                insert: async () => ({ data: null, error: null }),
                update: () => ({ eq: async () => ({ data: null, error: null }) }),
            }),
        } as any;
    }

    return createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch {
                    // The `setAll` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing user sessions.
                }
            },
        },
    });
}

export async function createAdminClient() {
    const cookieStore = await cookies();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.warn('Supabase Admin credentials missing. Returning dummy client.');
        return {
            auth: { getUser: async () => ({ data: { user: null }, error: null }) },
            from: () => ({
                select: () => ({ single: async () => ({ data: null, error: null }) }),
                insert: async () => ({ data: null, error: null }),
                update: () => ({ eq: async () => ({ data: null, error: null }) }),
            }),
        } as any;
    }

    return createServerClient(supabaseUrl, serviceRoleKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch { }
            },
        },
    });
}
