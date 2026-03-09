import { defineConfig, devices } from "@playwright/test";

// Dark mode and "with friends" tests verify theming/data, not layout.
// Only run them on the two primary form-factor projects (iPhone SE + Desktop).
const LAYOUT_ONLY = /dark mode|with friends/;

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e/results",
  snapshotPathTemplate: "{testDir}/screenshots/{arg}{ext}",
  fullyParallel: true,
  use: {
    baseURL: "http://localhost:5173",
  },
  webServer: {
    command: "bun run dev",
    port: 5173,
    reuseExistingServer: true,
  },
  projects: [
    // Primary projects: run all tests (including dark mode / with-friends variants)
    {
      name: "iPhone SE",
      use: {
        ...devices["iPhone SE"],
        defaultBrowserType: "chromium",
        deviceScaleFactor: 1,
      },
    },
    {
      name: "Desktop",
      use: {
        viewport: { width: 1280, height: 800 },
      },
    },
    // Secondary projects: layout-critical viewports — skip theming-only variants
    {
      name: "iPhone 14",
      use: {
        ...devices["iPhone 14"],
        defaultBrowserType: "chromium",
        deviceScaleFactor: 1,
      },
      grepInvert: LAYOUT_ONLY,
    },
    {
      name: "iPad Mini",
      use: {
        ...devices["iPad Mini"],
        defaultBrowserType: "chromium",
        deviceScaleFactor: 1,
      },
      grepInvert: LAYOUT_ONLY,
    },
    {
      name: "iPhone 14 Safari",
      use: {
        ...devices["iPhone 14"],
        defaultBrowserType: "chromium",
        deviceScaleFactor: 1,
        // Real Safari portrait with status bar + bottom toolbar (~190px lost)
        viewport: { width: 390, height: 654 },
      },
      grepInvert: LAYOUT_ONLY,
    },
    {
      name: "iPhone 14 Landscape",
      use: {
        ...devices["iPhone 14"],
        defaultBrowserType: "chromium",
        deviceScaleFactor: 1,
        viewport: { width: 844, height: 390 },
      },
      grepInvert: LAYOUT_ONLY,
    },
    {
      name: "iPhone SE Landscape",
      use: {
        ...devices["iPhone SE"],
        defaultBrowserType: "chromium",
        deviceScaleFactor: 1,
        viewport: { width: 667, height: 375 },
      },
      grepInvert: LAYOUT_ONLY,
    },
    {
      name: "iPhone 14 Landscape Safari",
      use: {
        ...devices["iPhone 14"],
        defaultBrowserType: "chromium",
        deviceScaleFactor: 1,
        // Real Safari landscape with toolbar visible (~50px lost)
        viewport: { width: 844, height: 340 },
      },
      grepInvert: LAYOUT_ONLY,
    },
    {
      name: "iPhone SE Landscape Safari",
      use: {
        ...devices["iPhone SE"],
        defaultBrowserType: "chromium",
        deviceScaleFactor: 1,
        viewport: { width: 667, height: 325 },
      },
      grepInvert: LAYOUT_ONLY,
    },
  ],
});
