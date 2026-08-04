#!/usr/bin/env node
/**
 * Filter npm audit JSON to advisories affecting changed packages only.
 * Usage: node scripts/filter-audit.js (must be run from the repository root)
 * Reads: .security-changed-packages.txt, .security-audit.json
 * Writes: .security-audit-filtered.json
 */
const fs = require('fs');

const CHANGED_FILE = '.security-changed-packages.txt';
const AUDIT_FILE = '.security-audit.json';
const OUTPUT_FILE = '.security-audit-filtered.json';

function writeFiltered(payload) {
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(payload, null, 2));
}

function readChangedPackages() {
  if (!fs.existsSync(CHANGED_FILE)) {
    return [];
  }
  return fs.readFileSync(CHANGED_FILE, 'utf8').trim().split('\n').filter(Boolean);
}

const changed = readChangedPackages();

if (changed.length === 0) {
  writeFiltered({ changed: [], hits: [] });
  console.log('No changed packages; skipping audit filter');
  process.exit(0);
}

const changedSet = new Set(changed);

if (!fs.existsSync(AUDIT_FILE)) {
  writeFiltered({
    changed,
    hits: [],
    auditStatus: 'skipped',
    reason: '.security-audit.json not found (audit may have failed to run)',
  });
  console.log('Audit output missing; wrote empty filtered results (audit skipped)');
  process.exit(0);
}

let audit;
try {
  audit = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8'));
} catch {
  writeFiltered({
    changed,
    hits: [],
    auditStatus: 'skipped',
    reason: '.security-audit.json is empty or invalid (audit may have failed to run)',
  });
  console.log('Audit output invalid; wrote empty filtered results (audit skipped)');
  process.exit(0);
}

const hits = [];

for (const v of Object.values(audit.vulnerabilities || {})) {
  const names = new Set([v.name, ...(v.effects || [])]);
  for (const via of v.via || []) {
    if (typeof via === 'object' && via.name) names.add(via.name);
  }
  if ([...names].some((n) => changedSet.has(n))) {
    hits.push({
      name: v.name,
      severity: v.severity,
      range: v.range,
      via: v.via,
      effects: v.effects,
      isDirect: v.isDirect,
    });
  }
}

hits.sort((a, b) => {
  const rank = { critical: 0, high: 1, moderate: 2, low: 3, info: 4 };
  return (rank[a.severity] ?? 9) - (rank[b.severity] ?? 9);
});

writeFiltered({ changed, hits });
console.log(
  hits.length
    ? `Found ${hits.length} advisory(ies) on changed packages`
    : 'No advisories on changed packages'
);
