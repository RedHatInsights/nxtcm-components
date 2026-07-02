import { percentile } from './metrics.mjs';
import {
  buildCycleTimeData,
  buildP75ByStoryPoints,
  hasCycleTime,
  itemsWithCycleTime,
  normalizeIssueType,
  pointSizes,
  roundDays,
} from './summarize.mjs';

const JIRA_SITE = 'redhat.atlassian.net';
const FETCH_CAP = 100;

const CYCLE_TIME_BUCKETS = [
  { label: '0–3 days', min: 0, max: 3 },
  { label: '4–7 days', min: 4, max: 7 },
  { label: '8–14 days', min: 8, max: 14 },
  { label: '15+ days', min: 15, max: Infinity },
];

function dateRangeFrom(values) {
  const dates = values.filter(Boolean).sort();
  if (dates.length === 0) return null;
  return { earliest: dates[0], latest: dates[dates.length - 1] };
}

function formatDateOnly(iso) {
  if (!iso) return '';
  return String(iso).slice(0, 10);
}

function isPointed(item) {
  const points = item.storyPoints;
  return points !== '' && points != null && !Number.isNaN(Number(points));
}

function cycleTimeValues(items) {
  return itemsWithCycleTime(items)
    .map((item) => item.cycleTime)
    .sort((a, b) => a - b);
}

function distributionStats(items) {
  const values = cycleTimeValues(items);
  if (values.length === 0) return null;
  return {
    count: values.length,
    min: roundDays(values[0]),
    p50: roundDays(percentile(values, 0.5)),
    p75: roundDays(percentile(values, 0.75)),
    p90: roundDays(percentile(values, 0.9)),
    max: roundDays(values[values.length - 1]),
  };
}

function bucketCounts(items) {
  const withCycle = itemsWithCycleTime(items);
  return CYCLE_TIME_BUCKETS.map(({ label, min, max }) => ({
    label,
    count: withCycle.filter((item) => item.cycleTime >= min && item.cycleTime <= max).length,
  })).filter((bucket) => bucket.count > 0);
}

function countByType(items) {
  const counts = {};
  for (const item of items) {
    const type = item.issueType || 'Unknown';
    counts[type] = (counts[type] ?? 0) + 1;
  }
  return counts;
}

function countMatrix(items) {
  const rows = new Map();
  for (const item of items) {
    const type = item.issueType || 'Unknown';
    const points = isPointed(item) ? Number(item.storyPoints) : 'unpointed';
    const key = `${type}\0${points}`;
    rows.set(key, (rows.get(key) ?? 0) + 1);
  }

  return [...rows.entries()]
    .map(([key, count]) => {
      const [issueType, pointsRaw] = key.split('\0');
      return {
        issueType,
        storyPoints: pointsRaw === 'unpointed' ? null : Number(pointsRaw),
        count,
      };
    })
    .sort((a, b) => {
      const typeCmp = a.issueType.localeCompare(b.issueType);
      if (typeCmp !== 0) return typeCmp;
      if (a.storyPoints == null) return 1;
      if (b.storyPoints == null) return -1;
      return a.storyPoints - b.storyPoints;
    });
}

