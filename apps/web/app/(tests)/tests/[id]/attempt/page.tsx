'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { apiSend } from '@/lib/api';

interface AttemptPageProps {
  params: { id: string };
}

interface AttemptResponse {
  id: string;
}

export default function Page({ params }: AttemptPageProps): JSX.Element {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const warningMessage = useMemo(() => {
    if (warningCount === 0) {
      return 'No tab-switch warnings.';
    }
    return `${warningCount} tab-switch warning(s) detected.`;
  }, [warningCount]);

  async function handleSubmit(): Promise<void> {
    try {
      setIsSubmitting(true);
      const attempt = await apiSend<AttemptResponse>(`/api/tests/${params.id}/attempt`, 'POST', {
        userId: 'demo-user',
      });
      await apiSend<{ submitted: boolean; score: number }>(`/api/tests/${params.id}/submit`, 'POST', {
        attemptId: attempt.id,
      });
      router.push(`/tests/${params.id}/result?attemptId=${attempt.id}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Test Attempt Arena</h1>
        <p className="text-sm text-zinc-500">Locked-mode starter with submission flow and anti-cheat warnings.</p>
      </div>

      <div className="rounded border p-3 text-sm">
        <p className="font-medium">Tab Switch Monitor</p>
        <p className="text-zinc-600 dark:text-zinc-300">{warningMessage}</p>
        <button
          type="button"
          onClick={() => setWarningCount((value) => value + 1)}
          className="mt-2 rounded border px-3 py-1 text-xs"
        >
          Simulate Tab Switch
        </button>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting || warningCount >= 3}
        className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Attempt'}
      </button>
      {warningCount >= 3 && <p className="text-sm text-red-600">Auto-submit lock triggered after 3 tab switches.</p>}
    </section>
  );
}
