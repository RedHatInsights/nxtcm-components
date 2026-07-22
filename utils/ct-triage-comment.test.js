const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const SCRIPT_PATH = path.join(process.cwd(), 'utils', 'ct-triage-comment.mjs');

function runCommentScript(summaryContent) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ct-triage-comment-'));
  const summaryPath = path.join(tempDir, 'playwright-ct-summary.json');

  if (typeof summaryContent === 'string') {
    fs.writeFileSync(summaryPath, summaryContent, 'utf8');
  } else {
    fs.writeFileSync(summaryPath, JSON.stringify(summaryContent), 'utf8');
  }

  let output = '';
  try {
    output = execFileSync('node', [SCRIPT_PATH, '--summary-json', summaryPath], {
      encoding: 'utf8',
    });
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  return output;
}

describe('ct-triage-comment script', () => {
  test('escapes markdown and html from untrusted artifact content', () => {
    const output = runCommentScript({
      totals: { total: 1, failed: 1, flaky: 0, passed: 0, skipped: 0, timedOut: 0 },
      failedByCategory: { assertion: 1 },
      tests: [
        {
          file: 'file[name](url).spec.tsx',
          name: '```bold``` [click](javascript:alert(1)) *item* | table',
          finalStatus: 'failed',
          failureCategory: 'assertion',
          failureMessage: '<script>alert(1)</script> [x](y) *z*',
        },
      ],
    });

    expect(output).toContain('file\\[name\\]\\(url\\)\\.spec\\.tsx');
    expect(output).toContain('\\`\\`\\`bold\\`\\`\\`');
    expect(output).toContain('\\[click\\]\\(javascript:alert\\(1\\)\\)');
    expect(output).toContain('\\*item\\*');
    expect(output).toContain('\\| table');
    expect(output).toContain('&lt;script&gt;alert\\(1\\)&lt;/script&gt;');

    // ensure unescaped markdown link does not survive rendering.
    expect(output).not.toContain('[click](javascript:alert(1))');
  });

  test('drops oversized summary artifacts before parsing', () => {
    const oversized = `{"padding":"${'a'.repeat(1_000_100)}"}`;
    const output = runCommentScript(oversized);
    expect(output).toBe('');
  });

  test('caps parsed tests at MAX_TESTS before rendering records', () => {
    const tests = Array.from({ length: 1_200 }, (_, index) => ({
      file: `file-${index}.spec.tsx`,
      name: `test-${index}`,
      finalStatus: index < 1_000 ? 'passed' : 'failed',
      failureCategory: 'assertion',
      failureMessage: 'Expected: 1, Received: 2',
    }));

    const output = runCommentScript({
      totals: { total: 1200, failed: 200, flaky: 0, passed: 1000, skipped: 0, timedOut: 0 },
      failedByCategory: { assertion: 200 },
      tests,
    });

    // failures start after MAX_TESTS, so they are excluded from rendered failed records.
    expect(output).toContain('**200 failures** detected across 1200 tests.');
    expect(output).toContain('| assertion | 200 |');
    expect(output).not.toContain('**Failed tests:**');
    expect(output).not.toContain('file-1000\\.spec\\.tsx');
  });

  test('bounds rendered failures and categories to normalized failed total', () => {
    const output = runCommentScript({
      totals: { total: 50, failed: 1, flaky: 0, passed: 49, skipped: 0, timedOut: 0 },
      failedByCategory: { assertion: 10, timeout: 3, unknown: 2 },
      tests: [
        {
          file: 'first.spec.tsx',
          name: 'first failure',
          finalStatus: 'failed',
          failureCategory: 'assertion',
          failureMessage: 'Expected 1, Received 2',
        },
        {
          file: 'second.spec.tsx',
          name: 'second failure',
          finalStatus: 'failed',
          failureCategory: 'timeout',
          failureMessage: 'timed out',
        },
      ],
    });

    expect(output).toContain('**1 failure** detected across 50 tests.');
    expect(output).toContain('| assertion | 1 |');
    expect(output).not.toContain('| timeout |');
    expect(output).toContain('first\\.spec\\.tsx > first failure');
    expect(output).not.toContain('second\\.spec\\.tsx > second failure');
  });

  test('bounds rendered flaky records to normalized flaky total', () => {
    const output = runCommentScript({
      totals: { total: 20, failed: 0, flaky: 1, passed: 19, skipped: 0, timedOut: 0 },
      failedByCategory: {},
      tests: [
        {
          file: 'first-flaky.spec.tsx',
          name: 'first flaky',
          finalStatus: 'flaky',
          failureCategory: 'unknown',
          failureMessage: 'flaky 1',
        },
        {
          file: 'second-flaky.spec.tsx',
          name: 'second flaky',
          finalStatus: 'flaky',
          failureCategory: 'unknown',
          failureMessage: 'flaky 2',
        },
      ],
    });

    expect(output).toContain('**1 flaky test** (passed on retry):');
    expect(output).toContain('first\\-flaky\\.spec\\.tsx > first flaky');
    expect(output).not.toContain('second\\-flaky\\.spec\\.tsx > second flaky');
  });

  test('neutralizes @ mentions in untrusted artifact content', () => {
    const output = runCommentScript({
      totals: { total: 1, failed: 1, flaky: 0, passed: 0, skipped: 0, timedOut: 0 },
      failedByCategory: { assertion: 1 },
      tests: [
        {
          file: '@admin/evil.spec.tsx',
          name: 'pings @org/team in test name',
          finalStatus: 'failed',
          failureCategory: 'assertion',
          failureMessage: 'Expected @user to be logged in',
        },
      ],
    });

    expect(output).not.toContain('@admin');
    expect(output).not.toContain('@org/team');
    expect(output).not.toContain('@user');
    expect(output).toContain('@\u200b');
  });

  test('caps large but safe totals and category counts', () => {
    const output = runCommentScript({
      totals: { total: 2_000_000, failed: 2_000_000, flaky: 0, passed: 0, skipped: 0, timedOut: 0 },
      failedByCategory: { assertion: 2_000_000 },
      tests: [
        {
          file: 'oversized-counts.spec.tsx',
          name: 'handles huge numeric counters',
          finalStatus: 'failed',
          failureCategory: 'assertion',
          failureMessage: 'Expected 1, Received 2',
        },
      ],
    });

    // safe integers above the cap should clamp to MAX_REPORTED_COUNT.
    expect(output).toContain('**1000000 failures** detected across 1000000 tests.');
    expect(output).toContain('| assertion | 1000000 |');
  });

  test('drops non-safe integer totals to fallback values', () => {
    const output = runCommentScript({
      totals: { total: 1e100, failed: 1e100, flaky: 0, passed: 0, skipped: 0, timedOut: 0 },
      failedByCategory: { assertion: 1e100 },
      tests: [],
    });

    // non-safe counters are treated as invalid and do not produce triage output.
    expect(output).toBe('');
  });
});
