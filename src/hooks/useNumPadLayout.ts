import { useCallback, useState } from "react";
import type { NumPadLayout } from "../lib/types.ts";

const STORAGE_KEY = "sudoku-numpad-layout";

function getInitial(): NumPadLayout {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "row" || stored === "grid") {
      return stored;
    }
  } catch {
    // localStorage not available
  }
  return "row";
}

export function useNumPadLayout() {
  const [layout, setLayoutState] = useState<NumPadLayout>(getInitial);

  const setLayout = useCallback((l: NumPadLayout) => {
    setLayoutState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // localStorage not available
    }
  }, []);

  return { layout, setLayout };
}
