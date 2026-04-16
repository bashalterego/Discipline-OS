import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch profile + streak
    const [{ data: profile }, { data: streak }] = await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase.from('streaks').select('*').eq('user_id', user.id).single(),
    ]);

    // Redirect to onboarding if not done
    if (profile && !profile.onboarding_done) {
        redirect('/onboarding');
    }

    return (
        <div
            style={{
                display: 'flex',
                height: '100dvh',
                backgroundColor: 'var(--color-bg)',
                overflow: 'hidden',
            }}
        >
            <Sidebar
                currentStreak={streak?.current_streak ?? 0}
                userName={profile?.full_name ?? ''}
            />
            <main
                className="p-3 md:p-7"
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    paddingBottom: '80px', // mobile nav clearance
                }}
            >
                {children}
            </main>
            <MobileNav />
        </div>
    );
}
