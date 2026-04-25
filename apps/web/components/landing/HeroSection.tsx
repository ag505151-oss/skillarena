'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background pt-20 pb-16 text-center">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#534AB7]/8 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-4xl px-4"
      >
        {/* Social proof badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-muted-foreground">12,000+ developers trust SkillArena</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="text-5xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl"
        >
          The arena where{' '}
          <span className="text-[#534AB7]">engineers</span>
          <br />
          get hired.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
        >
          Live coding interviews, real-time hackathons, and mock tests with AI-powered performance insights — all in one place.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Button variant="purple" size="xl" asChild>
            <Link href="/signup">Get started free</Link>
          </Button>
          <Button variant="outline" size="xl" asChild>
            <Link href="#demo" className="flex items-center gap-2">
              <Play className="h-4 w-4" /> Watch demo
            </Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-4 text-xs text-muted-foreground"
        >
          No credit card required · Free forever plan available
        </motion.p>
      </motion.div>
    </section>
  );
}
