'use client';
import { motion } from 'framer-motion';
import { Video, Trophy, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: Video,
    iconBg: 'bg-[#534AB7]/10',
    iconColor: 'text-[#534AB7]',
    title: 'Live Interviews',
    description: 'Conduct real-time technical interviews with collaborative code editing, video calls, and instant feedback tools.',
    badge: 'Video + Code',
    badgeVariant: 'purple' as const,
  },
  {
    icon: Trophy,
    iconBg: 'bg-[#1D9E75]/10',
    iconColor: 'text-[#1D9E75]',
    title: 'Code Hackathons',
    description: 'Compete in live coding challenges with real-time leaderboards, multi-language support, and instant judge verdicts.',
    badge: 'Live Arena',
    badgeVariant: 'teal' as const,
  },
  {
    icon: FileText,
    iconBg: 'bg-[#EF9F27]/10',
    iconColor: 'text-[#EF9F27]',
    title: 'Mock Tests',
    description: 'Attempt timed assessments across DSA, aptitude, and system design with AI-powered performance insights.',
    badge: 'AI Insights',
    badgeVariant: 'amber' as const,
  },
];

export function FeatureCards() {
  return (
    <section id="features" className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold md:text-4xl">Everything you need to get hired</h2>
          <p className="mt-3 text-muted-foreground">Three powerful modules, one unified platform.</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.01 }}
              className="group rounded-xl border bg-card p-6 transition-colors duration-200 hover:border-[#534AB7]/40 cursor-default"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.iconBg}`}>
                <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
              </div>
              <div className="mb-2 flex items-center gap-2">
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <Badge variant={feature.badgeVariant}>{feature.badge}</Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
