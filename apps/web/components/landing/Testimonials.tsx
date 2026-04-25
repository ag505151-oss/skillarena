'use client';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  { name: 'Arjun S', role: 'SDE', company: 'Google', initials: 'AS', quote: 'SkillArena\'s mock interviews felt exactly like the real thing. The collaborative editor and instant feedback helped me crack Google in 3 months.' },
  { name: 'Priya M', role: 'Software Engineer', company: 'Hired via SkillArena', initials: 'PM', quote: 'I went from 0 to offer in 6 weeks. The performance analytics showed exactly where I was weak — I fixed those gaps and landed my dream job.' },
  { name: 'David K', role: 'Competitive Programmer', company: 'ICPC Finalist', initials: 'DK', quote: 'The hackathon arena is world-class. Real-time leaderboards, multi-language support, and instant judge verdicts — it\'s the best competitive platform I\'ve used.' },
];

export function Testimonials() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold md:text-4xl">Loved by engineers worldwide</h2>
          <p className="mt-3 text-muted-foreground">Join 12,000+ developers who got hired faster.</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border bg-card p-6"
            >
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-[#EF9F27] text-[#EF9F27]" />
                ))}
              </div>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#534AB7] text-white text-sm font-bold">
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role} · {t.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
