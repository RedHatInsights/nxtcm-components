#!/usr/bin/env node
/**
 * Collect npm package names newly added or version-bumped vs merge base.
 * Usage: BASE=main node scripts/security-changed-packages.js
 * Output: one package name per line (stdout).
 */
const { execSync } = require('child_process');
const fs = require('fs');

const base = process.env.BASE || 'main';

function pkgNameFromLockPath(p) {
  const tail = p
    .replace(/^node_modules\//, '')
    .split('/node_modules/')
    .pop();
  if (tail.startsWith('@')) {
    const [scope, name] = tail.split('/');
    return `${scope}/${name}`;
  }
  return tail.split('/')[0];
}

function readLock(ref) {
  try {
    return JSON.parse(
      execSync(`git show ${ref}:package-lock.json`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
      })
    );
  } catch {
    return { packages: {} };
  }
}

const oldLock = readLock(base);
const newLock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
const changed = new Set();

for (const [path, pkg] of Object.entries(newLock.packages || {})) {
  if (!path.startsWith('node_modules/') || !pkg.version) continue;
  const old = (oldLock.packages || {})[path];
  if (!old || old.version !== pkg.version) changed.add(pkgNameFromLockPath(path));
}

try {
  const diff = execSync(`git diff ${base} -- package.json`, { encoding: 'utf8' });
  for (const line of diff.split('\n')) {
    const m = line.match(/^\+(\s*)"([^"]+)":/);
    if (!m) continue;
    const key = m[2];
    if (
      ![
        'dependencies',
        'devDependencies',
        'peerDependencies',
        'optionalDependencies',
        'overrides',
      ].includes(key)
    ) {
      changed.add(key);
    }
  }
} catch {
  // no package.json diff
}

process.stdout.write([...changed].filter(Boolean).sort().join('\n'));
