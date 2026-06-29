#!/usr/bin/env node
/**
 * Fetch Jira issues with changelog via REST API.
 * Writes the same JSON shape as MCP getJiraIssue (array of { key, fields, changelog }).
 * By default also runs the report pipeline → .jira-historical-report.json
 *
 * Usage:
 *   JIRA_EMAIL=user@example.com JIRA_API_TOKEN=... \
 *   node fetch-historical-items.mjs \
 *     --jql 'parent = FCN-41 AND created >= -20d' \
 *     --output /abs/path/.jira-historical-issues.json
 */

import { writeFileSync } from 'fs';
import { resolveJiraAuth } from './lib/jira-auth.mjs';
import {
  buildFieldList,
  fetchIssueWithChangelog,
  mapPool,
  searchIssueKeys,
} from './lib/jira-fetch.mjs';
import { defaultWorkspaceDir, resolvePath } from './lib/paths.mjs';
import { runHistoricalReport } from './lib/run-report.mjs';
import { validateFetchIssues } from './lib/validate-fetch.mjs';

function parseArgs(argv) {
  const opts = {
    jql: '',
    output: '',
    site: '',
    email: '',
    token: '',
    envFile: '',
    storyPointsField: 'customfield_10028',
    concurrency: 10,
    maxResults: 100,
    workspace: '',
    skipReport: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--jql') ((opts.jql = next), i++);
    else if (arg === '--output' || arg === '-o') ((opts.output = next), i++);
    else if (arg === '--site') ((opts.site = next), i++);
    else if (arg === '--email') ((opts.email = next), i++);
    else if (arg === '--token') ((opts.token = next), i++);
    else if (arg === '--env-file') ((opts.envFile = next), i++);
    else if (arg === '--story-points-field') ((opts.storyPointsField = next), i++);
    else if (arg === '--concurrency') ((opts.concurrency = Number(next)), i++);
    else if (arg === '--max-results') ((opts.maxResults = Number(next)), i++);
    else if (arg === '--workspace' || arg === '-w') ((opts.workspace = next), i++);
    else if (arg === '--skip-report') opts.skipReport = true;
    else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: node fetch-historical-items.mjs --jql 'JQL' --output /abs/path/.jira-historical-issues.json

Auth:
  --env-file PATH                     .env file (JIRA_EMAIL, JIRA_API_TOKEN, optional JIRA_SITE)
  JIRA_EMAIL / JIRA_API_TOKEN         Environment variables
  --email / --token / --site          Inline overrides (prefer --env-file for tokens)

Options:
  --jql                    JQL query (required)
  --output, -o             Output JSON path (required; use absolute path)
  --story-points-field     Story points field id (default: customfield_10028)
  --concurrency            Parallel issue fetches (default: 10)
  --max-results            Max issues to fetch (default: 100)
  --workspace, -w          Workspace for report output (default: output file directory)
  --skip-report            Fetch only; do not write .jira-historical-report.json`);
      process.exit(0);
    }
  }

  if (!opts.jql) throw new Error('Missing required --jql');
  if (!opts.output) throw new Error('Missing required --output');

  return opts;
}

async function main() {
  const opts = parseArgs(process.argv);
  const auth = resolveJiraAuth({
    site: opts.site,
    email: opts.email,
    token: opts.token,
    envFile: opts.envFile,
  });
  const fields = buildFieldList(opts.storyPointsField);
  const outputPath = resolvePath(opts.output);
  const workspace = opts.workspace ? resolvePath(opts.workspace) : defaultWorkspaceDir(outputPath);

  console.error(`Site: ${auth.site}`);
  console.error(`JQL: ${opts.jql}`);

  const keys = await searchIssueKeys(auth, opts.jql, fields, opts.maxResults);
  console.error(`Matched ${keys.length} issue(s).`);

  let issues = [];

  if (keys.length === 0) {
    writeFileSync(outputPath, '[]\n');
    console.error(`Wrote empty array to ${outputPath}`);
  } else {
    issues = await mapPool(keys, opts.concurrency, async (key, index) => {
      const issue = await fetchIssueWithChangelog(auth, key, fields);
      console.error(`Fetched ${index + 1}/${keys.length}: ${key}`);
      return issue;
    });

    validateFetchIssues(issues);

    const json = JSON.stringify(issues, null, 2);
    writeFileSync(outputPath, json);
    console.error(`Wrote ${issues.length} issue(s) to ${outputPath}`);
  }

  if (!opts.skipReport) {
    runHistoricalReport({
      inputPath: outputPath,
      workspace,
      jql: opts.jql,
      storyPointsField: opts.storyPointsField,
      issues,
    });
  }
}

try {
  await main();
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
