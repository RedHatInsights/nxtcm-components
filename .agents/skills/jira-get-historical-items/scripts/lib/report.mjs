import { JIRA_SITE } from './constants.mjs';
import { buildCycleTimeData } from './summarize.mjs';

export const REPORT_VERSION = 1;
export { JIRA_SITE };

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
  storyPointsField = DEFAULT_STORY_POINTS_FIELD,
  site = JIRA_SITE,
  maxResults = 100,
  runAt = new Date().toISOString(),
}) {
  const fetched = issues.length;
  return {
    version: REPORT_VERSION,
    runAt,
    jql,
    meta: {
      site,
      storyPointsField,
      counts: {
        fetched,
        included: rows.length,
        skipped: fetched - rows.length,
        maxResults,
        fetchCapHit: fetched >= maxResults,
      },
    },
    items: rows,
    cycleTime: buildCycleTimeData(rows),
  };
}
