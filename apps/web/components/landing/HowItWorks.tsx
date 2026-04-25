'use client';
import { motion } from 'framer-motion';
import { UserPlus, Code2, TrendingUp } from 'lucide-react';

const steps = [
  { icon: UserPlus, step: '01', title: 'Sign up free and pick your module', desc: 'Create your account in seconds. Choose from interviews, hackathons, or mock tests — no credit card needed.' },
  { icon: Code2, step: '02', title: 'Practice, compete, or interview live', desc: 'Use real tools: collaborative editors, video calls, live leaderboards, and timed test environments.' },
  { icon: TrendingUp, step: '03', title: 'Get your score report and get hired', desc: 'Receive detailed performance analytics, track your growth over time, and share results with recruiters.' },
];

export function HowItWorks() {
  return (
    <section className="bg-muted/30 py-20">
      <div className="mx-auto max-w-5xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold md:text-4xl">How it works</h2>
          <p className="mt-3 text-muted-foreground">From signup to hired in three steps.</p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              {i < steps.length - 1 && (
                <div className="absolute left-full top-8 hidden h-px w-full -translate-y-1/2 border-t-2 border-dashed border-border md:block" style={{ width: 'calc(100% - 2rem)', left: '50%' }} />
              )}
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#534AB7]/10">
                <step.icon className="h-8 w-8 text-[#534AB7]" />
              </div>
              <div className="mb-1 text-xs font-bold uppercase tracking-widest text-[#534AB7]">Step {step.step}</div>
              <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
