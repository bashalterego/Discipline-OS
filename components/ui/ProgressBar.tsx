import { cn } from '@/lib/utils';

interface ProgressBarProps {
    value: number; // 0 to 100
    max?: number;
    className?: string;
    color?: string;
}

export default function ProgressBar({
    value,
    max = 100,
    className,
    color = 'var(--color-gold)',
}: ProgressBarProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
        <div
            className={cn('w-full bg-divider rounded-[2px] h-[3px] overflow-hidden', className)}
        >
            <div
                className="h-full transition-all duration-500 ease-out"
                style={{
                    width: `${percentage}%`,
                    backgroundColor: color,
                }}
            />
        </div>
    );
}
