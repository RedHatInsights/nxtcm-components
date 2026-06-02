#!/usr/bin/env node

/**
 * assembles unit (jest) + component (playwright CT) + e2e (playwright) results
 * into a single test-coverage-data.json artifact that EPD consumes.
 *
 * inputs (all optional — missing sources produce zeroed sections):
 *   --jest-results    path to jest JSON output (jest --json --outputFile=...)
 *   --ct-summary      path to playwright-ct-summary.json
 *   --e2e-results     path to playwright e2e JSON output
 *   --output          path to write test-coverage-data.json (default: test-coverage-data.json)
 */

import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const opts = {
    jestResults: null,
    ctSummary: null,
    e2eResults: null,
    output: 'test-coverage-data.json',
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--jest-results' && next) {
      opts.jestResults = next;
      i += 1;
    } else if (arg === '--ct-summary' && next) {
      opts.ctSummary = next;
      i += 1;
    } else if (arg === '--e2e-results' && next) {
      opts.e2eResults = next;
      i += 1;
    } else if (arg === '--output' && next) {
      opts.output = next;
      i += 1;
    }
  }

  return opts;
}

function readJson(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.warn(`warning: failed to parse ${filePath}: ${err.message}`);
    return null;
  }
}

function emptySuite(framework) {
  return { framework, total: 0, passed: 0, failed: 0, skipped: 0, duration_s: 0, files: [] };
}

function buildUnitSection(jestData) {
  if (!jestData || !jestData.testResults) return emptySuite('jest');

  let total = 0;
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let durationMs = 0;
  const files = [];

  for (const suite of jestData.testResults) {
    const fileTests = suite.assertionResults?.length || 0;
    const filePassed = suite.assertionResults?.filter((t) => t.status === 'passed').length || 0;
    const fileFailed = suite.assertionResults?.filter((t) => t.status === 'failed').length || 0;
    const fileSkipped =
      suite.assertionResults?.filter((t) => t.status === 'pending' || t.status === 'skipped')
        .length || 0;
    const fileDuration = (suite.endTime || 0) - (suite.startTime || 0);

    total += fileTests;
    passed += filePassed;
    failed += fileFailed;
    skipped += fileSkipped;
    durationMs += fileDuration;

    if (fileTests > 0) {
      files.push({
        name: suite.name ? path.relative(process.cwd(), suite.name) : 'unknown',
        tests: fileTests,
        passed: filePassed,
        failed: fileFailed,
        skipped: fileSkipped,
        duration_ms: Math.max(0, fileDuration),
      });
    }
  }

  return {
    framework: 'jest',
    total,
    passed,
    failed,
    skipped,
    duration_s: Math.round((durationMs / 1000) * 100) / 100,
    files,
  };
}

function buildCtSection(ctSummary) {
  if (!ctSummary || !ctSummary.totals) return emptySuite('playwright-ct');

  const totals = ctSummary.totals;
  const files = [];

  if (Array.isArray(ctSummary.tests)) {
    const byFile = new Map();
    for (const test of ctSummary.tests) {
      const fileName = test.file || 'unknown';
      if (!byFile.has(fileName)) {
        byFile.set(fileName, { tests: 0, passed: 0, failed: 0, skipped: 0, duration_ms: 0 });
      }
      const entry = byFile.get(fileName);
      entry.tests += 1;
      entry.duration_ms += test.durationMs || 0;

      const status = test.finalStatus || test.status || '';
      if (status === 'passed' || status === 'flaky') entry.passed += 1;
      else if (status === 'failed') entry.failed += 1;
      else if (status === 'skipped') entry.skipped += 1;
      else entry.passed += 1;
    }

    for (const [name, data] of byFile) {
      files.push({ name, ...data });
    }
  }

  return {
    framework: 'playwright-ct',
    total: totals.total || 0,
    passed: (totals.passed || 0) + (totals.flaky || 0),
    failed: totals.failed || 0,
    skipped: totals.skipped || 0,
    duration_s: files.reduce((sum, f) => sum + f.duration_ms, 0) / 1000,
    files,
  };
}

function buildE2eSection(playwrightData) {
  if (!playwrightData || !playwrightData.suites) return emptySuite('playwright');

  let total = 0;
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let durationMs = 0;
  const byFile = new Map();

  function walkSuites(suites, parentFile) {
    for (const suite of suites) {
      const fileName = suite.file || parentFile || 'unknown';

      if (Array.isArray(suite.specs)) {
        if (!byFile.has(fileName)) {
          byFile.set(fileName, { tests: 0, passed: 0, failed: 0, skipped: 0, duration_ms: 0 });
        }
        const entry = byFile.get(fileName);

        for (const spec of suite.specs) {
          for (const test of spec.tests || []) {
            entry.tests += 1;
            total += 1;
            const status = test.status || test.expectedStatus;
            if (status === 'expected' || status === 'passed' || status === 'flaky') {
              entry.passed += 1;
              passed += 1;
            } else if (status === 'unexpected' || status === 'failed') {
              entry.failed += 1;
              failed += 1;
            } else if (status === 'skipped') {
              entry.skipped += 1;
              skipped += 1;
            }
            for (const result of test.results || []) {
              entry.duration_ms += result.duration || 0;
              durationMs += result.duration || 0;
            }
          }
        }
      }

      if (Array.isArray(suite.suites)) {
        walkSuites(suite.suites, fileName);
      }
    }
  }

  walkSuites(playwrightData.suites, null);

  const files = [];
  for (const [name, data] of byFile) {
    if (data.tests > 0) files.push({ name, ...data });
  }

  return {
    framework: 'playwright',
    total,
    passed,
    failed,
    skipped,
    duration_s: Math.round((durationMs / 1000) * 100) / 100,
    files,
  };
}

const opts = parseArgs(process.argv);

const jestData = readJson(opts.jestResults);
const ctSummary = readJson(opts.ctSummary);
const e2eData = readJson(opts.e2eResults);

const contract = {
  schemaVersion: '1.0',
  repo: 'RedHatInsights/nxtcm-components',
  generated_at: new Date().toISOString(),
  unit: buildUnitSection(jestData),
  component: buildCtSection(ctSummary),
  e2e: buildE2eSection(e2eData),
};

const dir = path.dirname(opts.output);
if (dir !== '.') fs.mkdirSync(dir, { recursive: true });

fs.writeFileSync(opts.output, JSON.stringify(contract, null, 2) + '\n');

const totals = contract.unit.total + contract.component.total + contract.e2e.total;
console.log(`test-coverage-data.json written (${totals} total tests across 3 suites)`);
