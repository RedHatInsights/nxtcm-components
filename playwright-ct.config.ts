import { defineConfig, devices } from '@playwright/experimental-ct-react';
import path from 'path';
const enableCoverage = process.env.COVERAGE === 'true' || !!process.env.CI;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const istanbulPlugin = enableCoverage
  ? (require('./playwright/istanbul-plugin.cjs') as object)
  : null;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: '.',
  /* Match only component test files (.spec.tsx), includes packages directory */
  testMatch: [
    'packages/nxtcm-dashboard/src/**/*.spec.tsx',
    'packages/nxtcm-rosa-hcp-wizard/src/**/*.spec.tsx',
  ],
  /* The base directory, relative to the config file, for snapshot files created with toMatchSnapshot and toHaveScreenshot. */
  snapshotDir: './__snapshots__',
  /* Maximum time one test can run for. */
  timeout: 10 * 1000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Port to use for Playwright component endpoint. */
    ctPort: 3100,
    ctViteConfig: {
      plugins: [...(istanbulPlugin ? [istanbulPlugin] : [])],
      resolve: {
        alias: {
          '@redhat-cloud-services/nxtcm-dashboard': path.resolve(
            __dirname,
            './packages/nxtcm-dashboard/src'
          ),
          '@redhat-cloud-services/nxtcm-rosa-hcp-wizard': path.resolve(
            __dirname,
            './packages/nxtcm-rosa-hcp-wizard/src'
          ),
          '@': path.resolve(__dirname, './'),
        },
      },
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
