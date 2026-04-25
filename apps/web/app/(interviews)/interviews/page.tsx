import Link from 'next/link';

import { apiGet } from '@/lib/api';
import type { InterviewListItem } from '@/types/interview';

export default async function Page(): Promise<JSX.Element> {
  const interviews = await apiGet<InterviewListItem[]>('/api/interviews');

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Interviews</h1>
          <p className="text-sm text-zinc-500">Track upcoming and completed interview sessions.</p>
        </div>
        <Link href="/interviews/schedule" className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white">
          Schedule Interview
        </Link>
      </div>

      <div className="space-y-3">
        {interviews.map((interview) => (
          <article key={interview.id} className="rounded border p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">{interview.title}</h2>
              <span className="text-xs text-zinc-500">{interview.status}</span>
            </div>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              {new Date(interview.scheduledAt).toLocaleString()} • {interview.duration} mins
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Candidate: {interview.candidate.name} | Interviewer: {interview.interviewer.name}
            </p>
            <div className="mt-3 flex gap-2">
              <Link href={`/interviews/${interview.id}`} className="rounded border px-3 py-1 text-sm">
                Open Room
              </Link>
              <Link href={`/interviews/${interview.id}/result`} className="rounded border px-3 py-1 text-sm">
                Feedback
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
