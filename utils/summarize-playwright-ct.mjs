#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const parsed = {
    json: 'test-results/playwright-ct-results.json',
    markdown: 'test-results/playwright-ct-summary.md',
    summaryJson: 'test-results/playwright-ct-summary.json',
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json' || arg === '--markdown' || arg === '--summary-json') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`Missing value for ${arg}`);
      }
      if (arg === '--json') parsed.json = value;
      if (arg === '--markdown') parsed.markdown = value;
      if (arg === '--summary-json') parsed.summaryJson = value;
      index += 1;
    }
  }

  return parsed;
}

function ensureParentDir(filePath) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

function getErrorMessageFromResult(result) {
  if (!result) return '';

  if (result.error?.message) return result.error.message;
  if (result.error?.stack) return result.error.stack;

  if (Array.isArray(result.errors)) {
    for (const error of result.errors) {
      if (error?.message) return error.message;
      if (error?.stack) return error.stack;
      if (typeof error === 'string') return error;
    }
  }

  return '';
}

function classifyFailure(message) {
  const text = message.toLowerCase();
  if (!text) return 'unknown';

  if (
    text.includes('expect(') ||
    text.includes('tocontaintext') ||
    text.includes('tohavetext') ||
    text.includes('tobevisible') ||
    text.includes('assertionerror')
  ) {
    return 'assertion';
  }
  if (text.includes('timeout') || text.includes('timed out')) return 'timeout';
  if (
    text.includes('locator') ||
    text.includes('strict mode violation') ||
    text.includes('waiting for selector')
  ) {
    return 'locator';
  }
  if (
    text.includes('snapshot') ||
    text.includes('tohavescreenshot') ||
    text.includes('tomatchsnapshot')
  ) {
    return 'visual-regression';
  }
  if (
    text.includes('econn') ||
    text.includes('network') ||
    text.includes('net::') ||
    text.includes('fetch failed')
  ) {
    return 'network';
  }
  if (text.includes('assertionerror')) return 'assertion';

  return 'unknown';
}

function deriveFinalStatus(test) {
  const status = test.status ?? '';
  const expectedStatus = test.expectedStatus ?? 'passed';
  const results = test.results ?? [];
  const hasPassedAttempt = results.some((result) => result?.status === 'passed');
  const hasFailedAttempt = results.some(
    (result) => result?.status && !['passed', 'skipped'].includes(result.status)
  );

  if (status === 'flaky' || (hasPassedAttempt && hasFailedAttempt)) return 'flaky';
  if (status === 'skipped' || expectedStatus === 'skipped') return 'skipped';
  if (status === 'unexpected') return 'failed';
  if (status === 'expected' && expectedStatus === 'passed') return 'passed';

  if (expectedStatus === 'failed' && status === 'expected') return 'passed';

  return 'failed';
}

function buildTestName(suiteTitlePath, specTitle) {
  const cleanedPath = (suiteTitlePath ?? []).filter(Boolean);
  const joined = [...cleanedPath, specTitle ?? 'unnamed test'].join(' > ').trim();
  return joined || 'unnamed test';
}

function collectTestsFromSuite(suite, acc, suiteTitlePath = []) {
  const currentPath = suite?.title ? [...suiteTitlePath, suite.title] : suiteTitlePath;
  const suites = suite?.suites ?? [];
  for (const nestedSuite of suites) {
    collectTestsFromSuite(nestedSuite, acc, currentPath);
  }

  const specs = suite?.specs ?? [];
  for (const spec of specs) {
    const tests = spec?.tests ?? [];
    for (const test of tests) {
      const results = test?.results ?? [];
      const lastResult = results.length > 0 ? results[results.length - 1] : null;
      const message = getErrorMessageFromResult(lastResult);
      const finalStatus = deriveFinalStatus(test);

      acc.push({
        file: spec?.file ?? 'unknown-file',
        name: buildTestName(currentPath, spec?.title),
        project: test?.projectName ?? 'default',
        finalStatus,
        retryCount: Math.max(0, results.length - 1),
        durationMs: results.reduce((total, result) => total + (result?.duration ?? 0), 0),
        failureCategory: finalStatus === 'failed' ? classifyFailure(message) : null,
        failureMessage: finalStatus === 'failed' ? message : '',
      });
    }
  }
}

function aggregate(testResults) {
  const totals = {
    total: testResults.length,
    passed: 0,
    failed: 0,
    flaky: 0,
    skipped: 0,
    retried: 0,
  };

  const failedByCategory = {
    timeout: 0,
    locator: 0,
    network: 0,
    assertion: 0,
    'visual-regression': 0,
    unknown: 0,
  };

  for (const test of testResults) {
    if (test.finalStatus in totals) {
      totals[test.finalStatus] += 1;
    }

    if (test.retryCount > 0) {
      totals.retried += 1;
    }

    if (test.finalStatus === 'failed') {
      failedByCategory[test.failureCategory ?? 'unknown'] += 1;
    }
  }

  return { totals, failedByCategory };
}

