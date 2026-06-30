import { defineConfig, devices } from '@playwright/experimental-ct-react';
import path from 'path';

const enableCoverage = process.env.COVERAGE === 'true';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const istanbulPlugin = enableCoverage ? require('./playwright/istanbul-plugin.cjs')() : null;

const strykerCacheDir = process.env.STRYKER_CT_CACHE_DIR;
const strykerCtPortParsed = process.env.STRYKER_CT_PORT
  ? Number(process.env.STRYKER_CT_PORT)
  : undefined;
const strykerCtPort = Number.isFinite(strykerCtPortParsed) ? strykerCtPortParsed : undefined;
const strykerActiveMutant = process.env.__STRYKER_ACTIVE_MUTANT__;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: '.',
  /* Match only component test files (.spec.tsx), includes packages directory */
  testMatch: [
    'src/**/*.spec.tsx',
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
    ctPort: strykerCtPort ?? 3100,
    ...(strykerCacheDir ? { ctCacheDir: strykerCacheDir } : {}),
    ctViteConfig: {
      plugins: [...(istanbulPlugin ? [istanbulPlugin] : [])],
      ...(strykerCacheDir
        ? {
            cacheDir: path.join(strykerCacheDir, 'vite-deps'),
            server: { strictPort: true },
            build: { emptyOutDir: true },
            // Baked into the browser bundle so Stryker-instrumented code can activate mutants.
            ...(strykerActiveMutant
              ? {
                  define: {
                    'import.meta.env.STRYKER_ACTIVE_MUTANT': JSON.stringify(strykerActiveMutant),
                  },
                }
              : {}),
          }
        : {}),
      resolve: {
        alias: {
          '@patternfly-labs/react-form-wizard': path.resolve(
            __dirname,
            './packages/react-form-wizard/src'
          ),
          '@redhat-cloud-services/nxtcm-dashboard': path.resolve(
            __dirname,
            './packages/nxtcm-dashboard/src'
          ),
          '@redhat-cloud-services/nxtcm-rosa-hcp-wizard': path.resolve(
            __dirname,
            './packages/nxtcm-rosa-hcp-wizard/src'
          ),
          '@': path.resolve(__dirname, './src'),
          // Playwright CT resolves component path from playwright/index.tsx; alias old .story to .ct
          './RosaWizard.story': path.resolve(
            __dirname,
            './src/components/Wizards/RosaWizard/RosaWizard.ct.tsx'
          ),
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
