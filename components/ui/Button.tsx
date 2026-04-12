'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        const variants = {
            primary: 'bg-gold text-bg hover:opacity-90',
            secondary: 'bg-white/5 text-text-secondary border-0.5 border-border hover:bg-white/10',
            outline: 'bg-transparent border-0.5 border-border text-text-secondary hover:border-gold hover:text-gold',
            ghost: 'bg-transparent text-text-muted hover:text-text-secondary hover:bg-white/5',
            danger: 'bg-accent-red/10 border-0.5 border-accent-red text-accent-red hover:bg-accent-red/20',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-[11px]',
            md: 'px-6 py-2.5 text-[13px]',
            lg: 'px-8 py-3.5 text-[15px]',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-md font-syne font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';

export default Button;
