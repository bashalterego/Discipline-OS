'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send reset email');

            setStatus('success');
            setMessage('A reset link has been sent to your email.');
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message);
        }
    }

    return (
        <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)', padding: '24px' }}>
            <div style={{ width: '100%', maxWidth: '380px' }}>
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '16px', letterSpacing: '0.1em', color: 'var(--color-gold)', marginBottom: '8px' }}>
                        DISCIPLINE_OS
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '24px', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                        Reset Password
                    </h1>
                    <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        Enter your email to receive a recovery link.
                    </p>
                </div>

                <div className="card" style={{ padding: '28px' }}>
                    {status === 'success' ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', marginBottom: '16px' }}>📧</div>
                            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '14px', color: 'var(--color-sage)', marginBottom: '24px' }}>
                                {message}
                            </p>
                            <Link href="/login" style={{ display: 'block', padding: '12px', backgroundColor: 'var(--color-gold)', borderRadius: '6px', color: '#0E0E10', fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
                                RETURN TO LOGIN
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="label-text" style={{ display: 'block', marginBottom: '8px' }}>EMAIL</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                    style={{
                                        width: '100%', padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.03)',
                                        border: '0.5px solid var(--color-border)', borderRadius: '6px',
                                        color: 'var(--color-text-primary)', fontFamily: 'var(--font-dm-mono)', fontSize: '13px', outline: 'none'
                                    }}
                                />
                            </div>

                            {status === 'error' && (
                                <div style={{ padding: '10px 14px', backgroundColor: 'rgba(191, 123, 123, 0.08)', border: '0.5px solid var(--color-red)', borderRadius: '6px', fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: 'var(--color-red)' }}>
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                style={{
                                    width: '100%', padding: '12px',
                                    backgroundColor: status === 'loading' ? 'rgba(200, 184, 154, 0.2)' : 'var(--color-gold)',
                                    border: 'none', borderRadius: '6px', color: status === 'loading' ? 'var(--color-gold)' : '#0E0E10',
                                    fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em',
                                    cursor: status === 'loading' ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {status === 'loading' ? 'SENDING...' : 'SEND RESET LINK'}
                            </button>
                        </form>
                    )}
                </div>

                <p style={{ textAlign: 'center', marginTop: '20px', fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    Remember your password? <Link href="/login" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>Back to login</Link>
                </p>
            </div>
        </div>
    );
}
