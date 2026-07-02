#!/usr/bin/env node
/**
 * Validate fetch JSON, process historical rows, and write a single report JSON.
 *
 * Usage:
 *   node run-historical-report.mjs \
 *     --input /abs/path/.jira-historical-issues.json \
 *     --workspace /abs/path/to/workspace \
 *     --jql 'parent = FCN-41 AND created >= -20d'
 *
 * Writes:
 *   {workspace}/.jira-historical-report.json
 *
 * With --stdout, also prints the full report JSON.
 */

import { runHistoricalReport } from './lib/run-report.mjs';
import { defaultWorkspaceDir, resolveInputPath, resolvePath } from './lib/paths.mjs';

function parseArgs(argv) {
  const opts = {
    input: '',
    workspace: '',
    jql: '',
    reportOutput: '',
    storyPointsField: 'customfield_10028',
    stdout: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--input' || arg === '-i') ((opts.input = next), i++);
    else if (arg === '--workspace' || arg === '-w') ((opts.workspace = next), i++);
    else if (arg === '--jql') ((opts.jql = next), i++);
    else if (arg === '--report-output') ((opts.reportOutput = next), i++);
    else if (arg === '--story-points-field') ((opts.storyPointsField = next), i++);
    else if (arg === '--stdout') opts.stdout = true;
    else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: node run-historical-report.mjs --input ISSUES.json [--workspace DIR] [--jql JQL] [--stdout]

Options:
  --input, -i              Fetch JSON (array of issues with changelog)
  --workspace, -w          Directory for output artifacts (default: input file directory)
  --jql                    JQL used for the search (stored in report)
  --report-output          Override report JSON path
  --stdout                 Print full report JSON to stdout
  --story-points-field     Story points custom field id (default: customfield_10028)`);
      process.exit(0);
    }
  }

  if (!opts.input) {
    throw new Error('Missing required --input path');
  }

  return opts;
}

function main() {
  const opts = parseArgs(process.argv);
  const inputPath = resolveInputPath(opts.input);
  const workspace = opts.workspace ? resolvePath(opts.workspace) : defaultWorkspaceDir(inputPath);

  runHistoricalReport({
    inputPath,
    workspace,
    jql: opts.jql,
    storyPointsField: opts.storyPointsField,
    reportOutput: opts.reportOutput,
    stdout: opts.stdout,
  });
}

try {
  main();
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
