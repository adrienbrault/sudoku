import type { NumPadPosition } from "../lib/types.ts";
import { useLocalStorage } from "./useLocalStorage.ts";

const VALID_POSITIONS: NumPadPosition[] = ["left", "right", "bottom"];

function isNumPadPosition(v: string): v is NumPadPosition {
  return VALID_POSITIONS.includes(v as NumPadPosition);
}

export function useNumPadPosition() {
  const [position, setPosition] = useLocalStorage<NumPadPosition>(
    "sudoku-numpad-position",
    "bottom",
    isNumPadPosition,
  );

  return { position, setPosition };
}
