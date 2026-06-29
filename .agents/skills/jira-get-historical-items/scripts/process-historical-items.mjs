#!/usr/bin/env node
/**
 * Process fetched Jira issue JSON into historical item rows (no auth).
 *
 * Usage:
 *   node process-historical-items.mjs --input /abs/path/.jira-historical-issues.json
 *   cat issues.json | node process-historical-items.mjs
 *
 * Input: array of Jira issues with changelog (CLI or MCP fetch), or
 *        { "issues": [...] } from searchJiraIssuesUsingJql merged with changelogs.
 */

import { readFileSync, writeFileSync } from 'fs';
import { loadIssuesFromJson } from './lib/load-issues.mjs';
import { resolveInputPath, resolvePath } from './lib/paths.mjs';
import { processHistoricalIssues } from './lib/process.mjs';
import { validateFetchIssues } from './lib/validate-fetch.mjs';

function parseArgs(argv) {
  const opts = {
    input: '',
    output: '',
    storyPointsField: 'customfield_10028',
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const next = argv[i + 1];
    if (a === '--input' || a === '-i') ((opts.input = next), i++);
    else if (a === '--output' || a === '-o') ((opts.output = next), i++);
    else if (a === '--story-points-field') ((opts.storyPointsField = next), i++);
    else if (a === '--help' || a === '-h') {
      console.log(
        'Usage: node process-historical-items.mjs [--input issues.json] [--output rows.json]'
      );
      process.exit(0);
    }
  }

  return opts;
}

function readIssues(opts) {
  const raw = opts.input
    ? readFileSync(resolveInputPath(opts.input), 'utf8')
    : readFileSync(0, 'utf8');
  return validateFetchIssues(JSON.parse(raw));
}

function main() {
  const opts = parseArgs(process.argv);
  const issues = readIssues(opts);
  const rows = processHistoricalIssues(issues, opts.storyPointsField);

  console.error(
    `Processed ${issues.length} issue(s); ${rows.length} with resolution Done (skipped ${issues.length - rows.length}).`
  );

  const json = JSON.stringify(rows, null, 2);
  if (opts.output) {
    const outputPath = resolvePath(opts.output);
    writeFileSync(outputPath, json);
    console.error(`Wrote ${outputPath}`);
  }

  console.log(json);
}

try {
  main();
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
