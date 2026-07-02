import { percentile } from './metrics.mjs';

const CYCLE_TIME_PERCENTILE = 0.75;

const ISSUE_TYPE_SECTIONS = [
  { label: 'STORIES', match: (t) => t === 'story' },
  { label: 'TASKS', match: (t) => t === 'task' },
  { label: 'BUGS', match: (t) => t === 'bug' },
];

const ALL_TYPE_LINES = [
  { label: 'All items', match: () => true },
  { label: 'All stories', match: (t) => t === 'story' },
  { label: 'All bugs', match: (t) => t === 'bug' },
  { label: 'All tasks', match: (t) => t === 'task' },
];

export function hasCycleTime(item) {
  return typeof item.cycleTime === 'number' && !Number.isNaN(item.cycleTime);
}

export function itemsWithCycleTime(items) {
  return items.filter(hasCycleTime);
}

export function percentileCycleTime(items, p = CYCLE_TIME_PERCENTILE) {
  const values = itemsWithCycleTime(items)
    .map((item) => item.cycleTime)
    .sort((a, b) => a - b);
  if (values.length === 0) return null;
  return percentile(values, p);
}

export function closedDateRange(items) {
  const dates = items
    .map((item) => item.completionDate)
    .filter(Boolean)
    .sort((a, b) => new Date(a) - new Date(b));
  if (dates.length === 0) return null;
  return { earliest: dates[0], latest: dates[dates.length - 1] };
}

export function normalizeIssueType(issueType) {
  return String(issueType ?? '')
    .trim()
    .toLowerCase();
}

export function pointSizes(items) {
  const sizes = new Set();
  for (const item of items) {
    if (item.storyPoints === '' || item.storyPoints == null) continue;
    const points = Number(item.storyPoints);
    if (!Number.isNaN(points)) sizes.add(points);
  }
  return [...sizes].sort((a, b) => b - a);
}

export function roundDays(value) {
  if (value == null) return null;
  return Math.round(value * 10) / 10;
}

export function formatDays(value) {
  if (value == null) return '—';
  const rounded = roundDays(value);
  return Number.isInteger(rounded) ? `${rounded} days` : `${rounded.toFixed(1)} days`;
}

function cycleTimeEntry(items, base) {
  const withCycle = itemsWithCycleTime(items);
  const p75 = percentileCycleTime(withCycle);
  if (withCycle.length === 0) return null;
  return { ...base, count: withCycle.length, p75Days: roundDays(p75) };
}

function formatLine(label, items) {
  const withCycle = itemsWithCycleTime(items);
  const p75 = percentileCycleTime(withCycle);
  if (withCycle.length === 0) return null;
  return `${label} (${withCycle.length}): ${formatDays(p75)}`;
}

export function buildSummaryReport(items) {
  const lines = [];
  const range = closedDateRange(items);

  if (range) {
    lines.push(`Closed date range: ${range.earliest} - ${range.latest}`);
  } else {
    lines.push('Closed date range: —');
  }
  lines.push('Cycle time: 75th percentile (business days)');
  lines.push('');

  for (const { label, match } of ALL_TYPE_LINES) {
    const group = items.filter((item) => match(normalizeIssueType(item.issueType)));
    const line = formatLine(label, group);
    if (line) lines.push(line);
  }

  const sizes = pointSizes(items);
  if (sizes.length > 0) {
    lines.push('');
    const pointGroups = buildP75ByStoryPoints(items);
    if (pointGroups.length > 0) {
      lines.push(formatP75ByStoryPoints(pointGroups));
    }
  }

  return lines.join('\n');
}

const ISSUE_TYPE_BY_LABEL = {
  'All stories': 'story',
  'All bugs': 'bug',
  'All tasks': 'task',
};

const SECTION_ISSUE_TYPE = {
  STORIES: 'story',
  TASKS: 'task',
  BUGS: 'bug',
};

export function buildCycleTimeData(items) {
  if (itemsWithCycleTime(items).length === 0) return null;

  const range = closedDateRange(items);
  const percentiles = [];

  for (const { label, match } of ALL_TYPE_LINES) {
    const group = items.filter((item) => match(normalizeIssueType(item.issueType)));
    if (label === 'All items') {
      const entry = cycleTimeEntry(group, { group: 'all', label });
      if (entry) percentiles.push(entry);
      continue;
    }
    const issueType = ISSUE_TYPE_BY_LABEL[label];
    const entry = cycleTimeEntry(group, { group: 'issueType', issueType, label });
    if (entry) percentiles.push(entry);
  }

  const sizes = pointSizes(items);
  for (const points of sizes) {
    const group = items.filter((item) => Number(item.storyPoints) === points);
    const entry = cycleTimeEntry(group, {
      group: 'storyPoints',
      storyPoints: points,
      label: `All ${points} point items`,
    });
    if (entry) percentiles.push(entry);
  }

  for (const { label, match } of ISSUE_TYPE_SECTIONS) {
    const issueType = SECTION_ISSUE_TYPE[label];
    const typeItems = items.filter((item) => match(normalizeIssueType(item.issueType)));
    for (const points of pointSizes(typeItems)) {
      const group = typeItems.filter((item) => Number(item.storyPoints) === points);
      const pointLabel = points === 1 ? '1 point item' : `${points} point items`;
      const entry = cycleTimeEntry(group, {
        group: 'issueTypeAndStoryPoints',
        issueType,
        storyPoints: points,
        label: pointLabel,
      });
      if (entry) percentiles.push(entry);
    }
  }

  return {
    closedDateRange: range ? { earliest: range.earliest, latest: range.latest } : null,
    percentiles,
  };
}

const P75_TYPE_BREAKDOWNS = [
  { key: 'all', label: 'all', match: () => true },
  { key: 'stories', label: 'stories', match: (t) => t === 'story' },
  { key: 'tasks', label: 'tasks', match: (t) => t === 'task' },
  { key: 'bugs', label: 'bugs', match: (t) => t === 'bug' },
];

/**
 * p75 cycle time grouped by story points, with all/stories/tasks/bugs breakdown per size.
 */
export function buildP75ByStoryPoints(items) {
  const groups = [];

  for (const points of pointSizes(items)) {
    const pointItems = items.filter((item) => Number(item.storyPoints) === points);
    const breakdown = {};

    for (const { key, label, match } of P75_TYPE_BREAKDOWNS) {
      const group = pointItems.filter((item) => match(normalizeIssueType(item.issueType)));
      const withCycle = itemsWithCycleTime(group);
      const p75 = percentileCycleTime(withCycle);
      if (withCycle.length === 0) continue;
      breakdown[key] = { label, count: withCycle.length, p75Days: roundDays(p75) };
    }

    if (Object.keys(breakdown).length === 0) continue;

    groups.push({
      storyPoints: points,
      label: points === 1 ? '1 point item' : `${points} point items`,
      breakdown,
    });
  }

  return groups;
}

function formatP75ByStoryPoints(groups) {
  const lines = [];
  for (const group of groups) {
    lines.push(group.label);
    for (const key of ['all', 'stories', 'tasks', 'bugs']) {
      const entry = group.breakdown[key];
      if (!entry) continue;
      lines.push(`  - ${entry.label}: ${entry.p75Days} days`);
    }
    lines.push('');
  }
  return lines.join('\n').trimEnd();
}
