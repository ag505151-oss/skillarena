'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type BillingPeriod = 'monthly' | '6month' | 'annual' | 'lifetime';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: { monthly: 0, '6month': 0, annual: 0, lifetime: 0 },
    period: { monthly: '/mo', '6month': '/mo', annual: '/yr', lifetime: '' },
    description: 'Get started with the basics.',
    features: ['3 mock tests/month', '1 hackathon/month', 'No interview access', 'Basic score report', 'No certificate downloads', 'Community support'],
    cta: 'Get started free',
    href: '/signup',
    featured: false,
    badge: null,
  },
  {
    id: 'pro-monthly',
    name: 'Pro Monthly',
    price: { monthly: 30, '6month': 30, annual: 30, lifetime: 30 },
    period: { monthly: '/mo', '6month': '/mo', annual: '/mo', lifetime: '' },
    description: 'Everything you need to get hired.',
    features: ['Unlimited mock tests', '5 live interviews/month', 'Unlimited hackathon entries', 'Full performance analytics', 'Certificate downloads', 'Full leaderboard access', 'Priority email support'],
    cta: 'Start 7-day free trial',
    subCopy: 'Cancel anytime — no questions asked',
    href: '/pricing',
    featured: false,
    badge: null,
  },
  {
    id: 'pro-6month',
    name: 'Pro 6-Month',
    price: { monthly: 150, '6month': 150, annual: 150, lifetime: 150 },
    period: { monthly: 'total', '6month': 'total', annual: 'total', lifetime: '' },
    equiv: '$25/mo equivalent',
    description: 'Save 17% with a 6-month commitment.',
    features: ['Everything in Pro Monthly', 'Single payment, 6-month access', 'Save 17% vs monthly'],
    cta: 'Get 6-month access',
    href: '/pricing',
    featured: false,
    badge: { label: 'Save 17%', color: 'teal' as const },
  },
  {
    id: 'pro-annual',
    name: 'Pro Annual',
    price: { monthly: 270, '6month': 270, annual: 270, lifetime: 270 },
    period: { monthly: '/yr', '6month': '/yr', annual: '/yr', lifetime: '' },
    equiv: '$22.50/mo equivalent',
    description: 'The smart choice for serious engineers.',
    features: ['Everything in Pro Monthly', 'Annual receipt for expense claims', 'Early access to new features', 'Save 25% vs monthly'],
    cta: 'Get annual access',
    subCopy: 'Less than a Netflix subscription per month',
    href: '/pricing',
    featured: true,
    badge: { label: 'Most Popular', color: 'purple' as const },
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: { monthly: 300, '6month': 300, annual: 300, lifetime: 300 },
    period: { monthly: 'one-time', '6month': 'one-time', annual: 'one-time', lifetime: 'one-time' },
    description: 'Pay once. Use forever.',
    features: ['Everything in Pro, forever', 'All future features included', 'Lifetime certificate storage', 'Priority support forever'],
    cta: 'Get lifetime access',
    subCopy: 'Most serious engineers choose this',
    href: '/pricing',
    featured: true,
    badge: { label: 'Best Value', color: 'purple' as const },
  },
];

const toggleOptions: { label: string; value: BillingPeriod }[] = [
  { label: 'Monthly', value: 'monthly' },
  { label: '6 Months', value: '6month' },
  { label: 'Yearly', value: 'annual' },
  { label: 'Lifetime', value: 'lifetime' },
];

export function PricingSection() {
  const [billing, setBilling] = useState<BillingPeriod>('monthly');

  return (
    <section id="pricing" className="bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-bold md:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-3 text-muted-foreground">Join 12,000+ engineers who got hired faster.</p>
        </motion.div>

        {/* Billing toggle */}
        <div className="mb-10 flex justify-center">
          <div className="flex rounded-xl border bg-card p-1 gap-1">
            {toggleOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setBilling(opt.value)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                  billing === opt.value
                    ? 'bg-[#534AB7] text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-5">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                'relative flex flex-col rounded-xl border bg-card p-5',
                plan.featured && 'border-[#534AB7] ring-1 ring-[#534AB7]/30',
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant={plan.badge.color} className="shadow-sm">
                    {plan.badge.label}
                  </Badge>
                </div>
              )}
              <div className="mb-4">
                <h3 className="font-semibold">{plan.name}</h3>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-3xl font-extrabold">${plan.price[billing]}</span>
                  <span className="mb-1 text-sm text-muted-foreground">{plan.period[billing]}</span>
                </div>
                {plan.equiv && <p className="mt-0.5 text-xs text-muted-foreground">{plan.equiv}</p>}
                <p className="mt-2 text-xs text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="mb-5 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1D9E75]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.featured ? 'purple' : 'outline'}
                size="sm"
                className="w-full"
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
              {plan.subCopy && (
                <p className="mt-2 text-center text-xs text-muted-foreground">{plan.subCopy}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
