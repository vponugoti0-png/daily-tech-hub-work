import { defineConfig, devices } from "@playwright/test";
import { randomBytes } from "node:crypto";

/**
 * webServer: `npm run dev` (not `build && start`).
 *
 * Why: this suite must boot the app locally. `next start` runs NODE_ENV=production,
 * which (1) refuses a missing/default AUTH_SECRET and (2) sets the CSRF cookie
 * `Secure` — browsers drop that cookie on http://127.0.0.1, so auth smokes fail.
 * Dev mode is also much faster than a full Next 16 + Three.js production build
 * in this environment. AUTH_SECRET is still generated so Auth.js can boot.
 */
const baseURL = "http://127.0.0.1:3000";
const authSecret =
  process.env.AUTH_SECRET &&
  process.env.AUTH_SECRET !== "daily-tech-hub-v3-dev-secret-change-me"
    ? process.env.AUTH_SECRET
    : randomBytes(32).toString("base64");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"]],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    // Skip the hero WebGL scene (md+ and no reduced-motion) — avoids headless GPU flakes.
    reducedMotion: "reduce",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3000",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      AUTH_SECRET: authSecret,
      AUTH_URL: baseURL,
    },
  },
});
