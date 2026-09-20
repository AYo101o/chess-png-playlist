# Chess PGN Practice Playlists

Save PGNs into playlists and practice them on an interactive chessboard — the next move is hidden until you guess it.

## Live Demo
- App: <your Vercel URL>
- API: <your Render URL>

## Stack
- Frontend: Next.js, TypeScript, Tailwind
- Backend: Node.js, Express, PostgreSQL
- Auth: JWT
- Chess: chess.js, react-chessboard

## Features
- Register/login with email and password
- Create and manage playlists of PGNs
- View mode: step through a game move by move
- Practice mode: pick a side, guess your moves via click or drag, opponent auto-plays from the PGN

## Running locally
\`\`\`bash
# backend
cd backend && npm install && npm run migrate && npm run start

# frontend
cd frontend && npm install && npm run dev
\`\`\`