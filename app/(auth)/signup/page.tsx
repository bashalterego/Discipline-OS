'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, fullName }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Signup failed');
            router.push('/onboarding');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    const inputStyle = {
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
    };

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
                        Begin your system.
                    </h1>
                    <p
                        style={{
                            fontFamily: 'var(--font-dm-mono)',
                            fontSize: '12px',
                            color: 'var(--color-text-muted)',
                        }}
                    >
                        Accountability starts here.
                    </p>
                </div>

                <div className="card" style={{ padding: '28px' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label htmlFor="name" className="label-text" style={{ display: 'block', marginBottom: '8px' }}>
                                FULL NAME
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                placeholder="Sailesh Kumar"
                                style={inputStyle}
                                onFocus={(e) => (e.target.style.borderColor = 'var(--color-gold)')}
                                onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="label-text" style={{ display: 'block', marginBottom: '8px' }}>
                                EMAIL
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                                style={inputStyle}
                                onFocus={(e) => (e.target.style.borderColor = 'var(--color-gold)')}
                                onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="label-text" style={{ display: 'block', marginBottom: '8px' }}>
                                PASSWORD
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                placeholder="Min 8 characters"
                                style={inputStyle}
                                onFocus={(e) => (e.target.style.borderColor = 'var(--color-gold)')}
                                onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
                            />
                        </div>

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
                                backgroundColor: loading ? 'rgba(200, 184, 154, 0.2)' : 'var(--color-gold)',
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
                            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                        </button>
                    </form>
                </div>

                <p
                    style={{
                        textAlign: 'center',
                        marginTop: '20px',
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: '12px',
                        color: 'var(--color-text-muted)',
                    }}
                >
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
