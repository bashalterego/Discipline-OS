'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Button from './Button';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text-primary)',
                    padding: '24px',
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        fontFamily: 'var(--font-syne)',
                        fontSize: '32px',
                        marginBottom: '16px',
                        color: 'var(--color-red)'
                    }}>
                        SYSTEM FAILURE
                    </h1>
                    <p style={{
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: '14px',
                        color: 'var(--color-text-secondary)',
                        marginBottom: '32px',
                        maxWidth: '400px'
                    }}>
                        A critical error occurred. The system state has been protected.
                    </p>
                    <div style={{
                        padding: '16px',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        borderRadius: '8px',
                        border: '0.5px solid var(--color-border)',
                        fontFamily: 'var(--font-dm-mono)',
                        fontSize: '12px',
                        color: 'var(--color-text-muted)',
                        marginBottom: '32px',
                        textAlign: 'left',
                        width: '100%',
                        maxWidth: '500px',
                        overflow: 'auto'
                    }}>
                        {this.state.error?.message}
                    </div>
                    <Button
                        onClick={() => window.location.reload()}
                        variant="primary"
                    >
                        REBOOT SYSTEM
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
