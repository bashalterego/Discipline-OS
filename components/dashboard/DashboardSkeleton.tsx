'use client';

import Card from '@/components/ui/Card';

export default function DashboardSkeleton() {
    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: '1fr 1.5fr',
            gap: '24px'
        }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ height: '40px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', width: '100%' }} />

                <Card style={{ padding: '32px', height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '160px', height: '160px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.02)', border: '4px solid rgba(255,255,255,0.03)' }} />
                    <div style={{ marginTop: '24px', width: '100px', height: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '4px' }} />
                </Card>

                <Card style={{ padding: '20px', height: '180px' }}>
                    <div style={{ width: '100px', height: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '4px', marginBottom: '16px' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        {[1, 2, 3].map(i => <div key={i} style={{ height: '40px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '4px' }} />)}
                    </div>
                </Card>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <Card style={{ padding: '24px', minHeight: '400px' }}>
                    <div style={{ width: '120px', height: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '4px', marginBottom: '24px' }} />
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{ height: '56px', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '8px', marginBottom: '8px' }} />
                    ))}
                </Card>
                <div style={{ height: '120px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px' }} />
            </div>
        </div>
    );
}
