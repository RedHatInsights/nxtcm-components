import { defineConfig } from '@playwright/test';
import path from 'node:path';

import { browsers, projectsFor } from './playwright/browsers';
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
  selectedProjects.some((pattern) =>
    new RegExp(
      `^${pattern
        .split('*')
        .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('.*')}$`,
      'i'
    ).test(name)
  );

const suiteIsSelected = (prefix: string): boolean =>
  selectedProjects.length === 0 ||
  browsers.some(({ engine }) => projectIsSelected(`${prefix}-${engine}`));

export default defineConfig({
  ...components,
  projects: [
    ...(components.projects ?? []).map((project) => ({
      ...project,
      testMatch: components.testMatch,
      use: { ...project.use, ...components.use },
    })),
    ...projectsFor('e2e', {
      testDir: path.join(__dirname, 'playwright/e2e'),
      testMatch: '**/*.spec.ts',
      timeout: 30_000,
      use: {
        baseURL: 'http://localhost:3200',
        trace: 'on-first-retry',
      },
    }),
  ],
  webServer: [
    ...(suiteIsSelected('components') && components.webServer
      ? Array.isArray(components.webServer)
        ? components.webServer
        : [components.webServer]
      : []),
    ...(suiteIsSelected('e2e')
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
