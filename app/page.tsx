import dynamic from 'next/dynamic';

const LandingWrapper = dynamic(() => import('@/components/landing/LandingWrapper'), { ssr: false });

export default function LandingPage() {
  return <LandingWrapper />;
}
