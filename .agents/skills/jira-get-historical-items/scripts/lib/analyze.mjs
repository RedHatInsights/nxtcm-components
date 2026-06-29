import { businessDaysBetween, formatDate, parseDate, plainDescription } from './metrics.mjs';

const DONE_RESOLUTION = 'Done';

/**
 * @param {object} issue Jira issue with fields + changelog
 * @returns {object|null} Output row, or null when resolution is not Done
 */
export function analyzeHistoricalItem(issue, storyPointsFieldId = 'customfield_10028') {
  const resolutionName = issue.fields?.resolution?.name ?? '';
  if (resolutionName !== DONE_RESOLUTION) return null;

  const key = issue.key;
  const summary = issue.fields?.summary ?? '';
  const description = plainDescription(issue.fields?.description);
  const statusName = issue.fields?.status?.name ?? '';
  const isClosed = statusName === 'Closed';

  const histories = [...(issue.changelog?.histories ?? [])].sort(
    (a, b) => new Date(a.created) - new Date(b.created)
  );

  let startDate = null;
  let completionDate = null;

  for (const h of histories) {
    for (const item of h.items ?? []) {
      if (item.field !== 'status') continue;
      if (item.fromString === 'To Do' && item.toString && item.toString !== 'To Do') {
        const d = parseDate(h.created);
        if (!startDate || d < startDate) startDate = d;
      }
      if (item.toString === 'Closed') {
        const d = parseDate(h.created);
        if (!completionDate || d > completionDate) completionDate = d;
      }
    }
  }

  const issueType = issue.fields?.issuetype?.name ?? '';
  const rawPoints = issue.fields?.[storyPointsFieldId] ?? issue.fields?.storyPoints;
  const storyPoints =
    rawPoints === null || rawPoints === undefined || rawPoints === '' ? '' : Number(rawPoints);

  const row = {
    key,
    summary,
    description,
    issueType,
    storyPoints,
    startDate: formatDate(startDate),
    completionDate: isClosed ? formatDate(completionDate) : '',
  };

  if (isClosed) {
    let cycleTime = '';
    if (startDate && completionDate) {
      cycleTime = businessDaysBetween(startDate, completionDate);
    }
    row.cycleTime = cycleTime;
  }

  return row;
}
