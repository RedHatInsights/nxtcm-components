#!/usr/bin/env node
/**
 * Summarize 75th-percentile cycle times from historical items or a full report JSON.
 *
 * Usage:
 *   node summarize-cycle-times.mjs --input /abs/path/.jira-historical-report.json
 */

import { readFileSync } from 'fs';
import { buildSummaryReport } from './lib/summarize.mjs';
import { resolveInputPath } from './lib/paths.mjs';

function parseArgs(argv) {
  const opts = { input: '' };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const next = argv[i + 1];
    if (a === '--input' || a === '-i') ((opts.input = next), i++);
    else if (a === '--help' || a === '-h') {
      console.log('Usage: node summarize-cycle-times.mjs --input report-or-items.json');
      process.exit(0);
    }
  }

  if (!opts.input) {
    throw new Error('Missing required --input path');
  }

  return opts;
}

function readItems(opts) {
  const raw = readFileSync(resolveInputPath(opts.input), 'utf8');
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.items)) return parsed.items;
  throw new Error(
    'Expected a JSON array of historical items or a report object with an items array'
  );
}

function main() {
  const opts = parseArgs(process.argv);
  const items = readItems(opts);
  const hasCycleTime = items.some(
    (item) => typeof item.cycleTime === 'number' && !Number.isNaN(item.cycleTime)
  );

  if (!hasCycleTime) {
    console.log('No items with measurable cycle time — summary not produced.');
    return;
  }

  console.log(buildSummaryReport(items));
}

try {
  main();
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
