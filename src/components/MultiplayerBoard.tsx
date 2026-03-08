import { useEffect, useRef, useState } from "react";
import { useNumPadPosition } from "../hooks/useNumPadPosition.ts";
import { useSudoku } from "../hooks/useSudoku.ts";
import { formatTime } from "../lib/format.ts";
import { Board } from "./Board.tsx";
import { GameControls } from "./GameControls.tsx";
import { GameResult } from "./GameResult.tsx";
import { NumPad } from "./NumPad.tsx";
import { NumPadPositionToggle } from "./NumPadPositionToggle.tsx";
import { Timer } from "./Timer.tsx";

const EMPTY_CONFLICTS = new Set<number>();

export type MultiplayerBoardProps = {
  puzzle: string;
  playerId: string;
  showConflicts?: boolean;
  opponentProgress: {
    cellsRemaining: number;
    completionPercent: number;
  } | null;
  opponentDisconnected: boolean;
  gameOver: { winnerId: string; winnerName: string } | null;
  onProgress: (cellsRemaining: number, completionPercent: number) => void;
  onComplete: (board: string) => void;
  onRematch: () => void;
  onBack: () => void;
};

export function MultiplayerBoard({
  puzzle,
  playerId,
  showConflicts = true,
  opponentProgress,
  opponentDisconnected,
  gameOver,
  onProgress,
  onComplete,
  onRematch,
  onBack,
}: MultiplayerBoardProps) {
  const game = useSudoku(puzzle);
  const { position, setPosition } = useNumPadPosition();
  const timerSecondsRef = useRef(0);
  const [showResult, setShowResult] = useState(false);
  const prevCellsRef = useRef(game.cellsRemaining);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setRevealed(true), 600);
    return () => clearTimeout(id);
  }, []);

  // Send progress when cells change
  useEffect(() => {
    if (prevCellsRef.current !== game.cellsRemaining) {
      prevCellsRef.current = game.cellsRemaining;
      const total = 81 - puzzle.split("").filter((c) => c !== ".").length;
      const filled = total - game.cellsRemaining;
      const percent = total > 0 ? Math.round((filled / total) * 100) : 0;
      onProgress(game.cellsRemaining, percent);
    }
  }, [game.cellsRemaining, onProgress, puzzle]);

  // Check completion
  useEffect(() => {
    if (game.status !== "completed") return;
    onComplete(puzzle);
  }, [game.status, onComplete, puzzle]);

  // Show result on game over
  useEffect(() => {
    if (!gameOver) return;
    const id = setTimeout(() => setShowResult(true), 300);
    return () => clearTimeout(id);
  }, [gameOver]);

  const handleNumber = (n: number) => {
    if (game.selectedCell) {
      game.placeNumber(n);
    }
  };

  const numPad = (
    <NumPad
      position={position}
      remainingCounts={game.remainingCounts}
      onNumber={handleNumber}
    />
  );

  return (
    <div className="flex flex-col items-center min-h-dvh bg-white dark:bg-gray-950 py-4 px-4 animate-screen-enter">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-[min(100vw-2rem,28rem)] mb-4">
        <button
          type="button"
          className="text-sm text-gray-400 dark:text-gray-500 touch-manipulation"
          onClick={onBack}
        >
          ← Back
        </button>
        <Timer
          running={!gameOver}
          onTick={(s) => {
            timerSecondsRef.current = s;
          }}
        />
        <NumPadPositionToggle position={position} onChange={setPosition} />
      </div>

      {/* Opponent progress bar */}
      {opponentProgress && (
        <div className="w-full max-w-[min(100vw-2rem,28rem)] mb-3">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>
              Opponent
              {opponentDisconnected && (
                <span className="ml-1 text-yellow-500">(reconnecting...)</span>
              )}
            </span>
            <span>{opponentProgress.completionPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-red-400 transition-all duration-300"
              style={{ width: `${opponentProgress.completionPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Board */}
      <div
        className={`
					flex gap-3 w-full justify-center flex-1
					${position === "left" ? "flex-row items-center max-w-lg mx-auto" : ""}
					${position === "right" ? "flex-row-reverse items-center max-w-lg mx-auto" : ""}
					${position === "bottom" ? "flex-col items-center" : ""}
				`}
      >
        {position !== "bottom" && numPad}
        <div
          className={`flex flex-col items-center gap-3 ${position === "bottom" ? "flex-1 justify-center w-full" : "flex-1 min-w-0"}`}
        >
          <Board
            board={game.board}
            selectedCell={game.selectedCell}
            conflicts={showConflicts ? game.conflicts : EMPTY_CONFLICTS}
            onSelectCell={game.selectCell}
            animateReveal={!revealed}
          />
          {/* Controls below board */}
          <div className="flex flex-col items-center gap-3 w-full">
            <GameControls
              notesMode={game.notesMode}
              onToggleNotes={game.toggleNotesMode}
              onErase={game.erase}
              onUndo={game.undo}
            />
            {position === "bottom" && numPad}
          </div>
        </div>
      </div>

      {/* Result */}
      {showResult && gameOver && (
        <GameResult
          isWinner={gameOver.winnerId === playerId}
          time={formatTime(timerSecondsRef.current)}
          onNewGame={onBack}
          onRematch={onRematch}
        />
      )}
    </div>
  );
}
