import type { AssistLevel } from "../lib/types.ts";
import { useLocalStorage } from "./useLocalStorage.ts";

const VALID_LEVELS: AssistLevel[] = ["paper", "standard", "full"];

function isAssistLevel(v: string): v is AssistLevel {
  return VALID_LEVELS.includes(v as AssistLevel);
}

export function useAssistLevel() {
  const [level, setLevel] = useLocalStorage<AssistLevel>(
    "sudoku_assist_level",
    "standard",
    isAssistLevel,
  );

  return { level, setLevel };
}
