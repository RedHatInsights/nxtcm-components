#!/usr/bin/env node
// @ts-check
import { existsSync, globSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** @param {string} message */
function printUsage(message) {
  if (message) {
    console.error(message);
    console.error('');
  }

  console.error(`Usage: npm run test:stryker -- <component.tsx> [more-components.tsx ...]

Run mutation testing for one or more components using co-located Playwright CT specs.

Examples:
  npm run test:stryker -- packages/nxtcm-rosa-hcp-wizard/src/Footer/RosaHcpWizardFooter.tsx
  npm run test:stryker -- src/components/Foo/Foo.tsx packages/nxtcm-dashboard/src/Bar/Bar.tsx

Options:
  --report    Include HTML mutation report (same as test:stryker:report)
  --help      Show this help text

Environment:
  STRYKER_CONCURRENCY   Parallel mutant workers (default: min(4, cpuCount - 1))`);
}

/**
 * @param {string} input
 * @returns {string | null}
 */
function resolveComponentPath(input) {
  const candidates = [path.resolve(repoRoot, input), path.isAbsolute(input) ? input : null].filter(
    (value) => value !== null
  );

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  const basename = path.basename(input);
  const matches = globSync(`**/${basename}`, {
    cwd: repoRoot,
    exclude: ['**/node_modules/**', '**/dist/**', '**/.stryker-tmp/**'],
  });

  if (matches.length === 1) {
    return path.resolve(repoRoot, matches[0]);
  }

  if (matches.length > 1) {
    console.warn(
      `Skipping ${input}: found multiple matches. Pass a more specific path:\n  ${matches.join('\n  ')}`
    );
    return null;
  }

  console.warn(`Skipping ${input}: component file not found.`);
  return null;
}

/**
 * @param {string} componentPath
 * @returns {string | null}
 */
function resolveSpecPath(componentPath) {
  if (!componentPath.endsWith('.tsx')) {
    console.warn(`Skipping ${componentPath}: expected a .tsx component file.`);
    return null;
  }

  if (componentPath.endsWith('.spec.tsx')) {
    console.warn(`Skipping ${componentPath}: pass the component file, not the spec file.`);
    return null;
  }

  const specPath = componentPath.replace(/\.tsx$/, '.spec.tsx');

  if (!existsSync(specPath)) {
    console.warn(
      `Skipping ${path.relative(repoRoot, componentPath)}: no spec file at ${path.relative(repoRoot, specPath)}.`
    );
    return null;
  }

  return specPath;
}

/** @param {string[]} argv */
function parseArgs(argv) {
  /** @type {string[]} */
  const componentArgs = [];
  let report = false;

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      printUsage('');
      process.exit(0);
    }

    if (arg === '--report') {
      report = true;
      continue;
    }

    componentArgs.push(arg);
  }

  return { componentArgs, report };
}

const { componentArgs, report } = parseArgs(process.argv.slice(2));

if (componentArgs.length === 0) {
  printUsage('Provide at least one component .tsx file.');
  process.exit(1);
}

/** @type {string[]} */
const components = [];
/** @type {string[]} */
const specs = [];

for (const input of componentArgs) {
  const componentPath = resolveComponentPath(input);

  if (!componentPath) {
    continue;
  }

  const specPath = resolveSpecPath(componentPath);

  if (!specPath) {
    continue;
  }

  components.push(path.relative(repoRoot, componentPath));
  specs.push(path.relative(repoRoot, specPath));
}

if (components.length === 0) {
  console.error('No component/spec pairs to mutate. Nothing to run.');
  process.exit(1);
}

console.log('Mutation targets:');
for (let index = 0; index < components.length; index += 1) {
  console.log(`  ${components[index]}  ->  ${specs[index]}`);
}

/** @type {import('node:child_process').SpawnSyncOptions} */
const spawnOptions = {
  cwd: repoRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    STRYKER_TARGETS: JSON.stringify({ components, specs }),
  },
};

/** @type {string[]} */
const strykerArgs = ['run'];

if (report) {
  strykerArgs.push('--reporters', 'html,clear-text,progress');
}

const strykerBin = path.join(repoRoot, 'node_modules', '.bin', 'stryker');
if (!existsSync(strykerBin)) {
  console.error(`Stryker binary not found at ${strykerBin} (repo root: ${repoRoot})`);
  process.exit(1);
}

const result = spawnSync(strykerBin, strykerArgs, spawnOptions);

process.exit(result.status ?? 1);
