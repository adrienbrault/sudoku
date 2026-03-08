import { useSyncExternalStore } from "react";
import type { NumPadLayout, NumPadPosition } from "../lib/types.ts";

/**
 * Auto-detects the best numpad layout based on viewport and position.
 * - Left/right position: always row (vertical column)
 * - Landscape phones: grid
 * - Portrait with enough height: grid
 * - Otherwise: row
 */

const landscapeQuery =
  typeof window !== "undefined"
    ? window.matchMedia("(orientation: landscape) and (max-height: 500px)")
    : null;

// Portrait with enough room for 3×3 grid below board + controls
// ~630px needed: header(40) + board(360) + controls(48) + grid(160) + gaps(20)
const tallPortraitQuery =
  typeof window !== "undefined"
    ? window.matchMedia(
        "(orientation: portrait) and (min-height: 640px) and (max-width: 768px)",
      )
    : null;

// Desktop/tablet: always row (vertical column beside board)
const desktopQuery =
  typeof window !== "undefined"
    ? window.matchMedia("(min-width: 769px)")
    : null;

function subscribe(cb: () => void) {
  landscapeQuery?.addEventListener("change", cb);
  tallPortraitQuery?.addEventListener("change", cb);
  desktopQuery?.addEventListener("change", cb);
  return () => {
    landscapeQuery?.removeEventListener("change", cb);
    tallPortraitQuery?.removeEventListener("change", cb);
    desktopQuery?.removeEventListener("change", cb);
  };
}

function getViewportLayout(): NumPadLayout {
  if (landscapeQuery?.matches) return "grid";
  if (desktopQuery?.matches) return "row";
  if (tallPortraitQuery?.matches) return "grid";
  return "row";
}

function getServerLayout(): NumPadLayout {
  return "row";
}

export function useNumPadLayout(position: NumPadPosition): NumPadLayout {
  const viewportLayout = useSyncExternalStore(
    subscribe,
    getViewportLayout,
    getServerLayout,
  );
  // Side positions always use row (vertical column)
  if (position === "left" || position === "right") return "row";
  return viewportLayout;
}
