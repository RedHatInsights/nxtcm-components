import { DEFAULT_STORY_POINTS_FIELD } from './constants.mjs';
import { analyzeHistoricalItem } from './analyze.mjs';

export function processHistoricalIssues(issues, storyPointsFieldId = DEFAULT_STORY_POINTS_FIELD) {
  const rows = issues
    .map((issue) => analyzeHistoricalItem(issue, storyPointsFieldId))
    .filter(Boolean);

  rows.sort((a, b) => {
    const na = Number(a.key.split('-').pop());
    const nb = Number(b.key.split('-').pop());
    if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) return na - nb;
    return a.key.localeCompare(b.key);
  });

  return rows;
}
