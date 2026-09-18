'use client';

import { useState, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

interface PgnBoardProps {
  pgn: string;
}

export default function PgnBoard({ pgn }: PgnBoardProps) {
  const [moveIndex, setMoveIndex] = useState(0);

  const { positions, moveList, loadError } = useMemo(() => {
    try {
      const chess = new Chess();
      chess.loadPgn(pgn);
      const history = chess.history();

      // Replay from scratch to capture the FEN at each step
      const replay = new Chess();
      const fens: string[] = [replay.fen()];
      for (const move of history) {
        replay.move(move);
        fens.push(replay.fen());
      }

      return { positions: fens, moveList: history, loadError: '' };
    } catch (err) {
      return { positions: [], moveList: [], loadError: 'Invalid PGN' };
    }
  }, [pgn]);

  if (loadError) return <p className="text-red-500">{loadError}</p>;
  if (positions.length === 0) return <p className="text-gray-500">No moves found.</p>;

  const currentFen = positions[moveIndex];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full max-w-md">
       <Chessboard options={{
            position: currentFen,
            allowDragging: false,
        }}
    />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setMoveIndex((i) => Math.max(0, i - 1))}
          disabled={moveIndex === 0}
          className="px-3 py-1 border rounded disabled:opacity-30"
        >
          ← Prev
        </button>
        <span className="px-3 py-1">
          Move {moveIndex} / {moveList.length}
        </span>
        <button
          onClick={() => setMoveIndex((i) => Math.min(moveList.length, i + 1))}
          disabled={moveIndex === moveList.length}
          className="px-3 py-1 border rounded disabled:opacity-30"
        >
          Next →
        </button>
      </div>

      <div className="text-sm text-gray-500 flex flex-wrap gap-x-2 max-w-md justify-center">
        {moveList.map((move, i) => (
          <span
            key={i}
            className={i === moveIndex - 1 ? 'font-bold text-black' : ''}
          >
            {i % 2 === 0 ? `${i / 2 + 1}.` : ''} {move}
          </span>
        ))}
      </div>
    </div>
  );
}