import { buildCycleTimeData } from './summarize.mjs';

export const REPORT_VERSION = 1;
export const JIRA_SITE = 'redhat.atlassian.net';

/**
 * @param {object} options
 * @param {string} options.jql
 * @param {object[]} options.issues Raw fetch issues (for counts)
 * @param {object[]} options.rows Processed historical item rows
 * @param {string} [options.storyPointsField]
 * @param {string} [options.runAt] ISO 8601 timestamp
 */
export function buildHistoricalReport({
  jql = '',
  issues,
  rows,
  storyPointsField = 'customfield_10028',
  runAt = new Date().toISOString(),
}) {
  return {
    version: REPORT_VERSION,
    runAt,
    jql,
    meta: {
      site: JIRA_SITE,
      storyPointsField,
      counts: {
        fetched: issues.length,
        included: rows.length,
        skipped: issues.length - rows.length,
      },
    },
    items: rows,
    cycleTime: buildCycleTimeData(rows),
  };
}
