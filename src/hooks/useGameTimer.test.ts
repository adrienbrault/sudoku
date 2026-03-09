import { describe, expect, it } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { useGameTimer } from "./useGameTimer.ts";

function triggerVisibilityChange(hidden: boolean) {
  Object.defineProperty(document, "hidden", {
    configurable: true,
    get: () => hidden,
  });
  document.dispatchEvent(new Event("visibilitychange"));
}

describe("useGameTimer", () => {
  it("starts unpaused", () => {
    const { result } = renderHook(() => useGameTimer("playing"));
    expect(result.current.paused).toBe(false);
  });

  it("pauses when tab is hidden during playing status", () => {
    const { result } = renderHook(() => useGameTimer("playing"));

    act(() => {
      triggerVisibilityChange(true);
    });

    expect(result.current.paused).toBe(true);
  });

  it("does not pause when tab is hidden during completed status", () => {
    const { result } = renderHook(() => useGameTimer("completed"));

    act(() => {
      triggerVisibilityChange(true);
    });

    expect(result.current.paused).toBe(false);
  });

  it("does not pause when tab is hidden during idle status", () => {
    const { result } = renderHook(() => useGameTimer("idle"));

    act(() => {
      triggerVisibilityChange(true);
    });

    expect(result.current.paused).toBe(false);
  });

  it("setPaused manually toggles paused state", () => {
    const { result } = renderHook(() => useGameTimer("playing"));

    act(() => {
      result.current.setPaused(true);
    });
    expect(result.current.paused).toBe(true);

    act(() => {
      result.current.setPaused(false);
    });
    expect(result.current.paused).toBe(false);
  });

  it("does not pause when tab becomes visible", () => {
    const { result } = renderHook(() => useGameTimer("playing"));

    act(() => {
      triggerVisibilityChange(false);
    });

    expect(result.current.paused).toBe(false);
  });
});
