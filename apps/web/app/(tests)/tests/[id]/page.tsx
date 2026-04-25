import Link from 'next/link';
import { redirect } from 'next/navigation';

import { apiGet, apiSend } from '@/lib/api';
import type { AttemptStartResponse, TestDetail } from '@/types/test';

interface TestDetailPageProps {
  params: { id: string };
}

export default async function Page({ params }: TestDetailPageProps): Promise<JSX.Element> {
  const test = await apiGet<TestDetail>(`/api/tests/${params.id}`);

  async function startAttempt(): Promise<void> {
    'use server';
    const attempt = await apiSend<AttemptStartResponse>(`/api/tests/${params.id}/attempt`, 'POST', {
      userId: 'demo-user',
    });
    redirect(`/tests/${params.id}/attempt?attemptId=${attempt.id}`);
  }

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{test.title}</h1>
        <p className="text-zinc-600 dark:text-zinc-300">{test.description}</p>
      </div>

      <div className="grid gap-2 rounded border p-4 text-sm md:grid-cols-3">
        <p>Duration: {test.duration} mins</p>
        <p>Total Marks: {test.totalMarks}</p>
        <p>Passing Score: {test.passingScore}</p>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-medium">Questions ({test.questions.length})</h2>
        <ul className="space-y-2 text-sm">
          {test.questions.map((question, index) => (
            <li key={question.id} className="rounded border p-3">
              <p className="font-medium">
                Q{index + 1}. {question.question.title}
              </p>
              <p className="text-zinc-500">{question.question.description}</p>
            </li>
          ))}
        </ul>
      </div>

      <form action={startAttempt}>
        <button type="submit" className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
          Start Test
        </button>
      </form>

      <Link href={`/tests/${params.id}/attempt`} className="inline-block rounded border px-4 py-2 text-sm">
        Continue to Attempt Page
      </Link>
    </section>
  );
}
