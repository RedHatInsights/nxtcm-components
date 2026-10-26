import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

import components from './playwright-ct.config';

// Playwright's webServer is global, so select servers using the CLI's project filter.
const selectedProjects: string[] = [];
let collectingProjects = false;
for (const arg of process.argv.slice(2)) {
  if (arg === '--') break;
  if (arg === '--project') {
    collectingProjects = true;
  } else if (arg.startsWith('--project=')) {
    selectedProjects.push(arg.slice('--project='.length));
    collectingProjects = true;
  } else if (arg.startsWith('-')) {
    collectingProjects = false;
  } else if (collectingProjects) {
    selectedProjects.push(arg);
  }
}

const projectIsSelected = (name: string): boolean =>
  selectedProjects.length === 0 ||
  selectedProjects.some((pattern) =>
    new RegExp(
      `^${pattern
        .split('*')
        .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('.*')}$`,
      'i'
    ).test(name)
  );

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
    ...(projectIsSelected('components') && components.webServer
      ? Array.isArray(components.webServer)
        ? components.webServer
        : [components.webServer]
      : []),
    ...(projectIsSelected('e2e')
      ? [
          {
            cwd: __dirname,
            command: 'npx vite --config vite.e2e.config.ts',
            url: 'http://localhost:3200',
            reuseExistingServer: !process.env.CI,
            timeout: 120_000,
          },
        ]
      : []),
  ],
});
