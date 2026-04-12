'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { memo } from 'react';

const NAV_SECTIONS = [
    {
        label: 'CORE',
        items: [
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/tasks', label: 'Tasks' },
            { href: '/finance', label: 'Finance' },
        ],
    },
    {
        label: 'INSIGHTS',
        items: [
            { href: '/analytics', label: 'Analytics' },
            { href: '/streaks', label: 'Streaks' },
            { href: '/reviews', label: 'Reviews' },
            { href: '/commitments', label: 'Commitments' },
            { href: '/reflection', label: 'Reflection' },
        ],
    },
    {
        label: 'SYSTEM',
        items: [
            { href: '/settings', label: 'Settings' },
            { href: '/profile', label: 'Profile' },
        ],
    },
];

interface SidebarProps {
    currentStreak?: number;
    userName?: string;
}

export default memo(function Sidebar({ currentStreak = 0, userName }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className="hidden md:flex flex-col h-screen sticky top-0"
            style={{
                width: '210px',
                minWidth: '210px',
                backgroundColor: 'var(--color-sidebar)',
                borderRight: '0.5px solid var(--color-border)',
                padding: '24px 0',
            }}
        >
            {/* Logo */}
            <div style={{ padding: '0 20px', marginBottom: '32px' }}>
                <div
                    style={{
                        fontFamily: 'var(--font-syne)',
                        fontWeight: 800,
                        fontSize: '13px',
                        letterSpacing: '0.08em',
                        color: 'var(--color-gold)',
                    }}
                >
                    DISCIPLINE_OS
                </div>
                <div
                    style={{
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: '8px',
                        letterSpacing: '0.12em',
                        color: 'var(--color-text-muted)',
                        marginTop: '3px',
                    }}
                >
                    PERSONAL COMMAND
                </div>
            </div>

            {/* Divider */}
            <div
                style={{
                    height: '0.5px',
                    backgroundColor: 'var(--color-divider)',
                    margin: '0 20px 20px',
                }}
            />

            {/* Nav Sections */}
            <nav style={{ flex: 1, overflow: 'auto', padding: '0 12px' }}>
                {NAV_SECTIONS.map((section) => (
                    <div key={section.label} style={{ marginBottom: '24px' }}>
                        <div
                            className="label-text"
                            style={{ padding: '0 8px', marginBottom: '6px' }}
                        >
                            {section.label}
                        </div>
                        {section.items.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '7px 8px',
                                        borderRadius: '6px',
                                        textDecoration: 'none',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        color: isActive
                                            ? 'var(--color-text-primary)'
                                            : 'var(--color-text-secondary)',
                                        backgroundColor: isActive
                                            ? 'rgba(200, 184, 154, 0.06)'
                                            : 'transparent',
                                        transition: 'all 0.15s ease',
                                        position: 'relative',
                                    }}
                                >
                                    {/* Active dot */}
                                    {isActive && (
                                        <span
                                            style={{
                                                width: '4px',
                                                height: '4px',
                                                borderRadius: '50%',
                                                backgroundColor: 'var(--color-gold)',
                                                flexShrink: 0,
                                            }}
                                        />
                                    )}
                                    {!isActive && (
                                        <span
                                            style={{
                                                width: '4px',
                                                height: '4px',
                                                flexShrink: 0,
                                            }}
                                        />
                                    )}
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Streak Display */}
            <div
                style={{
                    padding: '16px 20px',
                    borderTop: '0.5px solid var(--color-divider)',
                }}
            >
                <div
                    style={{
                        fontFamily: 'var(--font-syne)',
                        fontWeight: 800,
                        fontSize: '28px',
                        color: 'var(--color-gold)',
                        lineHeight: 1,
                    }}
                >
                    {String(currentStreak).padStart(2, '0')}
                </div>
                <div className="label-text" style={{ marginTop: '4px' }}>
                    DAY STREAK
                </div>
            </div>
        </aside>
    );
});
