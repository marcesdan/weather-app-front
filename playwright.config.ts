import { defineConfig, devices } from "@playwright/test";

const PORT = 5299; // 5199 is Astropia's QA server

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    locale: "es-AR",
    timezoneId: "America/Argentina/Buenos_Aires",
  },
  projects: [
    // channel "chromium" = full browser in new headless mode; the headless shell reports notifications as denied.
    { name: "chromium", use: { ...devices["Pixel 7"], channel: "chromium" } },
    // Real WebKit engine (what iOS runs). Needs `sudo pnpm exec playwright install-deps` once.
    { name: "webkit", use: { ...devices["iPhone 15"] } },
  ],
  // Our own dev server pointed at a fake API host; every request is mocked in e2e/fixtures.ts.
  webServer: {
    command: `pnpm exec vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    env: { VITE_WEATHER_API_URL: "http://api.test/api/v1" },
  },
});
