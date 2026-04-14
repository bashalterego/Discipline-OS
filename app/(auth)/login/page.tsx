'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');
            router.push('/dashboard');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            style={{
                minHeight: '100dvh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--color-bg)',
                padding: '24px',
            }}
        >
            <div style={{ width: '100%', maxWidth: '380px' }}>
                {/* Header */}
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <div
                        style={{
                            fontFamily: 'var(--font-syne)',
                            fontWeight: 800,
                            fontSize: '16px',
                            letterSpacing: '0.1em',
                            color: 'var(--color-gold)',
                            marginBottom: '8px',
                        }}
                    >
                        DISCIPLINE_OS
                    </div>
                    <h1
                        style={{
                            fontFamily: 'var(--font-syne)',
                            fontWeight: 700,
                            fontSize: '24px',
                            color: 'var(--color-text-primary)',
                            marginBottom: '8px',
                        }}
                    >
                        Welcome back.
                    </h1>
                    <p
                        style={{
                            fontFamily: 'var(--font-dm-mono)',
                            fontSize: '12px',
                            color: 'var(--color-text-muted)',
                        }}
                    >
                        Continue building your discipline.
                    </p>
                </div>

                {/* Form Card */}
                <div className="card" style={{ padding: '28px' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label
                                htmlFor="email"
                                className="label-text"
                                style={{ display: 'block', marginBottom: '8px' }}
                            >
                                EMAIL
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    border: '0.5px solid var(--color-border)',
                                    borderRadius: '6px',
                                    color: 'var(--color-text-primary)',
                                    fontFamily: 'var(--font-dm-mono)',
                                    fontSize: '13px',
                                    outline: 'none',
                                    transition: 'border-color 0.15s',
                                }}
                                onFocus={(e) => (e.target.style.borderColor = 'var(--color-gold)')}
                                onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label
                                htmlFor="password"
                                className="label-text"
                                style={{ display: 'block' }}
                            >
                                PASSWORD
                            </label>
                            <Link
                                href="/auth/reset-password"
                                style={{
                                    fontFamily: 'var(--font-dm-mono)',
                                    fontSize: '10px',
                                    color: 'var(--color-gold)',
                                    textDecoration: 'none'
                                }}
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                border: '0.5px solid var(--color-border)',
                                borderRadius: '6px',
                                color: 'var(--color-text-primary)',
                                fontFamily: 'var(--font-dm-mono)',
                                fontSize: '13px',
                                outline: 'none',
                                transition: 'border-color 0.15s',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = 'var(--color-gold)')}
                            onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
                        />

                        {error && (
                            <div
                                style={{
                                    padding: '10px 14px',
                                    backgroundColor: 'rgba(191, 123, 123, 0.08)',
                                    border: '0.5px solid var(--color-red)',
                                    borderRadius: '6px',
                                    fontFamily: 'var(--font-dm-mono)',
                                    fontSize: '12px',
                                    color: 'var(--color-red)',
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: loading
                                    ? 'rgba(200, 184, 154, 0.2)'
                                    : 'var(--color-gold)',
                                border: 'none',
                                borderRadius: '6px',
                                color: loading ? 'var(--color-gold)' : '#0E0E10',
                                fontFamily: 'var(--font-syne)',
                                fontWeight: 700,
                                fontSize: '13px',
                                letterSpacing: '0.05em',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.15s ease',
                                marginTop: '4px',
                            }}
                        >
                            {loading ? 'SIGNING IN...' : 'SIGN IN'}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p
                    style={{
                        textAlign: 'center',
                        marginTop: '20px',
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: '12px',
                        color: 'var(--color-text-muted)',
                    }}
                >
                    No account?{' '}
                    <Link
                        href="/signup"
                        style={{ color: 'var(--color-gold)', textDecoration: 'none' }}
                    >
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}
