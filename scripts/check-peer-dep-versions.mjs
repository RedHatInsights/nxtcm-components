#!/usr/bin/env node

/**
 * compares peerDependency versions in workspace packages against the root
 * package.json. exits with code 1 if any shared dep has a different version
 * range than what the root declares.
 *
 * source of truth: root peerDependencies + devDependencies.
 * only checks deps that exist in BOTH root and workspace peerDependencies.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const rootPkg = JSON.parse(readFileSync('package.json', 'utf8'));
const rootVersions = {
  ...rootPkg.peerDependencies,
  ...rootPkg.devDependencies,
};

const workspaces = rootPkg.workspaces || [];
const errors = [];

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
