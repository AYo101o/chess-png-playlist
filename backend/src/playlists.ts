import { Router } from 'express';
import { pool } from './db';
import { requireAuth, AuthRequest } from './middleware/auth';

const router = Router();
router.use(requireAuth);

// List all playlists for the logged-in user
router.get('/', async (req: AuthRequest, res) => {
  const result = await pool.query(
    'SELECT * FROM playlists WHERE user_id = $1 ORDER BY created_at DESC',
    [req.userId]
  );
  res.json(result.rows);
});

// Create a playlist
router.post('/', async (req: AuthRequest, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });

  const result = await pool.query(
    'INSERT INTO playlists (user_id, name) VALUES ($1, $2) RETURNING *',
    [req.userId, name]
  );
  res.status(201).json(result.rows[0]);
});

// Delete a playlist (only if it belongs to the user)
router.delete('/:id', async (req: AuthRequest, res) => {
  const result = await pool.query(
    'DELETE FROM playlists WHERE id = $1 AND user_id = $2 RETURNING id',
    [req.params.id, req.userId]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

// Get one playlist with its PGNs
router.get('/:id', async (req: AuthRequest, res) => {
  const playlist = await pool.query(
    'SELECT * FROM playlists WHERE id = $1 AND user_id = $2',
    [req.params.id, req.userId]
  );
  if (playlist.rows.length === 0) return res.status(404).json({ error: 'Not found' });

  const pgns = await pool.query(
    'SELECT * FROM pgns WHERE playlist_id = $1 ORDER BY created_at DESC',
    [req.params.id]
  );

  res.json({ ...playlist.rows[0], pgns: pgns.rows });
});


// Add a PGN to a playlist
router.post('/:id/pgns', async (req: AuthRequest, res) => {
  const { title, pgn_text } = req.body;
  if (!title || !pgn_text) return res.status(400).json({ error: 'Title and pgn_text required' });

  const playlist = await pool.query(
    'SELECT id FROM playlists WHERE id = $1 AND user_id = $2',
    [req.params.id, req.userId]
  );
  if (playlist.rows.length === 0) return res.status(404).json({ error: 'Playlist not found' });

  const result = await pool.query(
    'INSERT INTO pgns (playlist_id, title, pgn_text) VALUES ($1, $2, $3) RETURNING *',
    [req.params.id, title, pgn_text]
  );
  res.status(201).json(result.rows[0]);
});

// Edit a PGN
router.put('/:playlistId/pgns/:pgnId', async (req: AuthRequest, res) => {
  const { title, pgn_text } = req.body;
  if (!title || !pgn_text) return res.status(400).json({ error: 'Title and pgn_text required' });

  const playlist = await pool.query(
    'SELECT id FROM playlists WHERE id = $1 AND user_id = $2',
    [req.params.playlistId, req.userId]
  );
  if (playlist.rows.length === 0) return res.status(404).json({ error: 'Playlist not found' });

  const result = await pool.query(
    'UPDATE pgns SET title = $1, pgn_text = $2 WHERE id = $3 AND playlist_id = $4 RETURNING *',
    [title, pgn_text, req.params.pgnId, req.params.playlistId]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'PGN not found' });

  res.json(result.rows[0]);
});

// Delete a PGN
router.delete('/:playlistId/pgns/:pgnId', async (req: AuthRequest, res) => {
  const playlist = await pool.query(
    'SELECT id FROM playlists WHERE id = $1 AND user_id = $2',
    [req.params.playlistId, req.userId]
  );
  if (playlist.rows.length === 0) return res.status(404).json({ error: 'Playlist not found' });

  await pool.query('DELETE FROM pgns WHERE id = $1 AND playlist_id = $2', [
    req.params.pgnId,
    req.params.playlistId,
  ]);
  res.status(204).send();
});

export default router;