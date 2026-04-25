'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, Trophy, FileText, Video, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScoreRing } from '@/components/dashboard/ScoreRing';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { ProGate } from '@/components/shared/ProGate';

interface Props {
  userName: string;
  userRole: string;
  userPlan: string;
}

const mockStats = {
  overallScore: 74,
  testsAttempted: 12,
  testsDelta: 3,
  hackathons: 4,
  interviews: 2,
};

const mockCategories = [
  { name: 'DSA', score: 82 },
  { name: 'System Design', score: 61 },
  { name: 'Aptitude', score: 75 },
  { name: 'Verbal', score: 88 },
  { name: 'DBMS', score: 45 },
  { name: 'OS', score: 38 },
  { name: 'Networks', score: 55 },
];

const weakAreas = mockCategories.filter((c) => c.score < 60).slice(0, 3);

const recentActivity = [
  { icon: FileText, title: 'JavaScript Fundamentals', date: '2 days ago', badge: '74/100', badgeVariant: 'amber' as const },
  { icon: Trophy, title: 'SkillArena Weekly Challenge', date: '5 days ago', badge: 'Rank #12', badgeVariant: 'teal' as const },
  { icon: Video, title: 'Frontend Interview', date: '1 week ago', badge: 'Scheduled', badgeVariant: 'purple' as const },
  { icon: FileText, title: 'DSA Mock Test', date: '2 weeks ago', badge: '88/100', badgeVariant: 'green' as const },
  { icon: Trophy, title: 'Algo Sprint Hackathon', date: '3 weeks ago', badge: 'Rank #5', badgeVariant: 'teal' as const },
];

export function DashboardClient({ userName, userPlan }: Props) {
  const isFree = userPlan === 'FREE';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      {/* Upgrade banner */}
      {isFree && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-xl bg-[#534AB7] px-5 py-3 text-white"
        >
          <p className="text-sm font-medium">
            You're on the Free plan — unlock unlimited tests, interviews & certificates
          </p>
          <Button size="sm" className="bg-white text-[#534AB7] hover:bg-white/90 shrink-0 ml-4" asChild>
            <Link href="/pricing">Upgrade to Pro →</Link>
          </Button>
        </motion.div>
      )}

      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Welcome back, {userName} 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">Here's your performance overview.</p>
      </motion.div>

      {/* Top stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Overall Score', value: null, ring: true },
          { label: 'Tests Attempted', value: mockStats.testsAttempted, delta: `+${mockStats.testsDelta} this month` },
          { label: 'Hackathons', value: mockStats.hackathons, delta: null },
          { label: 'Interviews', value: mockStats.interviews, delta: null },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card>
              <CardContent className="pt-5 pb-4 flex items-center gap-4">
                {stat.ring ? (
                  <ScoreRing score={mockStats.overallScore} size={64} />
                ) : (
                  <div className="text-3xl font-extrabold text-[#534AB7]">{stat.value}</div>
                )}
                <div>
                  <div className="text-sm font-medium">{stat.label}</div>
                  {stat.delta && <div className="text-xs text-[#1D9E75] mt-0.5">{stat.delta}</div>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Score by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart data={mockCategories} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ProGate feature="Full performance trend analytics" plan={userPlan} blur>
              <TrendChart />
            </ProGate>
          </CardContent>
        </Card>
      </div>

      {/* Weak areas + Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#EF9F27]" /> Weak Areas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weakAreas.map((area) => (
              <div key={area.name} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="text-sm font-medium">{area.name}</div>
                  <Badge variant={area.score < 40 ? 'red' : 'amber'} className="mt-1">
                    {area.score}/100 · {area.score < 40 ? 'Needs work' : 'Good'}
                  </Badge>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/tests?category=${area.name.toUpperCase().replace(' ', '_')}`}>
                    Practice now <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#534AB7]" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#534AB7]/10">
                  <item.icon className="h-4 w-4 text-[#534AB7]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.date}</div>
                </div>
                <Badge variant={item.badgeVariant}>{item.badge}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
