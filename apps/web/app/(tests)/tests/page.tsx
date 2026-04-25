import Link from 'next/link';

import { apiGet } from '@/lib/api';
import type { TestListItem } from '@/types/test';

export default async function Page(): Promise<JSX.Element> {
  const tests = await apiGet<TestListItem[]>('/api/tests');

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Mock Tests</h1>
        <p className="text-sm text-zinc-500">Attempt timed tests and track your rank instantly.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {tests.map((test) => (
          <article key={test.id} className="rounded-lg border bg-white p-4 shadow-sm dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">{test.title}</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{test.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
              <span>{test.category}</span>
              <span>{test.duration} mins</span>
              <span>{test.totalMarks} marks</span>
            </div>
            <Link href={`/tests/${test.id}`} className="mt-4 inline-block rounded bg-zinc-900 px-3 py-1.5 text-sm text-white">
              View Test
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
