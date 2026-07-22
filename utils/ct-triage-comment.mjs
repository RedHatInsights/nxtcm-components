#!/usr/bin/env node

import fs from 'node:fs';

const TRIAGE_HINTS = {
  timeout: 'CI resource pressure or slow async mock — check if tests pass locally',
  locator: 'selector changed — check recent markup changes in the affected component',
  network: 'mock or fetch issue — verify test fixtures and network intercepts',
  assertion: 'expected value mismatch — review the assertion and recent logic changes',
  'visual-regression': 'screenshot diff — check if a visual change was intentional',
  unknown: 'no clear pattern — check the full error in the HTML report artifact',
};

const MAX_SUMMARY_BYTES = 1_000_000;
const MAX_TESTS = 1_000;
const MAX_FAILURE_MESSAGE_LENGTH = 8_000;
const MAX_REPORTED_COUNT = 1_000_000;

const ALLOWED_FAILURE_CATEGORIES = new Set([
  'timeout',
  'locator',
  'network',
  'assertion',
  'visual-regression',
  'unknown',
]);

function parseArgs(argv) {
  const parsed = { summaryJson: 'test-results/playwright-ct-summary.json' };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--summary-json') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`Missing value for ${arg}`);
      }
      parsed.summaryJson = value;
      index += 1;
    }
  }

  return parsed;
}

function asNonNegativeInt(value, fallback = 0) {
  if (!Number.isSafeInteger(value) || value < 0) {
    return fallback;
  }
  return Math.min(value, MAX_REPORTED_COUNT);
}

