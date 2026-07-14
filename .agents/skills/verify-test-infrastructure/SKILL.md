---
skill: verify-test-infrastructure
description: Verify test infrastructure is working after dependency updates, rebases, or config changes
version: 1.0.0
tags: [testing, verification, infrastructure]
---

# verify-test-infrastructure

Quickly verify all test suites and coverage collection infrastructure are working correctly. Use this after:
- Dependency upgrades (Vite, Playwright, Istanbul, etc.)
- Rebases that change test structure or configuration
- Modifications to test configs (playwright-ct.config.ts, playwright.config.ts, jest.config.js)
- Cache issues or build problems
- Adding/removing test infrastructure

This skill verifies the **test pipeline infrastructure**, not test content. For verifying individual test results, use `/verify-tests`.

## What This Skill Checks

1. **CT Infrastructure** (Component Tests)
   - CT tests run without coverage
   - Istanbul plugin loads and instruments code
   - Coverage data is collected to `.nyc_output`
   - Playwright cache (`playwright/.cache`) works correctly

2. **E2E Infrastructure**
   - E2E tests run with coverage
   - Coverage collection works for E2E

3. **Coverage Reporting**
   - NYC can generate reports from collected data
   - Coverage metrics are reasonable (not 0% or 100%)

4. **Common Issues Detection**
   - Stale cache preventing instrumentation
   - Missing dependencies (nyc, istanbul-lib-instrument, test-exclude)
   - Plugin not loading or transform hook not firing
   - Coverage env var not propagating

## Verification Steps

### 1. Quick CT Baseline Check

Run a small subset of CT tests **without** coverage to verify basic test infrastructure:

```bash
rm -rf playwright/.cache && \
npx playwright test -c playwright-ct.config.ts --grep "CVECard.*should render the card with default title"
```

**Expected**: Test passes in 1-3 seconds, no errors.

**Red flags**:
- Test fails or times out
- Module resolution errors
- Playwright can't find tests

### 2. CT Coverage Instrumentation Check

Run the same test **with** coverage and verify Istanbul instruments code:

```bash
rm -rf playwright/.cache .nyc_output && \
COVERAGE=true npx playwright test -c playwright-ct.config.ts --grep "CVECard.*should render the card with default title"
```

**Expected**:
- Test passes (slower, ~10-15s due to build)
- `.nyc_output/` directory created
- At least one JSON file in `.nyc_output/`

**Red flags**:
- No `.nyc_output` directory → Istanbul not instrumenting
- Empty `.nyc_output` directory → Coverage fixture not capturing
- Test much slower than expected → Possible timeout issues

**Verify coverage was captured**:

```bash
ls -la .nyc_output/ && echo "---" && \
jq -s '.[0] | keys | length' .nyc_output/*.json 2>/dev/null || echo "Coverage file is not valid JSON"
```

**Expected**: Directory exists, contains JSON files with coverage data (non-zero key count).

### 3. NYC Report Generation Check

Verify NYC can generate a report from the collected data:

```bash
npx nyc report --reporter=text-summary
```

**Expected**:
```
=============================== Coverage summary ===============================
Statements   : 70-95% ( X/Y )
Branches     : 60-90% ( X/Y )
Functions    : 50-80% ( X/Y )
Lines        : 70-95% ( X/Y )
================================================================================
```

**Red flags**:
- "No coverage files found" → Collection failed
- All metrics at 0% → Instrumentation didn't work
- All metrics at 100% → Wrong files instrumented

### 4. Full CT Coverage Suite Check

Run all 627 CT tests with coverage (takes ~2 minutes):

```bash
npm run test:ct:coverage 2>&1 | tail -30
```

**Expected**:
```
  1 skipped
  627 passed (1.5-2m)

=============================== Coverage summary ===============================
Statements   : 70-80%
Branches     : 65-75%
Functions    : 55-65%
Lines        : 75-85%
================================================================================
```

**Red flags**:
- Tests fail that passed in step 1 → Coverage breaks tests
- No coverage report at end → NYC not running
- Build takes much longer than 10s → Possible cache issue

### 5. E2E Coverage Check

Verify E2E coverage infrastructure (quick, ~25-30s):

```bash
npm run test:e2e:coverage 2>&1 | tail -20
```

**Expected**:
```
  17 passed (25-30s)

=============================== Coverage summary ===============================
Statements   : 85-95% ( 37-41/41 )
Branches     : 80-90%
Functions    : 80-90%
Lines        : 90-100%
================================================================================
```

**Red flags**:
- E2E tests fail
- No coverage collected for E2E

### 6. Regular CT Without Coverage

Verify CT tests run fast without coverage overhead:

```bash
npm run test:ct 2>&1 | tail -10
```

**Expected**:
```
  1 skipped
  627 passed (1.2-1.5m)
```

Should be ~20-30% faster than coverage run.

## Common Issues and Fixes

