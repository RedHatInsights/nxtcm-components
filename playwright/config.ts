import { defineConfig } from '@playwright/test';
import path from 'node:path';

import components from './components.config';
import e2e from './e2e.config';

export default defineConfig({
  ...components,
  testDir: path.resolve(__dirname, '..'),
  // Each project owns its tests and base URL; galleries and E2E use separate Vite caches.
  projects: [
    {
      ...components.projects?.[0],
      testMatch: components.testMatch,
      use: { ...components.projects?.[0].use, ...components.use },
    },
    {
      ...e2e.projects?.[0],
      testDir: path.resolve(__dirname, 'e2e'),
      testMatch: '**/*.spec.ts',
      timeout: e2e.timeout ?? 30_000,
      use: { ...e2e.projects?.[0].use, ...e2e.use },
    },
  ],
  webServer: [
    ...(Array.isArray(components.webServer)
      ? components.webServer
      : components.webServer
        ? [components.webServer]
        : []),
    ...(Array.isArray(e2e.webServer) ? e2e.webServer : e2e.webServer ? [e2e.webServer] : []),
  ],
});
