import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("useEffectivePosition", () => {
  let listeners: ((e: { matches: boolean }) => void)[] = [];
  let currentMatches = false;

  beforeEach(() => {
    listeners = [];
    currentMatches = false;

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: currentMatches,
      media: query,
      addEventListener: (_event: string, cb: () => void) => {
        listeners.push(cb);
      },
      removeEventListener: (_event: string, cb: () => void) => {
        listeners = listeners.filter((l) => l !== cb);
      },
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  async function loadHook() {
    const mod = await import("./useEffectivePosition.ts");
    return mod.useEffectivePosition;
  }

  it("returns bottom when screen is narrow and position is left", async () => {
    currentMatches = false;
    const useEffectivePosition = await loadHook();
    const { result } = renderHook(() => useEffectivePosition("left"));
    expect(result.current).toBe("bottom");
  });

  it("returns bottom when screen is narrow and position is right", async () => {
    currentMatches = false;
    const useEffectivePosition = await loadHook();
    const { result } = renderHook(() => useEffectivePosition("right"));
    expect(result.current).toBe("bottom");
  });

  it("returns bottom when screen is narrow and position is bottom", async () => {
    currentMatches = false;
    const useEffectivePosition = await loadHook();
    const { result } = renderHook(() => useEffectivePosition("bottom"));
    expect(result.current).toBe("bottom");
  });

  it("returns left when screen is wide and position is left", async () => {
    currentMatches = true;
    const useEffectivePosition = await loadHook();
    const { result } = renderHook(() => useEffectivePosition("left"));
    expect(result.current).toBe("left");
  });

  it("returns right when screen is wide and position is right", async () => {
    currentMatches = true;
    const useEffectivePosition = await loadHook();
    const { result } = renderHook(() => useEffectivePosition("right"));
    expect(result.current).toBe("right");
  });

  it("returns bottom when screen is wide and position is bottom", async () => {
    currentMatches = true;
    const useEffectivePosition = await loadHook();
    const { result } = renderHook(() => useEffectivePosition("bottom"));
    expect(result.current).toBe("bottom");
  });

  it("creates matchMedia query for 540px breakpoint", async () => {
    await loadHook();
    expect(window.matchMedia).toHaveBeenCalledWith("(min-width: 540px)");
  });
});
