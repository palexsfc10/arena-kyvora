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
const hasE2ePassword = Boolean(process.env.ARENA_E2E_PASSWORD?.trim());

/** Suites that register/login against HML API — skip in local/CI without secret. */
const authHeavyLocalIgnore = [
  /e2e[\\/]hml[\\/]specs[\\/]/,
  /e2e[\\/]hml[\\/]notifications[\\/]/,
  /e2e[\\/]hml[\\/]explorar[\\/]/,
  /e2e[\\/]hml[\\/]feedback-cadastro-full/,
];

const localTestIgnore = hasE2ePassword
  ? [/e2e[\\/]hml[\\/]specs[\\/]/]
  : authHeavyLocalIgnore;

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
          command: `npm run build && npx next start --hostname 127.0.0.1 --port ${new URL(baseURL).port || "3000"}`,
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
      // Local/CI without ARENA_E2E_PASSWORD: public + mocked only.
      // Remote HML: full desktop coverage including authenticated journeys.
      testIgnore: isRemoteHml ? [] : localTestIgnore,
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
        : localTestIgnore,
    },
  ],
});
