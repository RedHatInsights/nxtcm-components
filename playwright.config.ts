import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './playwright/e2e/',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run start',
    cwd: './packages/react-form-wizard',
    url: 'http://localhost:3000/wizards/',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
