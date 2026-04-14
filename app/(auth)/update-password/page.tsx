'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch('/api/auth/update-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update password');

            setStatus('success');
            setMessage('Password updated successfully.');
            setTimeout(() => router.push('/login'), 2000);
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
                        Set New Password
                    </h1>
                    <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        Secure your account with a new master password.
                    </p>
                </div>

                <div className="card" style={{ padding: '28px' }}>
                    {status === 'success' ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🛡️</div>
                            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '14px', color: 'var(--color-sage)', marginBottom: '12px' }}>
                                {message}
                            </p>
                            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                Redirecting to login...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="label-text" style={{ display: 'block', marginBottom: '8px' }}>NEW PASSWORD</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    style={{
                                        width: '100%', padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.03)',
                                        border: '0.5px solid var(--color-border)', borderRadius: '6px',
                                        color: 'var(--color-text-primary)', fontFamily: 'var(--font-dm-mono)', fontSize: '13px', outline: 'none'
                                    }}
                                />
                            </div>

                            <div>
                                <label className="label-text" style={{ display: 'block', marginBottom: '8px' }}>CONFIRM PASSWORD</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
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
                                {status === 'loading' ? 'UPDATING...' : 'UPDATE PASSWORD'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
