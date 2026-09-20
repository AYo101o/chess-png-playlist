'use client';

import { useState, useMemo, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

interface PracticeBoardProps {
  pgn: string;
}

type Side = 'w' | 'b';

export default function PracticeBoard({ pgn }: PracticeBoardProps) {
  const { moveList, loadError } = useMemo(() => {
    try {
      const chess = new Chess();
      chess.loadPgn(pgn);
      return { moveList: chess.history(), loadError: '' };
    } catch (err) {
      return { moveList: [], loadError: 'Invalid PGN' };
    }
  }, [pgn]);

  const [playerSide, setPlayerSide] = useState<Side | null>(null);
  const [moveIndex, setMoveIndex] = useState(0);
  const [game, setGame] = useState(() => new Chess());
  const [feedback, setFeedback] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  const currentTurn: Side = moveIndex % 2 === 0 ? 'w' : 'b';
  const isPlayerTurn = playerSide === currentTurn;

  function startPractice(side: Side) {
    setPlayerSide(side);
    setGame(new Chess());
    setMoveIndex(0);
    setFeedback('');
    setAttempts(0);
    setFinished(false);
    setSelectedSquare(null);
  }

  function resetPractice() {
    setPlayerSide(null);
  }

  // Auto-play the opponent's move
  useEffect(() => {
    if (!playerSide || finished) return;
    if (isPlayerTurn) return;
    if (moveIndex >= moveList.length) return;

    const timer = setTimeout(() => {
      const gameCopy = new Chess(game.fen());
      gameCopy.move(moveList[moveIndex]);
      setGame(gameCopy);
      const nextIndex = moveIndex + 1;
      setMoveIndex(nextIndex);
      setFeedback('');
      if (nextIndex >= moveList.length) setFinished(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [playerSide, isPlayerTurn, moveIndex, finished]);

  function attemptMove(sourceSquare: string, targetSquare: string): boolean {
    if (!playerSide || finished || !isPlayerTurn || moveIndex >= moveList.length) {
      return false;
    }

    const expectedMove = moveList[moveIndex];
    const gameCopy = new Chess(game.fen());

    let attemptedMove;
    try {
      attemptedMove = gameCopy.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
    } catch {
      return false;
    }
    if (!attemptedMove) return false;

    setAttempts((a) => a + 1);

    if (attemptedMove.san === expectedMove) {
      setGame(gameCopy);
      setFeedback('Correct!');
      const nextIndex = moveIndex + 1;
      setMoveIndex(nextIndex);
      if (nextIndex >= moveList.length) setFinished(true);
      return true;
    } else {
      setFeedback('Not quite — try again.');
      return false;
    }
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
    return attemptMove(sourceSquare, targetSquare);
  }

  function onSquareClick(square: string) {
    if (!playerSide || finished || !isPlayerTurn) return;

    if (!selectedSquare) {
      const piece = game.get(square as any);
      if (piece && piece.color === playerSide) {
        setSelectedSquare(square);
      }
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    const moved = attemptMove(selectedSquare, square);
    setSelectedSquare(moved ? null : null);
    // if the click was actually selecting a different own piece instead of moving, allow that
    if (!moved) {
      const piece = game.get(square as any);
      if (piece && piece.color === playerSide) {
        setSelectedSquare(square);
      }
    }
  }

  if (loadError) return <p className="text-red-500">{loadError}</p>;
  if (moveList.length === 0) return <p className="text-gray-500">No moves found.</p>;

  if (!playerSide) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p>Which side do you want to play?</p>
        <div className="flex gap-3">
          <button onClick={() => startPractice('w')} className="px-4 py-2 border rounded">
            White
          </button>
          <button onClick={() => startPractice('b')} className="px-4 py-2 border rounded">
            Black
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full max-w-md">
        <Chessboard
          options={{
            position: game.fen(),
            onPieceDrop: ({ sourceSquare, targetSquare }) =>
              targetSquare ? onDrop(sourceSquare, targetSquare) : false,
            onSquareClick: ({ square }) => onSquareClick(square),
            allowDragging: isPlayerTurn && !finished,
            squareStyles: selectedSquare
              ? { [selectedSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' } }
              : {},
          }}
        />
      </div>

      <p className="text-sm">
        Playing as {playerSide === 'w' ? 'White' : 'Black'} · Move {moveIndex} / {moveList.length} · Attempts: {attempts}
      </p>

      {!isPlayerTurn && !finished && (
        <p className="text-gray-500 text-sm">Opponent is moving...</p>
      )}

      {feedback && (
        <p className={feedback === 'Correct!' ? 'text-green-600' : 'text-red-500'}>
          {feedback}
        </p>
      )}

      {finished && (
        <p className="font-semibold text-green-700">
          🎉 Line complete in {attempts} attempts!
        </p>
      )}

      <button onClick={resetPractice} className="px-3 py-1 border rounded text-sm">
        Choose side again
      </button>
    </div>
  );
}