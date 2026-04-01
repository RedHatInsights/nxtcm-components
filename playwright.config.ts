import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './playwright/e2e/',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3200',
    trace: 'on-first-retry',
  },
  webServer: {
    command:
      'rm -rf packages/react-form-wizard/node_modules/react packages/react-form-wizard/node_modules/react-dom && npx vite --config vite.e2e.config.ts',
    url: 'http://localhost:3200',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