function createMarkdown(summary, tests, sourcePath, generatedAt) {
  const { totals, failedByCategory } = summary;
  const failedTests = tests.filter((test) => test.finalStatus === 'failed');
  const flakyTests = tests.filter((test) => test.finalStatus === 'flaky');

  const lines = [];
  lines.push('## Playwright CT Per-Test Summary');
  lines.push('');
  lines.push(`Generated: ${generatedAt}`);
  lines.push(`Source: \`${sourcePath}\``);
  lines.push('');
  lines.push('| Metric | Count |');
  lines.push('| --- | ---: |');
  lines.push(`| Total tests | ${totals.total} |`);
  lines.push(`| Passed | ${totals.passed} |`);
  lines.push(`| Failed | ${totals.failed} |`);
  lines.push(`| Flaky | ${totals.flaky} |`);
  lines.push(`| Skipped | ${totals.skipped} |`);
  lines.push(`| Retried (>=1 retry attempt) | ${totals.retried} |`);
  lines.push('');

  if (totals.failed > 0) {
    lines.push('### Failure Buckets');
    lines.push('');
    lines.push('| Category | Count |');
    lines.push('| --- | ---: |');
    lines.push(`| timeout | ${failedByCategory.timeout} |`);
    lines.push(`| locator | ${failedByCategory.locator} |`);
    lines.push(`| network | ${failedByCategory.network} |`);
    lines.push(`| assertion | ${failedByCategory.assertion} |`);
    lines.push(`| visual-regression | ${failedByCategory['visual-regression']} |`);
    lines.push(`| unknown | ${failedByCategory.unknown} |`);
    lines.push('');

    lines.push('### Failed Tests');
    lines.push('');
    for (const test of failedTests.slice(0, 50)) {
      lines.push(
        `- \`${test.file}\` | \`${test.project}\` | \`${test.name}\` | \`${test.failureCategory}\``
      );
    }
    if (failedTests.length > 50) {
      lines.push(`- ... ${failedTests.length - 50} more failed tests`);
    }
    lines.push('');
  }

  if (flakyTests.length > 0) {
    lines.push('### Flaky Tests');
    lines.push('');
    for (const test of flakyTests.slice(0, 50)) {
      lines.push(`- \`${test.file}\` | \`${test.project}\` | \`${test.name}\``);
    }
    if (flakyTests.length > 50) {
      lines.push(`- ... ${flakyTests.length - 50} more flaky tests`);
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function writeFallbackOutputs(markdownPath, summaryPath, jsonPath) {
  const generatedAt = new Date().toISOString();
  const markdown = [
    '## Playwright CT Per-Test Summary',
    '',
    `Generated: ${generatedAt}`,
    `Source: \`${jsonPath}\``,
    '',
    'No JSON reporter output found. The CT run may have failed before reporter output was written.',
    '',
  ].join('\n');

  ensureParentDir(markdownPath);
  fs.writeFileSync(markdownPath, markdown, 'utf8');

  const fallbackSummary = {
    generatedAt,
    source: jsonPath,
    reporterOutputFound: false,
    totals: {
      total: 0,
      passed: 0,
      failed: 0,
      flaky: 0,
      skipped: 0,
      retried: 0,
    },
    failedByCategory: {
      timeout: 0,
      locator: 0,
      network: 0,
      assertion: 0,
      'visual-regression': 0,
      unknown: 0,
    },
    tests: [],
  };

  ensureParentDir(summaryPath);
  fs.writeFileSync(summaryPath, JSON.stringify(fallbackSummary, null, 2), 'utf8');
}

function main() {
  const args = parseArgs(process.argv);
  const generatedAt = new Date().toISOString();

  if (!fs.existsSync(args.json)) {
    writeFallbackOutputs(args.markdown, args.summaryJson, args.json);
    return;
  }

  let raw;
  let parsed;
  try {
    raw = fs.readFileSync(args.json, 'utf8');
    parsed = JSON.parse(raw);
  } catch {
    writeFallbackOutputs(args.markdown, args.summaryJson, args.json);
    return;
  }

  const tests = [];
  const rootSuites = parsed?.suites ?? [];
  for (const suite of rootSuites) {
    collectTestsFromSuite(suite, tests);
  }

  const summary = aggregate(tests);
  const { totals } = summary;

  const oneLiner = `CT: ${totals.passed} passed, ${totals.failed} failed, ${totals.flaky} flaky, ${totals.skipped} skipped (${totals.total} total)`;
  console.log(oneLiner);

  const markdown = createMarkdown(summary, tests, args.json, generatedAt);

  ensureParentDir(args.markdown);
  fs.writeFileSync(args.markdown, markdown, 'utf8');

  const summaryJson = {
    generatedAt,
    source: args.json,
    reporterOutputFound: true,
    ...summary,
    tests,
  };
  ensureParentDir(args.summaryJson);
  fs.writeFileSync(args.summaryJson, JSON.stringify(summaryJson, null, 2), 'utf8');
}

main();
