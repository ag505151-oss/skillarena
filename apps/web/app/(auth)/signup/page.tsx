'use client';

import { useState } from 'react';

import { apiSend } from '@/lib/api';

interface SignupResponse {
  token: string;
  user: { id: string; email: string; role: string; name: string };
}

export default function Page(): JSX.Element {
  const [name, setName] = useState('New User');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password@123');
  const [message, setMessage] = useState('');

  async function signup(): Promise<void> {
    try {
      const response = await apiSend<SignupResponse>('/api/auth/signup', 'POST', {
        name,
        email,
        password,
      });
      setMessage(`Account created for ${response.user.email}.`);
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Signup failed');
    }
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" className="w-full rounded border px-3 py-2 text-sm" />
      <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="w-full rounded border px-3 py-2 text-sm" />
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        className="w-full rounded border px-3 py-2 text-sm"
      />
      <button type="button" onClick={signup} className="rounded bg-zinc-900 px-4 py-2 text-sm text-white">
        Sign up
      </button>
      {message && <p className="text-sm">{message}</p>}
    </section>
  );
}
