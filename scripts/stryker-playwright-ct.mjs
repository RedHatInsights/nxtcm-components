#!/usr/bin/env node
// @ts-check
/**
 * Playwright CT test command for Stryker's command runner.
 *
 * Each mutant gets an isolated CT cache directory and Vite port so a prior
 * mutant's bundle cannot be reused (the main cause of false "survived" results).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const mutantId = process.env.__STRYKER_ACTIVE_MUTANT__ ?? 'dry-run';
const workingDir = process.cwd();

/** @type {{ specs?: string[] } | null} */
let targets = null;
if (process.env.STRYKER_TARGETS) {
  const raw = process.env.STRYKER_TARGETS;
  try {
    targets = JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Malformed STRYKER_TARGETS: ${message}. Raw value: ${raw}`);
  }
}
const specs = targets?.specs ?? [];

if (specs.length === 0) {
  console.error('stryker-playwright-ct: STRYKER_TARGETS.specs is empty.');
  process.exit(1);
}

/** @param {string} value */
function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

const cacheDir = path.join(workingDir, '.stryker-ct-cache', mutantId);
// Unique port per mutant so parallel Stryker workers do not share a Vite server.
const ctPort = 3200 + (hashString(mutantId) % 2000);

// Only clear this mutant's cache — shared dirs must not be deleted while other workers run.
rmSync(cacheDir, { recursive: true, force: true });
mkdirSync(cacheDir, { recursive: true });

if (process.env.STRYKER_CT_DEBUG === '1') {
  console.error(
    `[stryker-playwright-ct] mutant=${mutantId} port=${ctPort} cache=${cacheDir} cwd=${workingDir}`
  );
}

const playwrightBin = path.join(workingDir, 'node_modules', '.bin', 'playwright');
const playwrightExecutable = existsSync(playwrightBin) ? playwrightBin : 'npx';

/** @type {string[]} */
const playwrightArgs =
  playwrightExecutable === playwrightBin
    ? ['test', '-c', 'playwright-ct.config.ts', '--reporter=list', '--workers=1', ...specs]
    : [
        'playwright',
        'test',
        '-c',
        'playwright-ct.config.ts',
        '--reporter=list',
        '--workers=1',
        ...specs,
      ];

const result = spawnSync(playwrightExecutable, playwrightArgs, {
  cwd: workingDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    PLAYWRIGHT_HTML_OPEN: 'never',
    STRYKER_CT_CACHE_DIR: cacheDir,
    STRYKER_CT_PORT: String(ctPort),
  },
});

process.exit(result.status ?? 1);
