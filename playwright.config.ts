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
  updateSnapshots: process.env.CI ? 'none' : 'missing',
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
      // Shared screenshot baselines are only comparable in the pinned container.
      testIgnore:
        process.env.PLAYWRIGHT_INCLUDE_VISUAL_TESTS === 'true' ? [] : '**/*-visual.spec.ts',
      timeout: 30_000,
      snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}-{projectName}{ext}',
      outputDir: './test-results',
      expect: {
        toHaveScreenshot: {
          animations: 'disabled',
          caret: 'hide',
          scale: 'css',
          threshold: 0.2,
          maxDiffPixels: 0,
        },
      },
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
        colorScheme: 'light',
        locale: 'en-US',
        timezoneId: 'UTC',
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
