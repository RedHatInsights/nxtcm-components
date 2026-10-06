import { defineConfig, devices } from '@playwright/test';

const parsedPort = Number(process.env.STRYKER_CT_PORT ?? 3100);
const galleryPort = Number.isFinite(parsedPort) ? parsedPort : 3100;

export default defineConfig({
  testDir: '.',
  testMatch: [
    'playwright/gallery.spec.ts',
    'src/**/*.spec.tsx',
    'packages/nxtcm-dashboard/src/**/*.spec.tsx',
    'packages/nxtcm-rosa-hcp-wizard/src/**/*.spec.tsx',
  ],
  snapshotDir: './__snapshots__',
  timeout: 10 * 1000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: `http://127.0.0.1:${galleryPort}`,
    serviceWorkers: 'block',
    trace: 'on-first-retry',
  },
  webServer: {
    command: `npx vite --config playwright/vite.config.ts --host 127.0.0.1 --port ${galleryPort}`,
    port: galleryPort,
    reuseExistingServer: !process.env.CI && !process.env.STRYKER_CT_CACHE_DIR,
    timeout: 120_000,
    stdout: process.env.QUIET === 'true' ? 'ignore' : 'pipe',
    stderr: 'pipe',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
