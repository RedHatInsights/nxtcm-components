import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

import components from './playwright-ct.config';

export default defineConfig({
  ...components,
  projects: [
    {
      ...components.projects?.[0],
      testMatch: components.testMatch,
      use: { ...components.projects?.[0].use, ...components.use },
    },
    {
      name: 'e2e',
      testDir: path.join(__dirname, 'playwright/e2e'),
      testMatch: '**/*.spec.ts',
      timeout: 30_000,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3200',
        trace: 'on-first-retry',
      },
    },
  ],
  webServer: [
    ...(Array.isArray(components.webServer)
      ? components.webServer
      : components.webServer
        ? [components.webServer]
        : []),
    {
      cwd: __dirname,
      command: 'npx vite --config vite.e2e.config.ts',
      url: 'http://localhost:3200',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
