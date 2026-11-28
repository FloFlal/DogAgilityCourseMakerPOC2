import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright e2e configuration (US-032): the specs run against the
 * production build served by `vite preview` (webServer below), Chromium
 * only by default in CI. baseURL is overridable through E2E_BASE_URL to
 * point the suite at a deployed environment (GitHub Pages).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4173/',
    // Deterministic language: the app resolves EN when the browser
    // language is not FR (English-first application, US-016).
    locale: 'en-US',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Explicit 127.0.0.1 binding: the default 'localhost' host can bind
    // IPv6 only on some runners, while the url probe uses IPv4.
    command: 'npm run build && npx vite preview --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173/',
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    stdout: 'pipe',
  },
});
