'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Play, Send, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiSend } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const LANGUAGES = ['Python', 'JavaScript', 'Java', 'C++', 'Go', 'Rust'];
const LANG_IDS: Record<string, number> = { Python: 71, JavaScript: 63, Java: 62, 'C++': 54, Go: 60, Rust: 73 };

const mockProblems = [
  { id: 'p1', title: 'Two Sum', points: 100, status: 'solved' as const },
  { id: 'p2', title: 'Longest Substring', points: 150, status: 'attempted' as const },
  { id: 'p3', title: 'Binary Tree Paths', points: 200, status: 'unseen' as const },
];

const mockLeaderboard: { rank: number; name: string; score: number; solved: number; lastSubmit: string; isYou?: boolean }[] = [
  { rank: 1, name: 'Team Alpha', score: 250, solved: 2, lastSubmit: '5m ago' },
  { rank: 2, name: 'CodeNinjas', score: 200, solved: 2, lastSubmit: '12m ago' },
  { rank: 3, name: 'You', score: 100, solved: 1, lastSubmit: '20m ago', isYou: true },
];

function Countdown({ endsAt }: { endsAt: Date }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const update = () => setRemaining(Math.max(0, Math.floor((endsAt.getTime() - Date.now()) / 1000)));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const isUrgent = remaining < 600;

  return (
    <span className={cn('font-mono font-bold text-lg', isUrgent && 'text-[#E24B4A] animate-pulse')}>
      {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  );
}

export function HackathonArenaClient({ hackathonId }: { hackathonId: string }) {
  const [selectedProblem, setSelectedProblem] = useState(mockProblems[0]!);
  const [language, setLanguage] = useState('Python');
  const [code, setCode] = useState('# Write your solution here\n\ndef solution():\n    pass\n');
  const [verdict, setVerdict] = useState<{ status: string; time?: number; memory?: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'testcases' | 'submissions'>('description');

  const endsAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const result = await apiSend<{ status: string }>(`/api/hackathons/${hackathonId}/submit`, 'POST', {
        userId: 'demo-user',
        problemId: selectedProblem.id,
        language: language.toLowerCase(),
        languageId: LANG_IDS[language] ?? 71,
        code,
      });
      setVerdict({ status: result.status, time: 0.12, memory: 14.2 });
      toast.success(`Verdict: ${result.status}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  const statusDot = { solved: 'bg-[#1D9E75]', attempted: 'bg-[#EF9F27]', unseen: 'bg-muted-foreground/30' };

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b bg-card px-4 py-2">
        <span className="font-semibold text-sm">SkillArena Weekly Challenge</span>
        <Countdown endsAt={endsAt} />
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-lg border bg-background px-3 py-1.5 text-sm"
          >
            {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
          </select>
          <Button size="sm" variant="outline" onClick={() => setLeaderboardOpen(true)}>
            <Trophy className="h-4 w-4" /> Leaderboard
          </Button>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Problem list */}
        <div className="w-48 shrink-0 border-r overflow-y-auto bg-card">
          {mockProblems.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProblem(p)}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-3 text-left text-sm border-b hover:bg-muted/50 transition-colors',
                selectedProblem.id === p.id && 'bg-[#534AB7]/10 border-l-2 border-l-[#534AB7]',
              )}
            >
              <span className={cn('h-2 w-2 rounded-full shrink-0', statusDot[p.status])} />
              <div className="min-w-0">
                <div className="truncate font-medium">{p.title}</div>
                <div className="text-xs text-muted-foreground">{p.points} pts</div>
              </div>
            </button>
          ))}
        </div>

        {/* Center: Editor */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 resize-none bg-zinc-950 p-4 font-mono text-sm text-zinc-100 focus:outline-none"
            spellCheck={false}
          />
          <div className="flex items-center gap-2 border-t bg-card px-4 py-2">
            <Button size="sm" variant="outline"><Play className="h-4 w-4" /> Run</Button>
            <Button size="sm" variant="purple" onClick={handleSubmit} disabled={submitting}>
              <Send className="h-4 w-4" /> {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>

          {/* Verdict */}
          {verdict && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t bg-card px-4 py-3"
            >
              <div className="flex items-center gap-3 mb-2">
                {verdict.status === 'ACCEPTED'
                  ? <CheckCircle className="h-5 w-5 text-[#1D9E75]" />
                  : <XCircle className="h-5 w-5 text-[#E24B4A]" />}
                <Badge variant={verdict.status === 'ACCEPTED' ? 'teal' : 'red'}>{verdict.status}</Badge>
                {verdict.time && <span className="text-xs text-muted-foreground">{verdict.time}s · {verdict.memory}MB</span>}
              </div>
              <table className="w-full text-xs border rounded-lg overflow-hidden">
                <thead className="bg-muted/50">
                  <tr>{['Input', 'Expected', 'Got', 'Status'].map((h) => <th key={h} className="px-3 py-2 text-left">{h}</th>)}</tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-3 py-2 font-mono">[2,7,11,15], 9</td>
                    <td className="px-3 py-2 font-mono">[0,1]</td>
                    <td className="px-3 py-2 font-mono">[0,1]</td>
                    <td className="px-3 py-2"><CheckCircle className="h-3.5 w-3.5 text-[#1D9E75]" /></td>
                  </tr>
                </tbody>
              </table>
            </motion.div>
          )}
        </div>

        {/* Right: Tabs */}
        <div className="w-72 shrink-0 border-l flex flex-col overflow-hidden">
          <div className="flex border-b">
            {(['description', 'testcases', 'submissions'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={cn(
                  'flex-1 py-2 text-xs font-medium capitalize transition-colors',
                  activeTab === t ? 'border-b-2 border-[#534AB7] text-[#534AB7]' : 'text-muted-foreground',
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4 text-sm">
            {activeTab === 'description' && (
              <div className="space-y-3">
                <h3 className="font-semibold">{selectedProblem.title}</h3>
                <Badge variant="teal">{selectedProblem.points} pts</Badge>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Given an array of integers and a target sum, return indices of the two numbers that add up to the target.
                </p>
              </div>
            )}
            {activeTab === 'testcases' && (
              <div className="space-y-2 text-xs font-mono">
                <div className="rounded-lg bg-muted p-2"><div className="text-muted-foreground mb-1">Input:</div>[2,7,11,15], target=9</div>
                <div className="rounded-lg bg-muted p-2"><div className="text-muted-foreground mb-1">Output:</div>[0,1]</div>
              </div>
            )}
            {activeTab === 'submissions' && (
              <div className="space-y-2 text-xs">
                <div className="rounded-lg border p-2 flex justify-between">
                  <span>Python</span><Badge variant="teal">ACCEPTED</Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leaderboard drawer */}
      {leaderboardOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setLeaderboardOpen(false)} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="relative w-80 bg-card border-l h-full overflow-y-auto p-4"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Trophy className="h-4 w-4 text-[#EF9F27]" /> Leaderboard</h3>
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-muted-foreground border-b">{['#', 'Team', 'Score', 'Solved', 'Last'].map((h) => <th key={h} className="pb-2 text-left">{h}</th>)}</tr></thead>
              <tbody>
                {mockLeaderboard.map((row) => (
                  <tr key={row.rank} className={cn('border-b', row.isYou && 'bg-[#534AB7]/10 border-l-2 border-l-[#534AB7]')}>
                    <td className="py-2 font-bold">#{row.rank}</td>
                    <td className="py-2">{row.name}</td>
                    <td className="py-2 text-[#534AB7] font-semibold">{row.score}</td>
                    <td className="py-2">{row.solved}</td>
                    <td className="py-2 text-muted-foreground text-xs">{row.lastSubmit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      )}
    </div>
  );
}
