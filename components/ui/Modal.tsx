'use client';

import { ReactNode, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    className?: string;
}

export default function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            />

            {/* Content */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
                <div
                    className={cn(
                        'bg-card border-0.5 border-border rounded-card w-full max-w-md overflow-hidden',
                        className
                    )}
                >
                    {title && (
                        <div className="px-6 py-4 border-b-0.5 border-divider flex items-center justify-between">
                            <h3 className="font-syne font-bold text-text-primary">{title}</h3>
                            <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
                                ✕
                            </button>
                        </div>
                    )}
                    <div className="p-6">{children}</div>
                </div>
            </div>
        </>
    );
}
