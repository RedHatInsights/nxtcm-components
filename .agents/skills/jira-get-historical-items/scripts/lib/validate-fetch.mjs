import { loadIssuesFromJson } from './load-issues.mjs';

/**
 * @param {unknown} parsed
 * @returns {object[]}
 */
export function validateFetchIssues(parsed) {
  let issues;
  try {
    issues = loadIssuesFromJson(parsed);
  } catch (err) {
    throw new Error(
      `Expected a JSON array of Jira issues with changelog (or { issues: [...] }). ${err.message}`
    );
  }

  const errors = [];
  for (const issue of issues) {
    const key = issue?.key ?? '(unknown)';
    if (!issue?.key) {
      errors.push('One issue is missing key');
      continue;
    }
    if (!issue.fields) {
      errors.push(`${key}: missing fields`);
    }
    if (!issue.changelog?.histories?.length) {
      errors.push(
        `${key}: missing changelog histories — fetch with expand=changelog (CLI script or MCP getJiraIssue)`
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid fetch JSON:\n- ${errors.join('\n- ')}`);
  }

  return issues;
}
