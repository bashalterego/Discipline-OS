'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import StatusPill from '@/components/ui/StatusPill';
import Button from '@/components/ui/Button';

interface FinanceEntry {
  log_date: string;
  cash_in_hand: number;
  earning: number;
  expenditure: number;
  notes: string | null;
}

interface TodayFinance {
  cash_in_hand: number;
  earning: number;
  expenditure: number;
  notes: string;
}

export default function FinancePage() {
  const [history, setHistory] = useState<FinanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState<TodayFinance>({ cash_in_hand: 0, earning: 0, expenditure: 0, notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [histRes, todayRes] = await Promise.all([
          fetch('/api/finance/history?days=30'),
          fetch('/api/dashboard/today'),
        ]);
        const histData = await histRes.json();
        const todayData = await todayRes.json();

        setHistory(histData.history || []);
        if (todayData.financeLog) {
          setToday({
            cash_in_hand: todayData.financeLog.cash_in_hand ?? 0,
            earning: todayData.financeLog.earning ?? 0,
            expenditure: todayData.financeLog.expenditure ?? 0,
            notes: todayData.financeLog.notes || '',
          });
        }
      } catch (e) {
        console.error('Failed to load finance data', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleTodayChange = (key: keyof TodayFinance, value: string) => {
    const num = parseFloat(value) || 0;
    setToday(prev => ({ ...prev, [key]: num }));
  };

  const saveToday = async () => {
    setSaving(true);
    try {
      await fetch('/api/dashboard/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'finance', payload: today }),
      });
      // Refresh history
      const res = await fetch('/api/finance/history?days=30');
      const data = await res.json();
      setHistory(data.history || []);
    } catch (e) {
      console.error('Save failed', e);
    } finally {
      setSaving(false);
    }
  };

  const totalEarning = history.reduce((s, h) => s + (h.earning || 0), 0);
  const totalExpenditure = history.reduce((s, h) => s + (h.expenditure || 0), 0);
  const netSurplus = totalEarning - totalExpenditure;
  const avgDailyEarning = history.length > 0 ? totalEarning / history.length : 0;

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  if (loading) {
    return (
      <div style={{
        height: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: 'var(--color-text-muted)',
        fontFamily: 'var(--font-dm-mono)', fontSize: '12px'
      }}>
        LOADING FINANCIAL DATA...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
          FINANCE
        </h1>
        <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
          30-DAY FINANCIAL INTELLIGENCE
        </p>
      </div>

      {/* Today's Entry */}
      <Card style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '12px', color: 'var(--color-text-muted)', letterSpacing: '0.1em', marginBottom: '20px' }}>
          TODAY'S LOG
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
          {([
            { label: 'CASH ON HAND', key: 'cash_in_hand' as const },
            { label: 'EARNING', key: 'earning' as const },
            { label: 'EXPENDITURE', key: 'expenditure' as const },
          ] as const).map(item => (
            <div key={item.key}>
              <label style={{
                display: 'block', fontFamily: 'var(--font-dm-mono)', fontSize: '9px',
                color: 'var(--color-text-muted)', marginBottom: '6px', letterSpacing: '0.08em'
              }}>
                {item.label}
              </label>
              <input
                type="number"
                value={today[item.key] || ''}
                onChange={e => handleTodayChange(item.key, e.target.value)}
                placeholder="0"
                style={{
                  width: '100%', backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '0.5px solid var(--color-border)', borderRadius: '6px',
                  padding: '10px 12px', color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-dm-mono)', fontSize: '14px',
                  textAlign: 'right', outline: 'none',
                }}
              />
            </div>
          ))}
        </div>
        <textarea
          value={today.notes}
          onChange={e => setToday(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Notes (optional)"
          rows={2}
          style={{
            width: '100%', backgroundColor: 'rgba(255,255,255,0.02)',
            border: '0.5px solid var(--color-border)', borderRadius: '6px',
            padding: '10px 12px', color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-dm-mono)', fontSize: '12px',
            lineHeight: 1.5, outline: 'none', resize: 'none', marginBottom: '16px',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '11px',
            color: (today.earning - today.expenditure) >= 0 ? 'var(--color-sage)' : 'var(--color-red)'
          }}>
            NET: {formatCurrency(today.earning - today.expenditure)}
          </span>
          <Button variant="primary" size="sm" onClick={saveToday}>
            {saving ? 'SAVING...' : 'SAVE TODAY'}
          </Button>
        </div>
      </Card>

      {/* 30-Day Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <Card style={{ padding: '20px' }}>
          <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'var(--color-text-muted)', marginBottom: '8px', letterSpacing: '0.1em' }}>
            30D TOTAL EARNING
          </div>
          <div style={{ fontFamily: 'var(--font-syne)', fontSize: '22px', fontWeight: 800, color: 'var(--color-sage)' }}>
            {formatCurrency(totalEarning)}
          </div>
        </Card>
        <Card style={{ padding: '20px' }}>
          <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'var(--color-text-muted)', marginBottom: '8px', letterSpacing: '0.1em' }}>
            30D TOTAL SPEND
          </div>
          <div style={{ fontFamily: 'var(--font-syne)', fontSize: '22px', fontWeight: 800, color: 'var(--color-red)' }}>
            {formatCurrency(totalExpenditure)}
          </div>
        </Card>
        <Card style={{ padding: '20px' }}>
          <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'var(--color-text-muted)', marginBottom: '8px', letterSpacing: '0.1em' }}>
            NET SURPLUS
          </div>
          <div style={{
            fontFamily: 'var(--font-syne)', fontSize: '22px', fontWeight: 800,
            color: netSurplus >= 0 ? 'var(--color-gold)' : 'var(--color-red)'
          }}>
            {formatCurrency(netSurplus)}
          </div>
          <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
            AVG/DAY: {formatCurrency(avgDailyEarning)}
          </div>
        </Card>
      </div>

      {/* History Table */}
      <Card style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '12px', color: 'var(--color-text-muted)', letterSpacing: '0.1em', marginBottom: '16px' }}>
          TRANSACTION HISTORY
        </h3>
        {history.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            NO FINANCE LOGS YET. START LOGGING FROM DASHBOARD.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-dm-mono)', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid var(--color-divider)' }}>
                  {['DATE', 'CASH ON HAND', 'EARNING', 'EXPENDITURE', 'NET'].map(h => (
                    <th key={h} style={{ textAlign: h === 'DATE' ? 'left' : 'right', paddingBottom: '12px', color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '10px', letterSpacing: '0.08em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map(entry => {
                  const net = (entry.earning || 0) - (entry.expenditure || 0);
                  return (
                    <tr key={entry.log_date} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '12px 0', color: 'var(--color-text-secondary)' }}>
                        {new Date(entry.log_date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </td>
                      <td style={{ padding: '12px 0', textAlign: 'right', color: 'var(--color-text-primary)' }}>
                        {formatCurrency(entry.cash_in_hand || 0)}
                      </td>
                      <td style={{ padding: '12px 0', textAlign: 'right', color: 'var(--color-sage)' }}>
                        {formatCurrency(entry.earning || 0)}
                      </td>
                      <td style={{ padding: '12px 0', textAlign: 'right', color: 'var(--color-red)' }}>
                        {formatCurrency(entry.expenditure || 0)}
                      </td>
                      <td style={{ padding: '12px 0', textAlign: 'right', color: net >= 0 ? 'var(--color-gold)' : 'var(--color-red)', fontWeight: 600 }}>
                        {net >= 0 ? '+' : ''}{formatCurrency(net)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
