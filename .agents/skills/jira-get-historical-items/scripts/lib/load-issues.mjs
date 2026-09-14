import { readFileSync } from 'fs';

/**
 * Normalize CLI, MCP, or REST issue JSON into an array of issue objects.
 */
export function loadIssuesFromJson(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.issues)) return parsed.issues;
  if (parsed?.key && parsed?.fields) return [parsed];
  throw new Error(
    'Expected a JSON array of Jira issues, { issues: [...] }, or a single issue object'
  );
}

export function readIssuesFromPath(path) {
  return loadIssuesFromJson(JSON.parse(readFileSync(path, 'utf8')));
}
