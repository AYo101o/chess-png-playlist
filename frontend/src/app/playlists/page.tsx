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

  if (loading) return <p className="p-12">Loading...</p>;

  return (
    <main className="max-w-2xl mx-auto p-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Playlists</h1>
        <button onClick={logout} className="text-sm text-gray-500 underline">
          Logout ({user?.email})
        </button>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2 mb-8">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New playlist name"
          className="flex-1 border rounded px-4 py-2"
        />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">
          Create
        </button>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <ul className="space-y-2">
        {playlists.map((p) => (
          <li key={p.id} className="border rounded p-4 flex justify-between items-center">
            <a href={`/playlists/${p.id}`} className="font-medium hover:underline">
              {p.name}
            </a>
            <button
              onClick={() => handleDelete(p.id)}
              className="text-sm text-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {playlists.length === 0 && !error && (
        <p className="text-gray-500">No playlists yet — create one above.</p>
      )}
    </main>
  );
}