// @ts-check
import os from 'node:os';

/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */

/**
 * Playwright CT mutation testing.
 *
 * Target components via:
 *   npm run test:stryker -- path/to/Component.tsx [more...]
 *
 * The runner script sets STRYKER_TARGETS with co-located *.spec.tsx files.
 * Tests execute through scripts/stryker-playwright-ct.mjs (per-mutant cache + port).
 * playwright/index.tsx mirrors __STRYKER_ACTIVE_MUTANT__ into the browser bundle.
 */
/** @type {{ components: string[]; specs: string[] } | null} */
const targets = process.env.STRYKER_TARGETS ? JSON.parse(process.env.STRYKER_TARGETS) : null;

if (!targets?.components.length || !targets.specs.length) {
  throw new Error(
    'No mutation targets configured. Run: npm run test:stryker -- <component.tsx> [more...]'
  );
}

const cpuCount = os.availableParallelism?.() ?? os.cpus().length;
const defaultConcurrency = Math.min(4, Math.max(1, cpuCount - 1));
const concurrency = process.env.STRYKER_CONCURRENCY
  ? Number(process.env.STRYKER_CONCURRENCY)
  : defaultConcurrency;

if (!Number.isFinite(concurrency) || concurrency < 1) {
  throw new Error('STRYKER_CONCURRENCY must be a positive number.');
}

/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  packageManager: 'npm',
  testRunner: 'command',
  commandRunner: {
    command: 'node scripts/stryker-playwright-ct.mjs',
  },
  coverageAnalysis: 'off',
  timeoutMS: 180_000,
  timeoutFactor: 2,
  // Each worker runs Playwright CT + Chromium; capped at 4 to limit RAM use.
  concurrency,
  incremental: false,
  reporters: ['clear-text', 'progress'],
  mutate: targets.components,
  mutator: {
    excludedMutations: ['StringLiteral', 'Regex', 'ObjectLiteral'],
  },
};

export default config;
