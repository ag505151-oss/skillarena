'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'Can I switch plans?', a: 'Yes, you can upgrade or downgrade at any time. When upgrading, you\'ll be charged the prorated difference. When downgrading, your current plan remains active until the end of the billing period.' },
  { q: 'Is there a free trial for Pro?', a: 'Yes! Pro Monthly includes a 7-day free trial. You won\'t be charged until the trial ends, and you can cancel anytime before that.' },
  { q: 'Do you offer refunds?', a: 'We offer a 7-day money-back guarantee on all paid plans. If you\'re not satisfied within 7 days of purchase, contact us for a full refund — no questions asked.' },
  { q: 'Is Lifetime really a one-time payment?', a: 'Yes. Pay once and get access to SkillArena Pro forever, including all future features. No recurring charges, ever.' },
  { q: 'Do you offer student discounts?', a: 'Yes! Students get 40% off any paid plan with a valid .edu email address. Contact support@skillarena.dev with your student email to claim your discount.' },
];

export function PricingFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="bg-muted/30 py-16">
      <div className="mx-auto max-w-2xl px-4">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-center text-2xl font-bold"
        >
          Frequently asked questions
        </motion.h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border bg-card overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium"
              >
                {faq.q}
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm text-muted-foreground">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
