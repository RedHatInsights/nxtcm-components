import { DEFAULT_STORY_POINTS_FIELD } from './constants.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, resolve, sep, dirname } from 'path';
import { processHistoricalIssues } from './process.mjs';
import { buildHistoricalReport } from './report.mjs';
import { buildSummaryReport } from './summarize.mjs';
import { defaultWorkspaceDir, resolvePath } from './paths.mjs';
import { validateFetchIssues } from './validate-fetch.mjs';

function assertPathWithinWorkspace(resolvedPath, workspaceDir) {
  const workspaceRoot = resolve(workspaceDir);
  const target = resolve(resolvedPath);
  const prefix = workspaceRoot.endsWith(sep) ? workspaceRoot : `${workspaceRoot}${sep}`;
  if (target !== workspaceRoot && !target.startsWith(prefix)) {
    throw new Error(`Report output must stay within workspace: ${workspaceRoot}`);
  }
}

/**
 * @param {object} options
 * @param {string} options.inputPath Resolved absolute path to fetch JSON
 * @param {string} [options.workspace] Workspace directory for report output
 * @param {string} [options.jql]
 * @param {string} [options.storyPointsField]
 * @param {string} [options.reportOutput]
 * @param {boolean} [options.stdout]
 * @param {string} [options.site]
 * @param {number} [options.maxResults]
 * @param {object[]} [options.issues] Pre-validated issues (skips read/parse when set)
 * @returns {{ reportPath: string, report: object, issues: object[], rows: object[] }}
 */
export function runHistoricalReport({
  inputPath,
  workspace,
  jql = '',
  storyPointsField = DEFAULT_STORY_POINTS_FIELD,
  site,
  maxResults = 100,
  reportOutput,
  stdout = false,
  issues: issuesOverride,
}) {
  const workspaceDir = workspace ? resolvePath(workspace) : defaultWorkspaceDir(inputPath);

  const reportPath = reportOutput
    ? resolvePath(reportOutput, workspaceDir)
    : join(workspaceDir, '.jira-historical-report.json');

  assertPathWithinWorkspace(reportPath, workspaceDir);

  const issues = issuesOverride ?? validateFetchIssues(JSON.parse(readFileSync(inputPath, 'utf8')));
  const rows = processHistoricalIssues(issues, storyPointsField);
  const report = buildHistoricalReport({
    jql,
    issues,
    rows,
    storyPointsField,
    site,
    maxResults,
  });

  const reportJson = JSON.stringify(report, null, 2);
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, reportJson);

  console.error(
    `Processed ${issues.length} issue(s); ${rows.length} with resolution Done (skipped ${issues.length - rows.length}).`
  );
  console.error(`Wrote ${reportPath}`);

  if (stdout) {
    console.log(reportJson);
    console.log('---CYCLE_TIME_SUMMARY---');
    if (report.cycleTime) {
      console.log(buildSummaryReport(rows));
    } else {
      console.log('No items with measurable cycle time — summary not produced.');
    }
  }

  return { reportPath, report, issues, rows };
}
