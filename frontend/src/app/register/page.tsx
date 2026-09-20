'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      login(data.token, data.user);
      router.push('/playlists');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-semibold mb-1">Create your account</h1>
        <p className="text-neutral-400 text-sm mb-6">Start building your practice playlists</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-neutral-700 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 transition"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-neutral-700 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 transition"
            required
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 transition text-white rounded-lg px-4 py-2.5 font-medium mt-2"
          >
            Register
          </button>
        </form>
        <p className="text-sm text-center mt-5 text-neutral-400">
          Already have an account?{' '}
          <a href="/login" className="text-emerald-400 hover:underline">
            Login
          </a>
        </p>
      </div>
    </main>
  );
}