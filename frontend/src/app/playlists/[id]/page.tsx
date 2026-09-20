'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api';
import PgnBoard from '@/components/PgnBoard';
import PracticeBoard from '@/components/PracticeBoard';

interface Pgn {
  id: number;
  title: string;
  pgn_text: string;
  created_at: string;
}

interface PlaylistDetail {
  id: number;
  name: string;
  pgns: Pgn[];
}

export default function PlaylistDetail() {
  const params = useParams();
  const playlistId = params.id as string;
  const { token, loading } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<'view' | 'practice'>('view');
  const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
  const [title, setTitle] = useState('');
  const [pgnText, setPgnText] = useState('');
  const [error, setError] = useState('');
  const [selectedPgn, setSelectedPgn] = useState<Pgn | null>(null);

  useEffect(() => {
    if (!loading && !token) router.push('/login');
  }, [loading, token, router]);

  useEffect(() => {
    if (token) fetchPlaylist();
  }, [token]);

  async function fetchPlaylist() {
    try {
      const data = await apiFetch(`/playlists/${playlistId}`, token!);
      setPlaylist(data);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleAddPgn(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !pgnText.trim()) return;

    try {
      await apiFetch(`/playlists/${playlistId}/pgns`, token!, {
        method: 'POST',
        body: JSON.stringify({ title, pgn_text: pgnText }),
      });
      setTitle('');
      setPgnText('');
      fetchPlaylist();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDeletePgn(pgnId: number) {
    try {
      await apiFetch(`/playlists/${playlistId}/pgns/${pgnId}`, token!, {
        method: 'DELETE',
      });
      if (selectedPgn?.id === pgnId) setSelectedPgn(null);
      fetchPlaylist();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading || !playlist) return <p className="p-12">Loading...</p>;

  return (
    <main className="max-w-2xl mx-auto p-12">
      <a href="/playlists" className="text-sm text-gray-500 underline">
        ← Back to playlists
      </a>
      <h1 className="text-2xl font-bold mt-2 mb-8">{playlist.name}</h1>

      <form onSubmit={handleAddPgn} className="flex flex-col gap-3 mb-8">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (e.g. Sicilian Najdorf line)"
          className="border rounded px-4 py-2"
        />
        <textarea
          value={pgnText}
          onChange={(e) => setPgnText(e.target.value)}
          placeholder="Paste PGN here (e.g. 1. e4 c5 2. Nf3 d6 ...)"
          className="border rounded px-4 py-2 h-32 font-mono text-sm"
        />
        <button type="submit" className="bg-black text-white rounded px-4 py-2">
          Add PGN
        </button>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <ul className="space-y-2">
        {playlist.pgns.map((p) => (
          <li key={p.id} className="border rounded p-4">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setSelectedPgn(p)}
                className="font-medium hover:underline text-left"
              >
                {p.title}
              </button>
              <button
                onClick={() => handleDeletePgn(p.id)}
                className="text-sm text-red-500"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {playlist.pgns.length === 0 && (
        <p className="text-gray-500">No PGNs yet — add one above.</p>
      )}

      {selectedPgn && (
  <div className="mt-8 border-t pt-8">
    <div className="flex justify-between items-center mb-4">
      <h2 className="font-semibold">{selectedPgn.title}</h2>
      <div className="flex gap-2">
        <button
          onClick={() => setMode('view')}
          className={`text-sm px-3 py-1 rounded border ${mode === 'view' ? 'bg-black text-white' : ''}`}
        >
          View
        </button>
        <button
          onClick={() => setMode('practice')}
          className={`text-sm px-3 py-1 rounded border ${mode === 'practice' ? 'bg-black text-white' : ''}`}
        >
          Practice
        </button>
      </div>
    </div>
    {mode === 'view' ? (
      <PgnBoard pgn={selectedPgn.pgn_text} />
    ) : (
      <PracticeBoard pgn={selectedPgn.pgn_text} />
    )}
  </div>
)}
    </main>
  );
}