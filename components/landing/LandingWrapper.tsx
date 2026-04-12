'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const Hero = dynamic(() => import('@/components/landing/Hero'), { ssr: false });
const HowItWorks = dynamic(() => import('@/components/landing/HowItWorks'), { ssr: false });
const DashboardPreview = dynamic(() => import('@/components/landing/DashboardPreview'), { ssr: false });
const Achievements = dynamic(() => import('@/components/landing/Achievements'), { ssr: false });
const Stats = dynamic(() => import('@/components/landing/Stats'), { ssr: false });
const FinalCTA = dynamic(() => import('@/components/landing/FinalCTA'), { ssr: false });

export default function LandingWrapper() {
    return (
        <div style={{ backgroundColor: '#0E0E10', minHeight: '100vh' }}>
            <Suspense fallback={<div style={{ height: '100vh', backgroundColor: '#0E0E10' }} />}>
                <Hero />
                <div className="divider-shimmer" />
                <HowItWorks />
                <div className="divider-shimmer" />
                <Achievements />
                <div className="divider-shimmer" />
                <DashboardPreview />
                <div className="divider-shimmer" />
                <Stats />
                <div className="divider-shimmer" />
                <FinalCTA />
            </Suspense>
        </div>
    );
}
