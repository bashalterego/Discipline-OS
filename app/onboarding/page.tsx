'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StepWelcome from '@/components/onboarding/StepWelcome';
import StepIdentity from '@/components/onboarding/StepIdentity';
import StepArchetype from '@/components/onboarding/StepArchetype';
import StepDifficulty from '@/components/onboarding/StepDifficulty';
import StepTaskBuilder, { type CustomTask } from '@/components/onboarding/StepTaskBuilder';
import StepPoints from '@/components/onboarding/StepPoints';
import StepCommitment from '@/components/onboarding/StepCommitment';
import type { User } from '@/types';

interface OnboardingState {
    fullName: string;
    identityStatement: string;
    archetype: User['archetype'];
    difficultyTier: User['difficulty_tier'];
    customTasks: CustomTask[];
    commitment: { title: string; durationDays: 30 | 60 | 90 } | null;
}

const STEPS = [
    { label: 'WELCOME' },
    { label: 'IDENTITY' },
    { label: 'ARCHETYPE' },
    { label: 'INTENSITY' },
    { label: 'SYSTEM' },
    { label: 'SCORING' },
    { label: 'COMMIT' },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [state, setState] = useState<OnboardingState>({
        fullName: '',
        identityStatement: '',
        archetype: null,
        difficultyTier: 'beginner',
        customTasks: [],
        commitment: { title: '', durationDays: 90 },
    });

    // Handle Archetype change to pre-populate tasks
    useEffect(() => {
        if (state.archetype) {
            const SUGGESTIONS: Record<string, any[]> = {
                athlete: [
                    { name: 'Morning Cardio 30m', type: 'duration', points: 1.0, target_value: 30, target_unit: 'mins', preferred_time: 'morning' },
                    { name: 'Gym Session', type: 'boolean', points: 1.0, target_value: 1, target_unit: 'boolean', preferred_time: 'afternoon' },
                    { name: 'Protein Goal', type: 'boolean', points: 1.0, target_value: 1, target_unit: 'boolean', preferred_time: 'evening' },
                    { name: 'Mobility/Stretching', type: 'duration', points: 0.5, target_value: 15, target_unit: 'mins', preferred_time: 'evening' },
                ],
                scholar: [
                    { name: 'Deep Work Session', type: 'duration', points: 1.5, target_value: 120, target_unit: 'mins', preferred_time: 'morning' },
                    { name: 'Read 30 Pages', type: 'quantitative', points: 1.0, target_value: 30, target_unit: 'pages', preferred_time: 'afternoon' },
                    { name: 'Journaling', type: 'boolean', points: 0.5, target_value: 1, target_unit: 'boolean', preferred_time: 'evening' },
                    { name: 'Skill Learning', type: 'duration', points: 1.0, target_value: 60, target_unit: 'mins', preferred_time: 'afternoon' },
                ],
                monk: [
                    { name: 'Meditation', type: 'duration', points: 1.0, target_value: 20, target_unit: 'mins', preferred_time: 'morning' },
                    { name: 'Digital Detox', type: 'boolean', points: 1.0, target_value: 1, target_unit: 'boolean', preferred_time: 'evening' },
                    { name: 'Nature Walk', type: 'duration', points: 0.5, target_value: 30, target_unit: 'mins', preferred_time: 'afternoon' },
                    { name: 'Cold Exposure', type: 'boolean', points: 1.0, target_value: 1, target_unit: 'boolean', preferred_time: 'morning' },
                ],
                warrior: [
                    { name: 'Wake up 5:00 AM', type: 'boolean', points: 1.0, target_value: 1, target_unit: 'boolean', preferred_time: 'morning' },
                    { name: 'Heavy Training', type: 'boolean', points: 1.5, target_value: 1, target_unit: 'boolean', preferred_time: 'afternoon' },
                    { name: 'Plan Next Day', type: 'boolean', points: 0.5, target_value: 1, target_unit: 'boolean', preferred_time: 'evening' },
                    { name: 'Combat Sports/Skills', type: 'duration', points: 1.0, target_value: 60, target_unit: 'mins', preferred_time: 'afternoon' },
                ]
            };

            const defaults = SUGGESTIONS[state.archetype as string] || [];
            updateField('customTasks', defaults.map((d, i) => ({ ...d, id: `init-${i}` })));
        }
    }, [state.archetype]);

    function updateField(key: keyof OnboardingState, value: any) {
        setState((prev) => ({ ...prev, [key]: value }));
    }

    function canProceed(): boolean {
        if (step === 0) return true; // Welcome handled by internal Next button
        if (step === 1) return state.fullName.trim().length > 0;
        if (step === 2) return !!state.archetype;
        if (step === 3) return !!state.difficultyTier;
        if (step === 4) return state.customTasks.length >= 3; // Minimum 3 tasks
        if (step === 5) return true;
        if (step === 6) return true;
        return false;
    }

    async function handleFinish() {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/onboarding/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(state),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Onboarding failed');
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    }

    return (
        <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)', padding: '24px' }}>
            <div style={{ width: '100%', maxWidth: step === 4 ? '720px' : '480px', transition: 'max-width 0.5s ease' }}>

                {/* Progress Indicator */}
                {step > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '32px' }}>
                        {STEPS.map((s, i) => (
                            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{
                                    width: '6px', height: '6px', borderRadius: '50%',
                                    backgroundColor: i < step ? 'var(--color-sage)' : i === step ? 'var(--color-gold)' : 'var(--color-border)',
                                    transition: 'all 0.3s'
                                }} />
                                {i < STEPS.length - 1 && (
                                    <div style={{ height: '0.5px', width: step === 4 ? '40px' : '20px', backgroundColor: i < step ? 'var(--color-sage)' : 'var(--color-border)', transition: 'all 0.3s' }} />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Content Area */}
                <div className="card" style={{ padding: '32px', marginBottom: '16px', position: 'relative' }}>
                    {step === 0 && <StepWelcome onComplete={() => setStep(1)} />}
                    {step === 1 && <StepIdentity fullName={state.fullName} identityStatement={state.identityStatement} onChange={(k, v) => updateField(k as any, v)} />}
                    {step === 2 && <StepArchetype archetype={state.archetype} onChange={(v) => updateField('archetype', v)} />}
                    {step === 3 && <StepDifficulty difficultyTier={state.difficultyTier} onChange={(v) => updateField('difficultyTier', v)} />}
                    {step === 4 && <StepTaskBuilder archetype={state.archetype} tasks={state.customTasks} onChange={(v) => updateField('customTasks', v)} />}
                    {step === 5 && <StepPoints difficultyTier={state.difficultyTier} tasks={state.customTasks} />}
                    {step === 6 && <StepCommitment commitment={state.commitment} onChange={(v) => updateField('commitment', v)} />}
                </div>

                {error && (
                    <div style={{ padding: '10px 14px', backgroundColor: 'rgba(191, 123, 123, 0.08)', border: '0.5px solid var(--color-red)', borderRadius: '6px', fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: 'var(--color-red)', marginBottom: '12px' }}>
                        {error}
                    </div>
                )}

                {/* Footer Navigation (not for Step 0) */}
                {step > 0 && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => setStep(s => s - 1)}
                            style={{ flex: 1, padding: '14px', backgroundColor: 'transparent', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-syne)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                        >
                            BACK
                        </button>
                        <button
                            onClick={step < STEPS.length - 1 ? () => setStep(s => s + 1) : handleFinish}
                            disabled={!canProceed() || loading}
                            className="btn-primary"
                            style={{ flex: 2, padding: '14px' }}
                        >
                            {loading ? 'CALIBRATING...' : step === STEPS.length - 1 ? 'BEGIN MY SYSTEM' : 'CONTINUE'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
