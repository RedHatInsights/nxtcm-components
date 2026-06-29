import { analyzeHistoricalItem } from './analyze.mjs';

export function processHistoricalIssues(issues, storyPointsFieldId = 'customfield_10028') {
  const rows = issues
    .map((issue) => analyzeHistoricalItem(issue, storyPointsFieldId))
    .filter(Boolean);

  rows.sort((a, b) => {
    const na = Number(a.key.split('-')[1]);
    const nb = Number(b.key.split('-')[1]);
    return na - nb;
  });

  return rows;
}
