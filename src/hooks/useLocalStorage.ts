import { useCallback, useState } from "react";

/**
 * Persist a value in localStorage with automatic read/write and
 * silent fallback when storage is unavailable.
 *
 * @param key       localStorage key
 * @param fallback  default value when nothing is stored or stored value is invalid
 * @param validate  optional guard; returning false causes fallback to be used
 */
export function useLocalStorage<T extends string>(
  key: string,
  fallback: T,
  validate?: (value: string) => value is T,
): [T, (value: T) => void] {
  const [value, setValueState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        if (!validate || validate(stored)) return stored as T;
      }
    } catch {
      // localStorage not available
    }
    return fallback;
  });

  const setValue = useCallback(
    (v: T) => {
      setValueState(v);
      try {
        localStorage.setItem(key, v);
      } catch {
        // localStorage not available
      }
    },
    [key],
  );

  return [value, setValue];
}
