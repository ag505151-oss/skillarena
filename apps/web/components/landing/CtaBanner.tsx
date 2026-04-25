'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CtaBanner() {
  return (
    <section className="bg-[#534AB7] py-20 text-white">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold md:text-4xl">Ready to get hired faster?</h2>
          <p className="mt-3 text-white/80">Join 12,000+ engineers already on SkillArena.</p>
          <Button
            size="xl"
            className="mt-8 bg-white text-[#534AB7] hover:bg-white/90 font-semibold"
            asChild
          >
            <Link href="/signup">Start for free — no credit card required</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
