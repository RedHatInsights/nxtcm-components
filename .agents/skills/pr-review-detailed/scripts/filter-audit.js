#!/usr/bin/env node
/**
 * Filter npm audit JSON to advisories affecting changed packages only.
 * Usage: node scripts/filter-audit.js
 * Reads: .security-changed-packages.txt, .security-audit.json
 * Writes: .security-audit-filtered.json
 */
const fs = require('fs');

const changed = new Set(
  fs.readFileSync('.security-changed-packages.txt', 'utf8').trim().split('\n').filter(Boolean)
);
const audit = JSON.parse(fs.readFileSync('.security-audit.json', 'utf8'));
const hits = [];

for (const v of Object.values(audit.vulnerabilities || {})) {
  const names = new Set([v.name, ...(v.effects || [])]);
  for (const via of v.via || []) {
    if (typeof via === 'object' && via.name) names.add(via.name);
  }
  if ([...names].some((n) => changed.has(n))) {
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

fs.writeFileSync(
  '.security-audit-filtered.json',
  JSON.stringify({ changed: [...changed], hits }, null, 2)
);
console.log(
  hits.length
    ? `Found ${hits.length} advisory(ies) on changed packages`
    : 'No advisories on changed packages'
);
