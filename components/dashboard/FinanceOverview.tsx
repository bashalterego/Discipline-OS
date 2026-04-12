'use client';

import { useState, useEffect, memo } from 'react';
import Card from '@/components/ui/Card';
import { useDashboardStore } from '@/store/useDashboardStore';
import type { FinanceLog } from '@/types';

interface FinanceData {
    cash_in_hand: number;
    earning: number;
    expenditure: number;
    notes?: string;
}

interface FinanceOverviewProps {
    initialData: FinanceData | null;
}

export default memo(function FinanceOverview({ initialData }: FinanceOverviewProps) {
    const { dailyLog, isEditing } = useDashboardStore();
    const isLocked = dailyLog?.log_closed && !isEditing;

    const [data, setData] = useState<FinanceData>(initialData || {
        cash_in_hand: 0,
        earning: 0,
        expenditure: 0,
        notes: '',
    });
    const [notes, setNotes] = useState(initialData?.notes || '');

    useEffect(() => {
        if (isLocked || isEditing) return;

        const timer = setTimeout(() => {
            syncFinance(data, notes);
        }, 800);

        return () => clearTimeout(timer);
    }, [data, notes, isLocked, isEditing]);

    const handleChange = (key: keyof FinanceData, value: string) => {
        if (isLocked) return;
        const num = parseFloat(value) || 0;
        const newData = { ...data, [key]: num };
        setData(newData);
    };

    const syncFinance = async (payload: FinanceData, currentNotes: string) => {
        try {
            await fetch('/api/dashboard/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'finance', payload: { ...payload, notes: currentNotes } }),
            });
        } catch (err) {
            console.error('Failed to sync finance:', err);
        }
    };

    return (
        <Card id="finance-log" style={{ padding: '20px' }}>
            <h3 style={{
                fontFamily: 'var(--font-syne)',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                letterSpacing: '0.1em',
                marginBottom: '16px',
            }}>
                FINANCE LOG
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                    { label: 'CASH ON HAND', key: 'cash_in_hand' as const },
                    { label: 'EARNING', key: 'earning' as const },
                    { label: 'EXPENDITURE', key: 'expenditure' as const },
                ].map((item) => (
                    <div key={item.key}>
                        <label style={{
                            display: 'block',
                            fontFamily: 'var(--font-dm-mono)',
                            fontSize: '9px',
                            color: 'var(--color-text-label)',
                            marginBottom: '4px'
                        }}>
                            {item.label}
                        </label>
                        <input
                            type="number"
                            value={(data as any)[item.key] || ''}
                            onChange={(e) => handleChange(item.key, e.target.value)}
                            placeholder="0"
                            readOnly={isLocked}
                            style={{
                                width: '100%',
                                backgroundColor: isLocked ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
                                border: '0.5px solid var(--color-border)',
                                borderRadius: '4px',
                                padding: '8px',
                                color: isLocked ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                                fontFamily: 'var(--font-dm-mono)',
                                fontSize: '13px',
                                textAlign: 'right',
                                outline: 'none',
                                cursor: isLocked ? 'not-allowed' : 'text'
                            }}
                        />
                    </div>
                ))}
            </div>
            <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Notes (optional)"
                rows={2}
                readOnly={isLocked}
                style={{
                    width: '100%', backgroundColor: isLocked ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.02)',
                    border: '0.5px solid var(--color-border)', borderRadius: '4px',
                    padding: '8px', color: isLocked ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-dm-mono)', fontSize: '11px',
                    lineHeight: 1.5, outline: 'none', resize: 'none', marginTop: '10px',
                    cursor: isLocked ? 'not-allowed' : 'text'
                }}
            />
        </Card>
    );
});
