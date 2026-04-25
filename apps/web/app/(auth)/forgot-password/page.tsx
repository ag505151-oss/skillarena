'use client';

import { useState } from 'react';

import { apiSend } from '@/lib/api';

interface ForgotPasswordResponse {
  sent: boolean;
  resetToken?: string;
}

export default function Page(): JSX.Element {
  const [email, setEmail] = useState('candidate@skillarena.dev');
  const [responseText, setResponseText] = useState('');

  async function submit(): Promise<void> {
    try {
      const data = await apiSend<ForgotPasswordResponse>('/api/auth/forgot-password', 'POST', { email });
      setResponseText(data.resetToken ? `Reset token: ${data.resetToken}` : 'Reset instructions sent.');
    } catch (error: unknown) {
      setResponseText(error instanceof Error ? error.message : 'Failed');
    }
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Forgot Password</h1>
      <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded border px-3 py-2 text-sm" />
      <button type="button" onClick={submit} className="rounded bg-zinc-900 px-4 py-2 text-sm text-white">
        Send reset link
      </button>
      {responseText && <textarea readOnly value={responseText} className="min-h-20 w-full rounded border p-2 text-xs" />}
    </section>
  );
}
