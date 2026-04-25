'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Page(): JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState('candidate@skillarena.dev');
  const [password, setPassword] = useState('Password@123');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function login(): Promise<void> {
    setLoading(true);
    setMessage('');
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setMessage('Invalid email or password.');
      } else {
        router.push('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-sm space-y-4 py-16">
      <h1 className="text-2xl font-semibold">Sign in to SkillArena</h1>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full rounded border px-3 py-2 text-sm"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full rounded border px-3 py-2 text-sm"
      />
      <button
        type="button"
        onClick={login}
        disabled={loading}
        className="w-full rounded bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-60"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
      {message && <p className="text-sm text-red-600">{message}</p>}
      <p className="text-sm text-zinc-500">
        No account?{' '}
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </p>
    </section>
  );
}
