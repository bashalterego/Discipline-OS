'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MOBILE_NAV = [
    { href: '/dashboard', label: 'Home', icon: '⊞' },
    { href: '/tasks', label: 'Tasks', icon: '☑' },
    { href: '/finance', label: 'Finance', icon: '₹' },
    { href: '/commitments', label: 'Pledge', icon: '🔒' },
    { href: '/reviews', label: 'Reviews', icon: '⟁' },
    { href: '/profile', label: 'Profile', icon: '◯' },
];

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <nav
            className="flex md:hidden"
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: '60px',
                backgroundColor: 'var(--color-sidebar)',
                borderTop: '0.5px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                padding: '0 8px',
                zIndex: 50,
            }}
        >
            {MOBILE_NAV.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '3px',
                            textDecoration: 'none',
                            opacity: isActive ? 1 : 0.4,
                            transition: 'opacity 0.15s ease',
                            minWidth: '48px',
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>{item.icon}</span>
                        <span
                            style={{
                                fontFamily: 'var(--font-dm-mono)',
                                fontSize: '9px',
                                color: isActive
                                    ? 'var(--color-gold)'
                                    : 'var(--color-text-muted)',
                                letterSpacing: '0.05em',
                            }}
                        >
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