function safeInline(value, maxLength = 250) {
  if (typeof value !== 'string') {
    return '';
  }
  const normalized = value.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
  const mentionSafe = normalized.replace(/@/g, '@\u200b');
  const htmlEscaped = mentionSafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  const escaped = htmlEscaped.replace(/([\\`*_[\](){}#+\-!.>|~])/g, '\\$1');
  return escaped.length > maxLength ? `${escaped.slice(0, maxLength)}…` : escaped;
}

function normalizeFailureCategory(value) {
  if (typeof value !== 'string') {
    return 'unknown';
  }
  return ALLOWED_FAILURE_CATEGORIES.has(value) ? value : 'unknown';
}

function normalizeSummary(summary) {
  if (!summary || typeof summary !== 'object') {
    return null;
  }

  const totalsRaw = summary.totals && typeof summary.totals === 'object' ? summary.totals : {};
  const totals = {
    total: asNonNegativeInt(totalsRaw.total),
    passed: asNonNegativeInt(totalsRaw.passed),
    failed: asNonNegativeInt(totalsRaw.failed),
    flaky: asNonNegativeInt(totalsRaw.flaky),
    skipped: asNonNegativeInt(totalsRaw.skipped),
    timedOut: asNonNegativeInt(totalsRaw.timedOut),
  };

  const failedByCategoryRaw =
    summary.failedByCategory && typeof summary.failedByCategory === 'object'
      ? summary.failedByCategory
      : {};
  const failedByCategory = {};
  for (const category of ALLOWED_FAILURE_CATEGORIES) {
    failedByCategory[category] = asNonNegativeInt(failedByCategoryRaw[category]);
  }

  const testsRaw = Array.isArray(summary.tests) ? summary.tests : [];
  const tests = testsRaw
    .slice(0, MAX_TESTS)
    .filter((test) => test && typeof test === 'object')
    .map((test) => ({
      file: typeof test.file === 'string' ? test.file : '',
      name: typeof test.name === 'string' ? test.name : '',
      finalStatus:
        test.finalStatus === 'failed' || test.finalStatus === 'flaky' ? test.finalStatus : '',
      failureCategory: normalizeFailureCategory(test.failureCategory),
      failureMessage:
        typeof test.failureMessage === 'string'
          ? test.failureMessage.slice(0, MAX_FAILURE_MESSAGE_LENGTH)
          : '',
    }));

  return { totals, failedByCategory, tests };
}

function stripAnsi(str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\u001b\[[0-9;]*m/g, '');
}

function extractErrorSnippet(message) {
  if (!message) return '';

  const clean = stripAnsi(message);
  const parts = [];

  const expectMatch = clean.match(/expect\(.*?\)\.[\w.]+\(.*?\)/s);
  if (expectMatch) {
    parts.push(expectMatch[0].replace(/\s+/g, ' ').trim());
  }

  const expectedMatch = clean.match(/Expected\s*(?:string|substring|value|pattern)?:\s*(.+)/i);
  const receivedMatch = clean.match(/Received\s*(?:string|value|element)?:\s*(.+)/i);
  if (expectedMatch && receivedMatch) {
    parts.push(`Expected: ${expectedMatch[1].trim()}, Received: ${receivedMatch[1].trim()}`);
  }

  if (parts.length > 0) {
    const combined = parts.join(' — ');
    return combined.length > 250 ? `${combined.slice(0, 250)}…` : combined;
  }

  const firstLine = clean.split('\n').find((l) => l.trim().length > 0) ?? '';
  const trimmed = firstLine.trim();
  return trimmed.length > 200 ? `${trimmed.slice(0, 200)}…` : trimmed;
}

function buildComment(summary) {
  const { totals, failedByCategory, tests } = summary;

  if (totals.failed === 0 && totals.flaky === 0) {
    return null;
  }

  const lines = [];
  lines.push('## CT Triage');
  lines.push('');

  if (totals.failed > 0) {
    lines.push(
      `**${totals.failed} failure${totals.failed === 1 ? '' : 's'}** detected across ${totals.total} tests.`
    );
    lines.push('');

    const activeCategories = Object.entries(failedByCategory).filter(([, count]) => count > 0);
    if (activeCategories.length > 0) {
      lines.push('| Category | Count | Likely cause |');
      lines.push('| --- | ---: | --- |');
      for (const [category, count] of activeCategories) {
        lines.push(
          `| ${category} | ${count} | ${TRIAGE_HINTS[category] ?? TRIAGE_HINTS.unknown} |`
        );
      }
      lines.push('');
    }

    const failedTests = tests.filter((t) => t.finalStatus === 'failed');
    if (failedTests.length > 0) {
      lines.push('**Failed tests:**');
      for (const test of failedTests.slice(0, 25)) {
        lines.push(
          `- ${safeInline(test.file, 220)} > ${safeInline(test.name, 240)} | ${test.failureCategory}`
        );
        const snippet = extractErrorSnippet(test.failureMessage);
        if (snippet) {
          lines.push(`  > ${safeInline(snippet, 250)}`);
        }
      }
      const remainingFailed = totals.failed - Math.min(failedTests.length, 25);
      if (remainingFailed > 0) {
        lines.push(`- ... ${remainingFailed} more (see full report artifact)`);
      }
      lines.push('');
    }
  }

  if (totals.flaky > 0) {
    const flakyTests = tests.filter((t) => t.finalStatus === 'flaky');
    lines.push(`**${totals.flaky} flaky test${totals.flaky === 1 ? '' : 's'}** (passed on retry):`);
    for (const test of flakyTests.slice(0, 10)) {
      lines.push(`- ${safeInline(test.file, 220)} > ${safeInline(test.name, 240)}`);
    }
    const remainingFlaky = totals.flaky - Math.min(flakyTests.length, 10);
    if (remainingFlaky > 0) {
      lines.push(`- ... ${remainingFlaky} more`);
    }
    lines.push('');
  }

  lines.push(
    '*This comment was generated by the CT triage step. Download the `playwright-ct-report` artifact for full details.*'
  );

  return lines.join('\n');
}

function main() {
  const args = parseArgs(process.argv);

  if (!fs.existsSync(args.summaryJson)) {
    process.stdout.write('');
    return;
  }

  let summaryStat;
  try {
    summaryStat = fs.statSync(args.summaryJson);
  } catch {
    process.stdout.write('');
    return;
  }

  if (summaryStat.size > MAX_SUMMARY_BYTES) {
    process.stdout.write('');
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(args.summaryJson, 'utf8'));
  } catch {
    process.stdout.write('');
    return;
  }

  const normalizedSummary = normalizeSummary(parsed);
  if (!normalizedSummary) {
    process.stdout.write('');
    return;
  }

  const comment = buildComment(normalizedSummary);
  if (comment) {
    process.stdout.write(comment);
  }
}

main();
