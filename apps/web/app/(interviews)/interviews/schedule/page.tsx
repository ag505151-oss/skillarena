'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { apiSend } from '@/lib/api';

interface CreateInterviewResponse {
  id: string;
}

export default function Page(): JSX.Element {
  const router = useRouter();
  const [title, setTitle] = useState('Frontend System Design Round');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(60);
  const [candidateId, setCandidateId] = useState('demo-candidate');
  const [interviewerId, setInterviewerId] = useState('demo-interviewer');
  const [message, setMessage] = useState('');

  async function submitSchedule(): Promise<void> {
    try {
      const response = await apiSend<CreateInterviewResponse>('/api/interviews', 'POST', {
        title,
        scheduledAt: new Date(scheduledAt).toISOString(),
        duration,
        candidateId,
        interviewerId,
      });
      setMessage('Interview scheduled successfully.');
      router.push(`/interviews/${response.id}`);
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Failed to schedule interview');
    }
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Schedule Interview</h1>
      <input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded border px-3 py-2 text-sm" placeholder="Interview title" />
      <input
        type="datetime-local"
        value={scheduledAt}
        onChange={(event) => setScheduledAt(event.target.value)}
        className="w-full rounded border px-3 py-2 text-sm"
      />
      <input
        type="number"
        value={duration}
        onChange={(event) => setDuration(Number(event.target.value))}
        className="w-full rounded border px-3 py-2 text-sm"
      />
      <input
        value={candidateId}
        onChange={(event) => setCandidateId(event.target.value)}
        className="w-full rounded border px-3 py-2 text-sm"
        placeholder="Candidate user ID"
      />
      <input
        value={interviewerId}
        onChange={(event) => setInterviewerId(event.target.value)}
        className="w-full rounded border px-3 py-2 text-sm"
        placeholder="Interviewer user ID"
      />
      <button type="button" onClick={submitSchedule} className="rounded bg-indigo-600 px-4 py-2 text-sm text-white">
        Schedule
      </button>
      {message && <p className="text-sm">{message}</p>}
    </section>
  );
}
