'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, ChevronDown, Plus, X, Code2, Pencil, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props { interviewId: string; userRole: string }

const DAILY_CO_URL = process.env.NEXT_PUBLIC_DAILY_CO_URL ?? 'https://skillarena.daily.co/demo';

export function InterviewRoomClient({ interviewId: _interviewId, userRole }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [tabWarnings, setTabWarnings] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'whiteboard' | 'notes'>('code');
  const [code, setCode] = useState('// Collaborative editor\n// Start coding here...\n\nfunction solution() {\n  \n}\n');
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const [questions, setQuestions] = useState([
    { id: '1', title: 'Two Sum', category: 'DSA', difficulty: 'EASY' },
    { id: '2', title: 'System Design: URL Shortener', category: 'SYSTEM_DESIGN', difficulty: 'MEDIUM' },
  ]);
  const isInterviewer = userRole === 'INTERVIEWER' || userRole === 'ADMIN';

  // Elapsed timer
  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Tab switch detection
  useEffect(() => {
    const handler = () => {
      if (document.hidden) {
        setTabWarnings((w) => {
          const next = w + 1;
          setShowWarning(true);
          if (next >= 3) toast.error('3 tab switches detected — interviewer has been notified.');
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  const diffColor = { EASY: 'teal', MEDIUM: 'amber', HARD: 'red' } as const;

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden">
      {/* Tab warning */}
      <AnimatePresence>
        {showWarning && tabWarnings < 3 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between bg-[#EF9F27] px-4 py-2 text-sm text-white"
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              ⚠ Tab switch detected ({tabWarnings}/3) — third switch will notify interviewer
            </span>
            <button onClick={() => setShowWarning(false)}><X className="h-4 w-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="flex items-center justify-between border-b bg-card px-4 py-2">
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold">Demo Frontend Interview</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">Candidate: Demo User</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">Interviewer: Demo Interviewer</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm font-mono">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{timeStr}</span>
          </div>
          {isInterviewer && (
            <Button size="sm" variant="destructive" onClick={() => toast.info('Interview ended')}>
              End Interview
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-card px-4">
        {([
          { key: 'code', label: 'Code', icon: Code2 },
          { key: 'whiteboard', label: 'Whiteboard', icon: Pencil },
          ...(isInterviewer ? [{ key: 'notes', label: 'Notes', icon: FileText }] : []),
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'code' | 'whiteboard' | 'notes')}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.key ? 'border-[#534AB7] text-[#534AB7]' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Main split */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Editor / Whiteboard / Notes */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'code' && (
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-full w-full resize-none bg-zinc-950 p-4 font-mono text-sm text-zinc-100 focus:outline-none"
              spellCheck={false}
            />
          )}
          {activeTab === 'whiteboard' && (
            <iframe
              src="https://excalidraw.com"
              title="Whiteboard"
              className="h-full w-full border-0"
            />
          )}
          {activeTab === 'notes' && (
            <textarea
              placeholder="Interviewer notes (hidden from candidate)..."
              className="h-full w-full resize-none bg-background p-4 text-sm focus:outline-none"
            />
          )}
        </div>

        {/* Right: Video */}
        <div className="w-[40%] shrink-0 border-l bg-zinc-950">
          <iframe
            src={DAILY_CO_URL}
            title="Video call"
            allow="camera; microphone; fullscreen; display-capture"
            className="h-full w-full border-0"
          />
        </div>
      </div>

      {/* Question panel (interviewer only) */}
      {isInterviewer && (
        <div className="border-t bg-card">
          <button
            onClick={() => setQuestionsOpen(!questionsOpen)}
            className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium"
          >
            <span>Questions ({questions.length})</span>
            <ChevronDown className={cn('h-4 w-4 transition-transform', questionsOpen && 'rotate-180')} />
          </button>
          <AnimatePresence>
            {questionsOpen && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-3 space-y-2">
                  {questions.map((q) => (
                    <div key={q.id} className="flex items-center justify-between rounded-lg border p-2.5 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{q.title}</span>
                        <Badge variant="purple">{q.category}</Badge>
                        <Badge variant={diffColor[q.difficulty as keyof typeof diffColor]}>{q.difficulty}</Badge>
                      </div>
                      <button onClick={() => setQuestions(questions.filter((x) => x.id !== q.id))}>
                        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" className="w-full">
                    <Plus className="h-4 w-4" /> Add Question
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
