'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Check, ChevronDown, Share2 } from 'lucide-react';
import { ScoreRing } from '@/components/dashboard/ScoreRing';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProGate } from '@/components/shared/ProGate';
import { CategoryChart } from '@/components/dashboard/CategoryChart';

interface Answer { isCorrect: boolean | null }
export interface TestResult {
  attempt?: {
    score?: number;
    answers?: Answer[];
    test?: { totalMarks?: number; passingScore?: number };
  };
  percentile?: number;
  rank?: number;
}

interface Props { result: TestResult | null; plan: string; testId: string }

export function TestResultClient({ result, plan, testId: _testId }: Props) {
  const [openQ, setOpenQ] = useState<number | null>(null);
  const [tab, setTab] = useState<'review' | 'leaderboard'>('review');

  const score = result?.attempt?.score ?? 74;
  const total = result?.attempt?.test?.totalMarks ?? 100;
  const passing = result?.attempt?.test?.passingScore ?? 50;
  const passed = score >= passing;
  const percentile = result?.percentile ?? 68;
  const correct = result?.attempt?.answers?.filter((a) => a.isCorrect === true).length ?? 8;
  const wrong = result?.attempt?.answers?.filter((a) => a.isCorrect === false).length ?? 2;
  const skipped = (result?.attempt?.answers?.length ?? 10) - correct - wrong;

  const mockLeaderboard: { rank: number; name: string; score: number; time: string; isYou?: boolean }[] = [
    { rank: 1, name: 'Alice K', score: 95, time: '18m' },
    { rank: 2, name: 'Bob M', score: 90, time: '22m' },
    { rank: 3, name: 'Carol S', score: 88, time: '25m' },
    { rank: 4, name: 'You', score, time: '28m', isYou: true },
    { rank: 5, name: 'Dave R', score: 70, time: '30m' },
  ];

  const mockTopicData = [
    { name: 'Arrays', score: 80 },
    { name: 'Strings', score: 65 },
    { name: 'DP', score: 50 },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      {/* Score hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <ScoreRing score={Math.round((score / total) * 100)} size={120} strokeWidth={10} />
        <div className="text-3xl font-extrabold">{score}/{total}</div>
        <Badge variant={passed ? 'teal' : 'red'} className="text-sm px-4 py-1">
          {passed ? '✓ Passed' : '✗ Failed'}
        </Badge>
        <p className="text-muted-foreground text-sm">You scored better than {percentile}% of users</p>
      </motion.div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Correct', value: correct, color: 'text-[#1D9E75]', bg: 'bg-[#1D9E75]/10' },
          { label: 'Wrong', value: wrong, color: 'text-[#E24B4A]', bg: 'bg-[#E24B4A]/10' },
          { label: 'Skipped', value: skipped, color: 'text-muted-foreground', bg: 'bg-muted' },
          { label: 'Marks', value: score, color: 'text-[#534AB7]', bg: 'bg-[#534AB7]/10' },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className={`pt-4 pb-3 text-center ${m.bg} rounded-xl`}>
              <div className={`text-2xl font-extrabold ${m.color}`}>{m.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Topic breakdown */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Performance by topic</CardTitle></CardHeader>
        <CardContent><CategoryChart data={mockTopicData} /></CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(['review', 'leaderboard'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 px-1 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? 'border-[#534AB7] text-[#534AB7]' : 'border-transparent text-muted-foreground'}`}
          >
            {t === 'review' ? 'Question Review' : 'Leaderboard'}
          </button>
        ))}
      </div>

      {tab === 'review' && (
        <ProGate feature="Full question-by-question review" plan={plan}>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl border overflow-hidden">
                <button
                  onClick={() => setOpenQ(openQ === i ? null : i)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium"
                >
                  <span>Q{i + 1}. Sample question text here</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={i % 3 === 0 ? 'red' : 'teal'}>{i % 3 === 0 ? 'Wrong' : 'Correct'}</Badge>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openQ === i ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {openQ === i && (
                  <div className="border-t px-4 py-3 space-y-2 text-sm">
                    <p className="text-muted-foreground">Your answer: <span className="text-[#E24B4A] font-medium">Option B</span></p>
                    <p className="text-muted-foreground">Correct answer: <span className="text-[#1D9E75] font-medium">Option A</span></p>
                    <p className="text-muted-foreground">Marks: {i % 3 === 0 ? '-0.5' : '+1'}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ProGate>
      )}

      {tab === 'leaderboard' && (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Rank', 'Name', 'Score', 'Time'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockLeaderboard.slice(0, plan === 'FREE' ? 3 : undefined).map((row) => (
                <tr key={row.rank} className={`border-t ${row.isYou ? 'border-l-4 border-l-[#534AB7] bg-[#534AB7]/5' : ''}`}>
                  <td className="px-4 py-3 font-bold">#{row.rank}</td>
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3 font-semibold text-[#534AB7]">{row.score}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {plan === 'FREE' && (
            <div className="border-t p-4 text-center">
              <ProGate feature="Full leaderboard access" plan={plan} blur={false}>
                <div />
              </ProGate>
            </div>
          )}
        </div>
      )}

      {/* Share */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
        >
          <Share2 className="h-4 w-4" /> Share on LinkedIn
        </Button>
      </div>
    </div>
  );
}
