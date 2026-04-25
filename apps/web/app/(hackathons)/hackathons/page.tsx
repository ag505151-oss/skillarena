import Link from 'next/link';

import { apiGet } from '@/lib/api';
import type { HackathonListItem } from '@/types/hackathon';

export default async function Page(): Promise<JSX.Element> {
  const hackathons = await apiGet<HackathonListItem[]>('/api/hackathons');

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Hackathons</h1>
        <p className="text-sm text-zinc-500">Compete live, submit code, and climb the leaderboard.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {hackathons.map((hackathon) => (
          <article key={hackathon.id} className="rounded border p-4">
            <h2 className="text-lg font-medium">{hackathon.title}</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{hackathon.description}</p>
            <div className="mt-2 flex gap-3 text-xs text-zinc-500">
              <span>{hackathon.status}</span>
              <span>Team size: {hackathon.maxTeamSize}</span>
              <span>Fee: ${hackathon.entryFee}</span>
            </div>
            <Link href={`/hackathons/${hackathon.id}`} className="mt-3 inline-block rounded bg-zinc-900 px-3 py-1.5 text-sm text-white">
              Open Hackathon
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
