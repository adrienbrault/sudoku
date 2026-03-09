import { afterEach, expect } from "bun:test";
// biome-ignore lint/performance/noNamespaceImport: expect.extend() requires the full matchers object
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
