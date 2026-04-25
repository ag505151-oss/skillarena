import type { Metadata } from 'next';
import { PricingSection } from '@/components/landing/PricingSection';
import { PricingComparison } from '@/components/landing/PricingComparison';
import { PricingFaq } from '@/components/landing/PricingFaq';
import { CtaBanner } from '@/components/landing/CtaBanner';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing. Join 12,000+ engineers who got hired faster with SkillArena.',
};

export default function PricingPage() {
  return (
    <>
      <PricingSection />
      <PricingComparison />
      <PricingFaq />
      <CtaBanner />
    </>
  );
}
