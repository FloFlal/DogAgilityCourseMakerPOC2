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
    command: 'npm run build && npm run preview',
    url: 'http://127.0.0.1:4173/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
