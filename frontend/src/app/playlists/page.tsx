'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api';

interface Playlist {
  id: number;
  name: string;
  created_at: string;
}

export default function Playlists() {
  const { token, user, loading, logout } = useAuth();
  const router = useRouter();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !token) router.push('/login');
  }, [loading, token, router]);

  useEffect(() => {
    if (token) fetchPlaylists();
  }, [token]);

  async function fetchPlaylists() {
    try {
      const data = await apiFetch('/playlists', token!);
      setPlaylists(data);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await apiFetch('/playlists', token!, {
        method: 'POST',
        body: JSON.stringify({ name: newName }),
      });
      setNewName('');
      fetchPlaylists();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(id: number) {
    try {
      await apiFetch(`/playlists/${id}`, token!, { method: 'DELETE' });
      fetchPlaylists();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) return <p className="p-12 text-neutral-400">Loading...</p>;

  return (
    <main className="max-w-2xl mx-auto p-8 sm:p-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Your Playlists</h1>
          <p className="text-sm text-neutral-500">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="text-sm text-neutral-400 hover:text-white transition"
        >
          Logout
        </button>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2 mb-8">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New playlist name"
          className="flex-1 border border-neutral-700 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 transition"
        />
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-500 transition text-white px-5 py-2.5 rounded-lg font-medium"
        >
          Create
        </button>
      </form>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <ul className="space-y-2">
        {playlists.map((p) => (
          <li
            key={p.id}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex justify-between items-center hover:border-neutral-700 transition"
          >
            <a href={`/playlists/${p.id}`} className="font-medium hover:text-emerald-400 transition">
              {p.name}
            </a>
            <button
              onClick={() => handleDelete(p.id)}
              className="text-sm text-red-400 hover:text-red-300 transition"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {playlists.length === 0 && !error && (
        <p className="text-neutral-500">No playlists yet — create one above.</p>
      )}
    </main>
  );
}