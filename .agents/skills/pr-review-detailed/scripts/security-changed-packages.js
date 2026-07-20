#!/usr/bin/env node
/**
 * Collect npm package names newly added or version-bumped vs merge base.
 * Usage: BASE=main node scripts/security-changed-packages.js
 * Output: one package name per line (stdout).
 */
const { execFileSync } = require('child_process');
const fs = require('fs');

const SAFE_GIT_REF = /^[-\w./]+$/;

function assertSafeGitRef(ref) {
  if (!SAFE_GIT_REF.test(ref)) {
    throw new Error(`Invalid git ref: ${ref}`);
  }
}

const base = process.env.BASE || 'main';
assertSafeGitRef(base);

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

const DEP_SECTIONS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
  'overrides',
];

function readPackageJson(ref) {
  assertSafeGitRef(ref);
  try {
    return JSON.parse(
      execFileSync('git', ['show', `${ref}:package.json`], {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
      })
    );
  } catch {
    return {};
  }
}

function flattenOverrides(overrides, out = {}) {
  for (const [name, value] of Object.entries(overrides || {})) {
    if (typeof value === 'string') {
      out[name] = value;
    } else if (value && typeof value === 'object') {
      flattenOverrides(value, out);
    }
  }
  return out;
}

function depSectionEntries(pkg, section) {
  if (section === 'overrides') {
    return flattenOverrides(pkg.overrides);
  }
  return pkg[section] || {};
}

function addChangedManifestDeps(basePkg, headPkg) {
  for (const section of DEP_SECTIONS) {
    const baseDeps = depSectionEntries(basePkg, section);
    const headDeps = depSectionEntries(headPkg, section);
    for (const [name, version] of Object.entries(headDeps)) {
      if (typeof version !== 'string') continue;
      if (baseDeps[name] !== version) changed.add(name);
    }
  }
}
function readLock(ref) {
  assertSafeGitRef(ref);
  try {
    return JSON.parse(
      execFileSync('git', ['show', `${ref}:package-lock.json`], {
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

addChangedManifestDeps(readPackageJson(base), JSON.parse(fs.readFileSync('package.json', 'utf8')));

process.stdout.write([...changed].filter(Boolean).sort().join('\n'));
