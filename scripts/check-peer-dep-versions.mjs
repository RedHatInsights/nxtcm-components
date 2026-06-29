#!/usr/bin/env node

/**
 * compares peerDependency versions in workspace packages against the root
 * package.json. exits with code 1 if any shared dep has a different version
 * range than what the root declares.
 *
 * validation steps:
 *   1. check root internal consistency: peerDependencies vs devDependencies
 *   2. compare workspace peerDependencies against root peerDependencies
 *
 * source of truth for workspace comparison (merge order, last wins):
 *   1. root dependencies
 *   2. root devDependencies
 *   3. root peerDependencies (takes precedence - this is the public contract)
 *
 * rationale: if root declares a peerDependency, that's what workspaces AND
 * consuming apps must satisfy. root devDependencies should match peerDeps
 * to ensure we develop against the same versions we ask consumers to provide.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const rootPkg = JSON.parse(readFileSync('package.json', 'utf8'));
const errors = [];

// Step 1: Check root internal consistency (peer vs dev)
const peerDeps = rootPkg.peerDependencies || {};
const devDeps = rootPkg.devDependencies || {};

for (const [dep, peerVersion] of Object.entries(peerDeps)) {
  if (devDeps[dep] && devDeps[dep] !== peerVersion) {
    errors.push(
      `  root: ${dep} is "${peerVersion}" in peerDependencies but "${devDeps[dep]}" in devDependencies`
    );
  }
}

if (errors.length > 0) {
  console.error('Root peer/dev dependency version mismatch detected:\n');
  console.error(errors.join('\n'));
  console.error('\nUpdate root package.json so peerDependencies and devDependencies match.');
  console.error(
    'We develop against devDependencies but ask consumers to satisfy peerDependencies.'
  );
  process.exit(1);
}

// Step 2: Build source of truth (peerDependencies take precedence)
const rootVersions = {
  ...rootPkg.dependencies,
  ...rootPkg.devDependencies,
  ...rootPkg.peerDependencies,
};

const workspaces = rootPkg.workspaces || [];
errors.length = 0; // reset for workspace checks

for (const wsPath of workspaces) {
  const pkgPath = join(wsPath, 'package.json');
  let wsPkg;

  try {
    wsPkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  } catch (err) {
    console.warn(`  warning: could not read ${pkgPath} (${err.message})`);
    errors.push(`  ${wsPath}: package.json is unreadable or missing`);
    continue;
  }

  const peerDeps = wsPkg.peerDependencies;
  if (!peerDeps) continue;

  for (const [dep, version] of Object.entries(peerDeps)) {
    if (rootVersions[dep] && rootVersions[dep] !== version) {
      errors.push(`  ${wsPath}: ${dep} is "${version}" but root has "${rootVersions[dep]}"`);
    }
  }
}

if (errors.length > 0) {
  console.error('Peer dependency version mismatch detected:\n');
  console.error(errors.join('\n'));
  console.error('\nUpdate workspace peerDependencies to match the root package.json.');
  process.exit(1);
} else {
  console.log('Peer dependency versions are consistent across all workspaces.');
}
