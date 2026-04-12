import { cn } from '@/lib/utils';

interface StatusPillProps {
    text: string;
    variant?: 'gold' | 'sage' | 'red' | 'amber' | 'muted';
    className?: string;
}

export default function StatusPill({ text, variant = 'gold', className }: StatusPillProps) {
    const variants = {
        gold: 'border-gold/30 text-gold bg-gold/5',
        sage: 'border-sage/30 text-sage bg-sage/5',
        red: 'border-accent-red/30 text-accent-red bg-accent-red/5',
        amber: 'border-amber/30 text-amber bg-amber/5',
        muted: 'border-border text-text-muted bg-white/5',
    };

    return (
        <span
            className={cn(
                'font-mono text-[9px] font-medium tracking-widest uppercase border-0.5 rounded-[4px] px-2.5 py-1',
                variants[variant],
                className
            )}
        >
            {text}
        </span>
    );
}
