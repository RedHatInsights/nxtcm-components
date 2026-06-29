#!/usr/bin/env node
/**
 * Build a human-readable stats summary from `.jira-historical-report.json`.
 *
 * Usage:
 *   node summarize-report-stats.mjs --input /abs/path/.jira-historical-report.json
 *   node summarize-report-stats.mjs --input report.json --issues-input issues.json --output stats.json
 *   node summarize-report-stats.mjs --input report.json --stdout
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { buildReportStats, formatStatsReport } from './lib/stats.mjs';
import { defaultWorkspaceDir, resolveInputPath, resolvePath } from './lib/paths.mjs';

function parseArgs(argv) {
  const opts = {
    input: '',
    issuesInput: '',
    output: '',
    stdout: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--input' || arg === '-i') ((opts.input = next), i++);
    else if (arg === '--issues-input') ((opts.issuesInput = next), i++);
    else if (arg === '--output' || arg === '-o') ((opts.output = next), i++);
    else if (arg === '--stdout') opts.stdout = true;
    else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: node summarize-report-stats.mjs --input REPORT.json [options]

Options:
  --input, -i           Path to .jira-historical-report.json (required)
  --issues-input        Path to .jira-historical-issues.json for Jira created dates
  --output, -o          Write stats JSON to this path (default: {workspace}/.jira-historical-stats.json)
  --stdout              Print markdown summary to stdout (JSON still written unless --output /dev/null)
  --help, -h            Show this help`);
      process.exit(0);
    }
  }

  if (!opts.input) {
    throw new Error('Missing required --input path');
  }

  return opts;
}

function readJson(pathValue) {
  return JSON.parse(readFileSync(resolveInputPath(pathValue), 'utf8'));
}

function main() {
  const opts = parseArgs(process.argv);
  const inputPath = resolveInputPath(opts.input);
  const workspace = defaultWorkspaceDir(inputPath);
  const report = readJson(inputPath);

  let rawIssues = null;
  if (opts.issuesInput) {
    rawIssues = readJson(opts.issuesInput);
  } else {
    const siblingIssues = join(workspace, '.jira-historical-issues.json');
    try {
      rawIssues = readJson(siblingIssues);
    } catch {
      // Optional — created date range omitted when fetch file is absent
    }
  }

  const stats = buildReportStats(report, rawIssues);
  const outputPath = opts.output
    ? resolvePath(opts.output, workspace)
    : join(workspace, '.jira-historical-stats.json');

  writeFileSync(outputPath, `${JSON.stringify(stats, null, 2)}\n`);
  console.error(`Wrote ${outputPath}`);

  if (opts.stdout) {
    console.log(formatStatsReport(stats));
  }
}

try {
  main();
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