### Issue: No `.nyc_output` directory created

**Symptoms**:
- Tests pass but no coverage data
- NYC report fails with "No coverage files found"

**Root causes**:
1. **Stale Playwright cache** - Cache contains pre-built bundles without instrumentation
   - Fix: `rm -rf playwright/.cache .nyc_output`
   - Scripts should auto-clear, but check if cache clearing is working

2. **Istanbul plugin not loaded**
   - Check `playwright-ct.config.ts` has `istanbulPlugin` in plugins array
   - Verify `COVERAGE=true` env var is set

3. **Transform hook not firing**
   - Add debug logging to `playwright/istanbul-plugin.cjs` transform hook
   - Check if plugin is being called during build

4. **Coverage fixture not auto-running**
   - Verify tests import from `@/ct-fixture.ts` not `@playwright/experimental-ct-react`
   - Check fixture has `{ auto: true, scope: 'test' }`

### Issue: Coverage at 0% or unrealistic numbers

**Symptoms**:
- Report shows 0% or 100% coverage
- Coverage numbers don't match test files

**Root causes**:
- Wrong files being instrumented (check `testExclude` patterns in istanbul-plugin.cjs)
- Instrumentation happening but coverage not captured
- Coverage data from wrong source

**Fix**: Check `playwright/istanbul-plugin.cjs` include/exclude patterns match workspace structure.

### Issue: Tests timeout with coverage enabled

**Symptoms**:
- Tests pass without coverage
- Timeout with `COVERAGE=true`

**Root cause**: Istanbul instrumentation adds overhead, especially for complex wizard tests.

**Fix**: Increase timeout in package.json:
```json
"test:ct:coverage": "... --timeout 120000 ..."
```

### Issue: Module resolution errors after rebase

**Symptoms**:
- Can't find `@/ct-fixture`
- Can't find workspace packages

**Root cause**: Path aliases not configured or workspace structure changed.

**Fix**:
- Verify `playwright-ct.config.ts` has path aliases for `@/` and workspace packages
- Check `tsconfig.json` includes workspace packages
- Run `npm install` to refresh workspace links

### Issue: "vite-plugin-istanbul" ES module errors

**Symptoms**:
- `ERR_PACKAGE_PATH_NOT_EXPORTED` when using official plugin
- Plugin requires ES modules but config uses CommonJS

**Root cause**: `vite-plugin-istanbul` v8+ only exports ES modules, incompatible with Playwright CT config compilation.

**Fix**: Use custom `playwright/istanbul-plugin.cjs` (already implemented).

## Success Criteria

All checks should pass:

- ✅ CT tests run without coverage (~1.2-1.5m, 627 passed)
- ✅ CT tests run with coverage (~1.5-2m, 627 passed)
- ✅ `.nyc_output/` directory created with JSON files
- ✅ NYC generates coverage report with reasonable percentages (not 0% or 100%)
- ✅ E2E tests run with coverage (~25-30s, 17 passed)
- ✅ Coverage percentages are in expected ranges:
  - CT: Statements 70-80%, Branches 65-75%, Functions 55-65%, Lines 75-85%
  - E2E: Statements 85-95%, Branches 80-90%, Functions 80-90%, Lines 90-100%

## Quick Smoke Test

For a fast verification (30-60 seconds total), run just these:

```bash
# 1. Quick CT baseline
rm -rf playwright/.cache && \
npx playwright test -c playwright-ct.config.ts --grep "CVECard.*should render the card" --max-failures=1

# 2. CT coverage instrumentation
rm -rf playwright/.cache .nyc_output && \
COVERAGE=true npx playwright test -c playwright-ct.config.ts --grep "CVECard.*should render the card with default title" && \
ls -la .nyc_output/

# 3. NYC report
npx nyc report --reporter=text-summary
```

If all three pass, infrastructure is working correctly.

## Notes for AI Agents

When running this skill:

1. **Always clear cache first** - Stale cache is the #1 cause of coverage issues
2. **Don't skip verification steps** - Each checks a different part of the pipeline
3. **Report specific failures** - Don't just say "coverage failed", specify which step and what went wrong
4. **Check file paths** - After rebases, test file paths may have changed
5. **Verify env vars** - `COVERAGE=true` must be set for coverage tests
6. **Wait for builds** - First coverage run takes ~10s to build, don't timeout early
7. **Check cache location** - Playwright CT caches to `playwright/.cache`, not root `.cache`

## Related Files

- `playwright-ct.config.ts` - CT test config, Istanbul plugin loading
- `playwright/istanbul-plugin.cjs` - Custom Istanbul/Vite plugin
- `playwright.config.ts` - E2E test config
- `ct-fixture.ts` - Coverage capture fixture
- `package.json` - Test scripts
- `.nyc_output/` - Coverage data (gitignored)
- `playwright/.cache/` - Playwright CT build cache (gitignored)
