import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

/**
 * Dual-mode Playwright config:
 * - Local (default): starts Next via webServer
 * - HML: PLAYWRIGHT_BASE_URL=https://hml-arena.kyvoraapp.com.br (no local server)
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const isRemoteHml = /hml-arena\.kyvoraapp\.com\.br/i.test(baseURL);
const envName = isRemoteHml ? "hml" : "local";
const artifactRoot = path.join("artifacts", "playwright", envName);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: !isRemoteHml,
  workers: isRemoteHml ? 1 : undefined,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: isRemoteHml ? 120_000 : 60_000,
  expect: { timeout: 20_000 },
  outputDir: path.join(artifactRoot, "test-results"),
  reporter: [
    ["list"],
    [
      "html",
      {
        outputFolder: path.join(artifactRoot, "reports", "html"),
        open: "never",
      },
    ],
    [
      "json",
      { outputFile: path.join(artifactRoot, "reports", "results.json") },
    ],
  ],
  use: {
    baseURL,
    locale: "pt-BR",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "on",
    actionTimeout: 25_000,
    navigationTimeout: 45_000,
  },
  ...(isRemoteHml
    ? {}
    : {
        webServer: {
          command: "npm run build && npm run start",
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
        },
      }),
  projects: [
    {
      name: "chromium-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
      // Local: skip long HML journey specs; allow targeted UX suites under e2e/hml/*
      testIgnore: isRemoteHml ? [] : [/e2e[\\/]hml[\\/]specs[\\/]/],
    },
    {
      name: "chromium-mobile",
      use: {
        ...devices["Pixel 7"],
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
      },
      testIgnore: isRemoteHml
        ? [/e2e[\\/]hml[\\/]specs[\\/]02-/]
        : [/e2e[\\/]hml[\\/]specs[\\/]/],
    },
  ],
});
