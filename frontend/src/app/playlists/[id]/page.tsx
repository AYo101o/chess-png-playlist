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

  const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
  const [title, setTitle] = useState('');
  const [pgnText, setPgnText] = useState('');
  const [error, setError] = useState('');
  const [selectedPgn, setSelectedPgn] = useState<Pgn | null>(null);
  const [mode, setMode] = useState<'view' | 'practice'>('view');
  const [editingPgn, setEditingPgn] = useState<Pgn | null>(null);

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

  async function handleUpdatePgn(e: React.FormEvent) {
  e.preventDefault();
  if (!editingPgn || !title.trim() || !pgnText.trim()) return;

  try {
    await apiFetch(`/playlists/${playlistId}/pgns/${editingPgn.id}`, token!, {
      method: 'PUT',
      body: JSON.stringify({ title, pgn_text: pgnText }),
    });
    setEditingPgn(null);
    setTitle('');
    setPgnText('');
    fetchPlaylist();
  } catch (err: any) {
    setError(err.message);
  }
}

function startEdit(p: Pgn) {
  setEditingPgn(p);
  setTitle(p.title);
  setPgnText(p.pgn_text);
}

function cancelEdit() {
  setEditingPgn(null);
  setTitle('');
  setPgnText('');
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

  function openPgn(p: Pgn, targetMode: 'view' | 'practice') {
    setSelectedPgn(p);
    setMode(targetMode);
  }

  if (loading || !playlist) return <p className="p-12 text-neutral-400">Loading...</p>;

  return (
    <main className="max-w-2xl mx-auto p-8 sm:p-12">
      <a href="/playlists" className="text-sm text-neutral-400 hover:text-white transition">
        ← Back to playlists
      </a>
      <h1 className="text-2xl font-semibold mt-2 mb-8">{playlist.name}</h1>

      <form onSubmit={editingPgn ? handleUpdatePgn : handleAddPgn} className="flex flex-col gap-3 mb-8">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (e.g. Sicilian Najdorf line)"
          className="border border-neutral-700 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 transition"
        />
        <textarea
          value={pgnText}
          onChange={(e) => setPgnText(e.target.value)}
          placeholder="Paste PGN here (e.g. 1. e4 c5 2. Nf3 d6 ...)"
          className="border border-neutral-700 rounded-lg px-4 py-2.5 h-32 font-mono text-sm outline-none focus:border-emerald-500 transition"
        />
        <div className="flex gap-2">
  <button
    type="submit"
    className="bg-emerald-600 hover:bg-emerald-500 transition text-white rounded-lg px-4 py-2.5 font-medium"
  >
    {editingPgn ? 'Save Changes' : 'Add PGN'}
  </button>
  {editingPgn && (
    <button
      type="button"
      onClick={cancelEdit}
      className="border border-neutral-700 hover:border-neutral-500 transition rounded-lg px-4 py-2.5 font-medium"
    >
      Cancel
    </button>
  )}
</div>
      </form>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <ul className="space-y-2">
        {playlist.pgns.map((p) => (
          <li
            key={p.id}
            className={`bg-neutral-900 border rounded-xl p-4 transition ${
              selectedPgn?.id === p.id ? 'border-emerald-600' : 'border-neutral-800'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{p.title}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => openPgn(p, 'view')}
                  className={`text-sm px-3 py-1.5 rounded-lg border transition ${
                    selectedPgn?.id === p.id && mode === 'view'
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-neutral-700 hover:border-neutral-500'
                  }`}
                >
                  View
                </button>
                <button
                  onClick={() => openPgn(p, 'practice')}
                  className={`text-sm px-3 py-1.5 rounded-lg border transition ${
                    selectedPgn?.id === p.id && mode === 'practice'
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-neutral-700 hover:border-neutral-500'
                  }`}
                >
                  Practice
                </button>
                <button
  onClick={() => startEdit(p)}
  className="text-sm px-3 py-1.5 rounded-lg border border-neutral-700 hover:border-neutral-500 transition"
>
  Edit
</button>
                <button
                  onClick={() => handleDeletePgn(p.id)}
                  className="text-sm text-red-400 hover:text-red-300 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {playlist.pgns.length === 0 && (
        <p className="text-neutral-500">No PGNs yet — add one above.</p>
      )}

      {selectedPgn && (
        <div className="mt-8 border-t border-neutral-800 pt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">{selectedPgn.title}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('view')}
                className={`text-sm px-3 py-1.5 rounded-lg border transition ${
                  mode === 'view'
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-neutral-700 hover:border-neutral-500'
                }`}
              >
                View
              </button>
              <button
                onClick={() => setMode('practice')}
                className={`text-sm px-3 py-1.5 rounded-lg border transition ${
                  mode === 'practice'
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-neutral-700 hover:border-neutral-500'
                }`}
              >
                Practice
              </button>
            </div>
          </div>
          {mode === 'view' ? (
            <PgnBoard key={selectedPgn.id} pgn={selectedPgn.pgn_text} />
          ) : (
            <PracticeBoard key={selectedPgn.id} pgn={selectedPgn.pgn_text} />
          )}
        </div>
      )}
    </main>
  );
}