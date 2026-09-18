import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './auth';
import playlistsRouter from './playlists';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRouter);
app.use('/playlists', playlistsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));