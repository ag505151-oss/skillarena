'use client';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const rows = [
  { feature: 'Mock Tests', free: '3/month', pro: 'Unlimited', lifetime: 'Unlimited' },
  { feature: 'Live Interviews', free: false, pro: '5/month', lifetime: 'Unlimited' },
  { feature: 'Hackathons', free: '1/month', pro: 'Unlimited', lifetime: 'Unlimited' },
  { feature: 'Performance Analytics', free: 'Basic', pro: 'Full', lifetime: 'Full' },
  { feature: 'Certificate Downloads', free: false, pro: true, lifetime: true },
  { feature: 'Full Leaderboard', free: 'Top 3 only', pro: true, lifetime: true },
  { feature: 'Support', free: 'Community', pro: 'Priority email', lifetime: 'Priority forever' },
];

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="mx-auto h-5 w-5 text-[#1D9E75]" />;
  if (value === false) return <X className="mx-auto h-5 w-5 text-muted-foreground/40" />;
  return <span className="text-sm">{value}</span>;
}

export function PricingComparison() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl px-4">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-center text-2xl font-bold"
        >
          Feature comparison
        </motion.h2>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold">Feature</th>
                <th className="px-4 py-3 text-center font-semibold">Free</th>
                <th className="px-4 py-3 text-center font-semibold text-[#534AB7]">Pro</th>
                <th className="px-4 py-3 text-center font-semibold">Lifetime</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.feature} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                  <td className="px-4 py-3 font-medium">{row.feature}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground"><Cell value={row.free} /></td>
                  <td className="px-4 py-3 text-center"><Cell value={row.pro} /></td>
                  <td className="px-4 py-3 text-center"><Cell value={row.lifetime} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
