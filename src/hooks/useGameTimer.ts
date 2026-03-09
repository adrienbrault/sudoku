import { useEffect, useState } from "react";
import type { GameStatus } from "../lib/types.ts";

type UseGameTimerResult = {
  paused: boolean;
  setPaused: (paused: boolean | ((prev: boolean) => boolean)) => void;
};

/**
 * Manages pause state for the in-game timer.
 * Automatically pauses when the tab is hidden during active play.
 */
export function useGameTimer(status: GameStatus): UseGameTimerResult {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && status === "playing") {
        setPaused(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [status]);

  return { paused, setPaused };
}
