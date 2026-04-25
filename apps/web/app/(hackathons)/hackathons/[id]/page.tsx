import Link from 'next/link';

import { apiGet, apiSend } from '@/lib/api';
import type { HackathonDetail } from '@/types/hackathon';

interface HackathonPageProps {
  params: { id: string };
}

export default async function Page({ params }: HackathonPageProps): Promise<JSX.Element> {
  const hackathon = await apiGet<HackathonDetail>(`/api/hackathons/${params.id}`);

  async function register(): Promise<void> {
    'use server';
    await apiSend(`/api/hackathons/${params.id}/register`, 'POST', {
      userId: 'demo-user',
    });
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">{hackathon.title}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{hackathon.description}</p>
      </div>

      <div className="grid gap-2 rounded border p-4 text-sm md:grid-cols-3">
        <p>Status: {hackathon.status}</p>
        <p>Starts: {new Date(hackathon.startAt).toLocaleString()}</p>
        <p>Ends: {new Date(hackathon.endAt).toLocaleString()}</p>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-medium">Problems</h2>
        <ul className="space-y-2">
          {hackathon.problems.map((problem) => (
            <li key={problem.id} className="rounded border p-3">
              <p className="font-medium">{problem.question.title}</p>
              <p className="text-sm text-zinc-500">{problem.question.description}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {problem.question.difficulty} • {problem.points} pts
              </p>
            </li>
          ))}
        </ul>
      </div>

      <form action={register}>
        <button type="submit" className="rounded bg-emerald-600 px-4 py-2 text-sm text-white">
          Register
        </button>
      </form>

      <div className="flex gap-3">
        <Link href={`/hackathons/${params.id}/arena`} className="rounded border px-3 py-1.5 text-sm">
          Open Arena
        </Link>
        <Link href={`/hackathons/${params.id}/leaderboard`} className="rounded border px-3 py-1.5 text-sm">
          View Leaderboard
        </Link>
      </div>
    </section>
  );
}
