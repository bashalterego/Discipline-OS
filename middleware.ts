import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = [
    '/',
    '/login',
    '/signup',
    '/auth/login',
    '/auth/signup',
    '/api/auth/login',
    '/api/auth/signup',
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public paths
    const isPublic =
        PUBLIC_PATHS.some((p) => pathname === p) ||
        pathname.startsWith('/api/auth/') ||
        pathname.startsWith('/api/cron/') ||
        pathname.startsWith('/api/notifications/');

    const { supabaseResponse, user } = await updateSession(request);

    if (!user && !isPublic) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (user && (pathname === '/login' || pathname === '/signup')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
