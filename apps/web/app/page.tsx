import type { Metadata } from 'next';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsBar } from '@/components/landing/StatsBar';
import { FeatureCards } from '@/components/landing/FeatureCards';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Testimonials } from '@/components/landing/Testimonials';
import { CtaBanner } from '@/components/landing/CtaBanner';
import { PricingSection } from '@/components/landing/PricingSection';

export const metadata: Metadata = {
  title: 'SkillArena — Live Interviews, Hackathons & Mock Tests',
  description: 'Live coding interviews, real-time hackathons, and mock tests with AI-powered performance insights — all in one place.',
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <FeatureCards />
      <HowItWorks />
      <Testimonials />
      <PricingSection />
      <CtaBanner />
    </>
  );
}
