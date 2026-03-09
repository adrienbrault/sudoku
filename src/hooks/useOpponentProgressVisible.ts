import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage.ts";

type BoolStr = "true" | "false";

function isBoolStr(v: string): v is BoolStr {
  return v === "true" || v === "false";
}

export function useOpponentProgressVisible() {
  const [raw, setRaw] = useLocalStorage<BoolStr>(
    "sudoku-opponent-progress-visible",
    "true",
    isBoolStr,
  );

  const visible = raw !== "false";

  const toggle = useCallback(() => {
    setRaw(visible ? "false" : "true");
  }, [visible, setRaw]);

  return { visible, toggle };
}
