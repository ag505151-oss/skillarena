import { apiGet } from '@/lib/api';
import type { LeaderboardEntry } from '@/types/hackathon';

interface LeaderboardPageProps {
  params: { id: string };
}

export default async function Page({ params }: LeaderboardPageProps): Promise<JSX.Element> {
  const entries = await apiGet<LeaderboardEntry[]>(`/api/hackathons/${params.id}/leaderboard`);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Leaderboard</h1>
      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="px-3 py-2">Rank</th>
              <th className="px-3 py-2">Participant</th>
              <th className="px-3 py-2">Score</th>
              <th className="px-3 py-2">Solved</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b">
                <td className="px-3 py-2">#{entry.rank}</td>
                <td className="px-3 py-2">{entry.teamId ?? entry.userId ?? 'Unknown'}</td>
                <td className="px-3 py-2">{entry.score}</td>
                <td className="px-3 py-2">{entry.solvedCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
