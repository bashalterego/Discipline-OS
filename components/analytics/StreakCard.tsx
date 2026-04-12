import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface StreakCardProps {
    currentStreak: number;
    longestStreak: number;
    className?: string;
}

export default function StreakCard({ currentStreak, longestStreak, className }: StreakCardProps) {
    return (
        <Card className={cn('flex flex-col gap-4', className)}>
            <div className="flex items-center justify-between">
                <h3 className="font-syne font-bold text-[14px] text-text-primary uppercase tracking-widest">
                    Current Streak
                </h3>
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                    <span className="text-gold">🔥</span>
                </div>
            </div>

            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-syne font-bold text-gold">{currentStreak}</span>
                <span className="text-text-muted font-mono text-[10px] uppercase">Days</span>
            </div>

            <div className="flex flex-col gap-1 mt-2">
                <div className="flex items-center justify-between text-[10px] uppercase font-mono text-text-muted">
                    <span>Longest Streak</span>
                    <span className="text-text-secondary">{longestStreak} Days</span>
                </div>
                <div className="w-full bg-divider rounded-full h-[2px] overflow-hidden">
                    <div
                        className="h-full bg-gold transition-all duration-1000"
                        style={{ width: `${Math.min((currentStreak / (longestStreak || 1)) * 100, 100)}%` }}
                    />
                </div>
            </div>
        </Card>
    );
}
