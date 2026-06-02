import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config (docs/testing.md §4). Boots the full stack via `webServer`:
 * an ephemeral-Mongo backend on :3000 and the built SPA (vite preview) on :4173.
 * Run from the repo root: `npm run test:e2e`.
 */
const FRONTEND_URL = 'http://localhost:4173';
const API_URL = 'http://localhost:3000';

// When PLAYWRIGHT_BASE_URL is set (e.g. CD running against deployed staging),
// target that URL and skip booting the local stack.
const remoteBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

const localWebServers = [
  {
    command: 'npm run e2e:server --workspace backend',
    cwd: '..',
    url: `${API_URL}/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  {
    command:
      'VITE_API_BASE_URL=http://localhost:3000/api/v1 npm run build --workspace frontend && npm run preview --workspace frontend -- --port 4173 --strictPort',
    cwd: '..',
    url: FRONTEND_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
];

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: remoteBaseUrl ?? FRONTEND_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  ...(remoteBaseUrl ? {} : { webServer: localWebServers }),
});