function pointDistribution(items) {
  const pointed = items.filter(isPointed);
  const total = pointed.length;
  if (total === 0) return [];

  const counts = new Map();
  for (const item of pointed) {
    const points = Number(item.storyPoints);
    counts.set(points, (counts.get(points) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(([a], [b]) => a - b)
    .map(([storyPoints, count]) => ({
      storyPoints,
      count,
      percent: Math.round((count / total) * 1000) / 10,
    }));
}

function throughputByMonth(items) {
  const months = new Map();
  for (const item of items) {
    const month = item.completionDate?.slice(0, 7);
    if (!month) continue;
    const entry = months.get(month) ?? { month, closedCount: 0, storyPoints: 0 };
    entry.closedCount += 1;
    if (isPointed(item)) entry.storyPoints += Number(item.storyPoints);
    months.set(month, entry);
  }
  return [...months.values()].sort((a, b) => a.month.localeCompare(b.month));
}

function p75ForItem(item, reportCycleTime) {
  const type = normalizeIssueType(item.issueType);
  const points = isPointed(item) ? Number(item.storyPoints) : null;
  const percentiles = reportCycleTime?.percentiles ?? [];

  if (points != null) {
    const exact = percentiles.find(
      (entry) =>
        entry.group === 'issueTypeAndStoryPoints' &&
        entry.issueType === type &&
        entry.storyPoints === points
    );
    if (exact?.p75Days != null) return exact.p75Days;

    const byPoints = percentiles.find(
      (entry) => entry.group === 'storyPoints' && entry.storyPoints === points
    );
    if (byPoints?.p75Days != null) return byPoints.p75Days;
  }

  const byType = percentiles.find(
    (entry) => entry.group === 'issueType' && entry.issueType === type
  );
  if (byType?.p75Days != null) return byType.p75Days;

  const all = percentiles.find((entry) => entry.group === 'all');
  return all?.p75Days ?? null;
}

function findOutliers(items, reportCycleTime) {
  const outliers = [];
  for (const item of items) {
    if (!hasCycleTime(item)) continue;
    const p75 = p75ForItem(item, reportCycleTime);
    if (p75 == null || p75 <= 0) continue;
    if (item.cycleTime <= p75 * 1.5) continue;

    outliers.push({
      key: item.key,
      summary: item.summary,
      issueType: item.issueType,
      storyPoints: isPointed(item) ? Number(item.storyPoints) : null,
      cycleTime: item.cycleTime,
      p75Days: p75,
      ratio: Math.round((item.cycleTime / p75) * 10) / 10,
    });
  }

  return outliers.sort((a, b) => b.ratio - a.ratio);
}

function buildCreatedDateMap(issues) {
  const map = new Map();
  if (!Array.isArray(issues)) return map;

  for (const issue of issues) {
    let created = formatDateOnly(issue.fields?.created);
    if (!created && issue.changelog?.histories?.length) {
      const sorted = [...issue.changelog.histories].sort(
        (a, b) => new Date(a.created) - new Date(b.created)
      );
      created = formatDateOnly(sorted[0]?.created);
    }
    if (issue.key && created) map.set(issue.key, created);
  }
  return map;
}

function buildItemRows(items, report, createdByKey) {
  const site = report.meta?.site ?? JIRA_SITE;
  const outliers = new Set(findOutliers(items, report.cycleTime).map((row) => row.key));

  return items.map((item) => ({
    key: item.key,
    summary: item.summary,
    issueType: item.issueType,
    created: createdByKey.get(item.key) ?? '',
    startDate: item.startDate ?? '',
    completionDate: item.completionDate ?? '',
    cycleTime: hasCycleTime(item) ? item.cycleTime : null,
    storyPoints: isPointed(item) ? Number(item.storyPoints) : null,
    outlier: outliers.has(item.key),
    jiraUrl: `https://${site}/browse/${item.key}`,
  }));
}

/**
 * @param {object} report Parsed `.jira-historical-report.json`
 * @param {object[]|null} [rawIssues] Optional fetch JSON for Jira `created` dates
 */
export function buildReportStats(report, rawIssues = null) {
  const items = report.items ?? [];
  const createdByKey = buildCreatedDateMap(rawIssues);
  const createdDates = items.map((item) => createdByKey.get(item.key)).filter(Boolean);
  const startDates = items.map((item) => item.startDate).filter(Boolean);
  const completionDates = items.map((item) => item.completionDate).filter(Boolean);
  const fetched = report.meta?.counts?.fetched ?? items.length;

  const cycleTimeFromReport = report.cycleTime ?? buildCycleTimeData(items);
  const distributionByType = {};
  for (const type of new Set(items.map((item) => item.issueType || 'Unknown'))) {
    const group = items.filter((item) => (item.issueType || 'Unknown') === type);
    const stats = distributionStats(group);
    if (stats) distributionByType[type] = stats;
  }

  const distributionByPoints = {};
  for (const points of pointSizes(items)) {
    const group = items.filter((item) => Number(item.storyPoints) === points);
    const stats = distributionStats(group);
    if (stats) distributionByPoints[points] = stats;
  }

  return {
    version: 1,
    runAt: new Date().toISOString(),
    scope: {
      jql: report.jql ?? '',
      reportRunAt: report.runAt ?? '',
      site: report.meta?.site ?? JIRA_SITE,
      storyPointsField: report.meta?.storyPointsField ?? 'customfield_10028',
    },
    counts: {
      fetched,
      included: report.meta?.counts?.included ?? items.length,
      skipped: report.meta?.counts?.skipped ?? 0,
      inReport: items.length,
      fetchCapWarning:
        report.meta?.counts?.fetchCapHit ??
        fetched >= (report.meta?.counts?.maxResults ?? FETCH_CAP),
    },
    dateRanges: {
      created: dateRangeFrom(createdDates),
      workStarted: dateRangeFrom(startDates),
      closed: dateRangeFrom(completionDates),
    },
    issueCounts: {
      total: items.length,
      byType: countByType(items),
      byTypeAndPoints: countMatrix(items),
      unpointed: items.filter((item) => !isPointed(item)).length,
      pointed: items.filter(isPointed).length,
    },
    cycleTime: {
      closedDateRange: cycleTimeFromReport?.closedDateRange ?? null,
      percentiles: cycleTimeFromReport?.percentiles ?? [],
      p75ByStoryPoints: buildP75ByStoryPoints(items),
      distribution: {
        all: distributionStats(items),
        byType: distributionByType,
        byPoints: distributionByPoints,
      },
      buckets: bucketCounts(items),
    },
    throughput: {
      byMonth: throughputByMonth(items),
      totalStoryPoints: items
        .filter(isPointed)
        .reduce((sum, item) => sum + Number(item.storyPoints), 0),
    },
    dataQuality: {
      missingStartDate: items.filter((item) => !item.startDate).length,
      missingCompletionDate: items.filter((item) => !item.completionDate).length,
      missingCycleTime: items.filter((item) => !hasCycleTime(item)).length,
      unpointed: items.filter((item) => !isPointed(item)).length,
      hasCreatedDates: createdDates.length > 0,
    },
    pointDistribution: pointDistribution(items),
    outliers: findOutliers(items, cycleTimeFromReport),
    items: buildItemRows(items, report, createdByKey),
  };
}

function formatDistribution(label, stats) {
  if (!stats) return null;
  return `${label} (${stats.count}): min ${stats.min}, p50 ${stats.p50}, p75 ${stats.p75}, p90 ${stats.p90}, max ${stats.max} days`;
}

function formatRange(label, range) {
  if (!range) return `${label}: —`;
  return `${label}: ${range.earliest} – ${range.latest}`;
}

function formatMatrix(byTypeAndPoints) {
  const types = [...new Set(byTypeAndPoints.map((row) => row.issueType))].sort();
  const pointCols = [
    ...new Set(
      byTypeAndPoints.map((row) =>
        row.storyPoints == null ? 'unpointed' : String(row.storyPoints)
      )
    ),
  ].sort((a, b) => {
    if (a === 'unpointed') return 1;
    if (b === 'unpointed') return -1;
    return Number(a) - Number(b);
  });

  const lookup = new Map(
    byTypeAndPoints.map((row) => [
      `${row.issueType}\0${row.storyPoints == null ? 'unpointed' : String(row.storyPoints)}`,
      row.count,
    ])
  );

  const header = ['Type', ...pointCols, 'Total'].join(' | ');
  const divider = ['---', ...pointCols.map(() => '---'), '---'].join(' | ');
  const lines = [header, divider];

  for (const type of types) {
    let total = 0;
    const cells = pointCols.map((col) => {
      const count = lookup.get(`${type}\0${col}`) ?? 0;
      total += count;
      return String(count);
    });
    lines.push([type, ...cells, String(total)].join(' | '));
  }

  return lines.join('\n');
}

export function formatStatsReport(stats) {
  const lines = [];

  lines.push('# Jira historical stats');
  lines.push('');
  lines.push(`Report generated: ${stats.runAt}`);
  if (stats.scope.reportRunAt) lines.push(`Source report: ${stats.scope.reportRunAt}`);
  lines.push('');

  lines.push('## Scope');
  lines.push('');
  lines.push('```text');
  lines.push(stats.scope.jql || '(no JQL recorded)');
  lines.push('```');
  lines.push('');
  lines.push(
    `Fetched **${stats.counts.fetched}**; included **${stats.counts.included}** (resolution Done); skipped **${stats.counts.skipped}**.`
  );
  if (stats.counts.fetchCapWarning) {
    lines.push('');
    lines.push(
      '**Warning:** Fetch hit the issue cap — results may be incomplete. Narrow JQL or raise `--max-results`.'
    );
  }

  lines.push('');
  lines.push('## Date ranges');
  lines.push('');
  lines.push(formatRange('Created (Jira)', stats.dateRanges.created));
  lines.push(formatRange('Work started (left To Do)', stats.dateRanges.workStarted));
  lines.push(formatRange('Closed', stats.dateRanges.closed));

  lines.push('');
  lines.push('## Issue counts');
  lines.push('');
  lines.push(
    `Total in report: **${stats.issueCounts.total}** (${stats.issueCounts.pointed} pointed, ${stats.issueCounts.unpointed} unpointed)`
  );
  lines.push('');
  for (const [type, count] of Object.entries(stats.issueCounts.byType).sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    lines.push(`- ${type}: ${count}`);
  }

  lines.push('');
  lines.push('### By type and story points');
  lines.push('');
  lines.push(formatMatrix(stats.issueCounts.byTypeAndPoints));

  lines.push('');
  lines.push('## Cycle time');
  lines.push('');
  const allDist = formatDistribution('All items', stats.cycleTime.distribution.all);
  if (allDist) lines.push(allDist);

  for (const [type, dist] of Object.entries(stats.cycleTime.distribution.byType).sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    const line = formatDistribution(type, dist);
    if (line) lines.push(line);
  }

  if (stats.cycleTime.buckets.length > 0) {
    lines.push('');
    lines.push('### Distribution buckets');
    for (const bucket of stats.cycleTime.buckets) {
      lines.push(`- ${bucket.label}: ${bucket.count}`);
    }
  }

  if (stats.cycleTime.percentiles.length > 0 || stats.cycleTime.p75ByStoryPoints?.length > 0) {
    lines.push('');
    lines.push('### 75th percentile groups');
    lines.push('');

    for (const entry of stats.cycleTime.percentiles) {
      if (entry.group !== 'all' && entry.group !== 'issueType') continue;
      lines.push(`- ${entry.label} (${entry.count}): ${entry.p75Days} days`);
    }

    if (stats.cycleTime.p75ByStoryPoints?.length > 0) {
      lines.push('');
      for (const group of stats.cycleTime.p75ByStoryPoints) {
        lines.push(group.label);
        for (const key of ['all', 'stories', 'tasks', 'bugs']) {
          const entry = group.breakdown[key];
          if (!entry) continue;
          lines.push(`  - ${entry.label}: ${entry.p75Days} days`);
        }
        lines.push('');
      }
    }
  }

  if (stats.throughput.byMonth.length > 0) {
    lines.push('');
    lines.push('## Throughput by month');
    lines.push('');
    for (const row of stats.throughput.byMonth) {
      lines.push(`- ${row.month}: ${row.closedCount} closed, ${row.storyPoints} story points`);
    }
    lines.push(`- **Total story points delivered:** ${stats.throughput.totalStoryPoints}`);
  }

  if (stats.pointDistribution.length > 0) {
    lines.push('');
    lines.push('## Point distribution');
    lines.push('');
    for (const row of stats.pointDistribution) {
      lines.push(`- ${row.storyPoints} points: ${row.count} (${row.percent}%)`);
    }
  }

  lines.push('');
  lines.push('## Data quality');
  lines.push('');
  lines.push(`- Missing work-start date: ${stats.dataQuality.missingStartDate}`);
  lines.push(`- Missing completion date: ${stats.dataQuality.missingCompletionDate}`);
  lines.push(`- Missing cycle time: ${stats.dataQuality.missingCycleTime}`);
  lines.push(`- Unpointed: ${stats.dataQuality.unpointed}`);
  if (!stats.dataQuality.hasCreatedDates) {
    lines.push('- Created dates: not available (pass `--issues-input` for Jira created range)');
  }

  if (stats.outliers.length > 0) {
    lines.push('');
    lines.push('## Outliers (>1.5× group p75)');
    lines.push('');
    for (const row of stats.outliers.slice(0, 10)) {
      const points = row.storyPoints == null ? 'unpointed' : `${row.storyPoints}pt`;
      lines.push(
        `- ${row.key} (${points}): ${row.cycleTime} days vs p75 ${row.p75Days} (${row.ratio}×)`
      );
    }
    if (stats.outliers.length > 10) {
      lines.push(`- … and ${stats.outliers.length - 10} more (see JSON items table)`);
    }
  }

  lines.push('');
  lines.push(`## Items (${stats.items.length})`);
  lines.push('');
  lines.push('| Key | Type | Pts | Created | Started | Closed | Cycle | Outlier | Summary |');
  lines.push('| --- | --- | ---: | --- | --- | --- | ---: | --- | --- |');
  for (const item of stats.items) {
    const pts = item.storyPoints == null ? '—' : String(item.storyPoints);
    const cycle = item.cycleTime == null ? '—' : String(item.cycleTime);
    const outlier = item.outlier ? 'yes' : '';
    const summary = String(item.summary ?? '')
      .replace(/\|/g, '\\|')
      .replace(/\n/g, ' ')
      .slice(0, 80);
    lines.push(
      `| [${item.key}](${item.jiraUrl}) | ${item.issueType} | ${pts} | ${item.created || '—'} | ${item.startDate || '—'} | ${item.completionDate || '—'} | ${cycle} | ${outlier} | ${summary} |`
    );
  }

  return lines.join('\n');
}
