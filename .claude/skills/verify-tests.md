---
name: verify-tests
description: Verify Playwright component and e2e tests work correctly with and without coverage
tags: [testing, playwright, coverage]
---

# Verify Tests Skill

Systematically verify that Playwright component tests (CT) and end-to-end (e2e) tests work correctly in this project, with or without Istanbul code coverage.

## What This Skill Does

1. **Checks test prerequisites**
   - Playwright browsers installed
   - Dependencies up to date
   - No conflicting processes on test ports (3100 for CT, 3200 for e2e)

2. **Runs tests in the correct order**
   - Component tests without coverage first (fast baseline)
   - E2E tests without coverage
   - Optionally: tests with coverage enabled
   - Compares results to detect coverage-specific issues

3. **Diagnoses failures**
   - Missing browsers → suggests `npx playwright install chromium`
   - Missing dependencies → identifies which packages
   - Configuration issues → checks for common problems like:
     - Istanbul plugin running when it shouldn't (CI env var bug)
     - Wrong coverage gating conditions
     - Missing fixture files
   - CI vs local differences → examines GitHub Actions logs

4. **Verifies coverage setup**
   - `.nyc_output/` directory created during coverage runs
   - `coverage/` reports generated
   - Coverage excludes test files, fixtures, stories
   - HTML report opens and shows reasonable percentages

## When to Use This Skill

- After adding or modifying test infrastructure
- Before pushing changes that affect test configuration
- When CI tests fail but local tests pass
- When verifying Istanbul coverage integration
- Before creating a PR with test changes
- When tests mysteriously break after dependency updates

## Test Scripts This Skill Uses

| Script | What it does |
|--------|--------------|
| `npm run test:ct` | Component tests without coverage |
| `npm run test:ct:coverage` | Component tests with coverage (60s timeout) |
| `npm run test:e2e` | E2E tests without coverage |
| `npm run test:e2e:coverage` | E2E tests with coverage |

## Common Issues This Skill Catches

1. **Istanbul plugin running in CI when it shouldn't**
   - Symptom: 100+ CT test failures in CI, all pass locally
   - Cause: `process.env.CI` check in coverage gate
   - Fix: Remove `|| !!process.env.CI` from coverage conditions

2. **Missing Playwright browsers**
   - Symptom: "Executable doesn't exist at /home/.../.cache/ms-playwright/..."
   - Fix: `npx playwright install chromium`

3. **Port conflicts**
   - Symptom: Tests hang or fail to start dev server
   - Fix: Kill processes on ports 3100/3200

4. **Coverage timeout issues**
   - Symptom: Tests timeout with coverage but pass without
   - Fix: Check fixture auto-use scope, verify 60s timeout configured

5. **Stale dependencies**
   - Symptom: Tests fail with "Cannot find module" errors
   - Fix: `npm ci` in root and `packages/react-form-wizard/`

## Example Usage

```
/verify-tests
```

The skill will ask what you want to verify:
- Quick check (CT + e2e without coverage)
- Full verification (includes coverage runs)
- Diagnose CI failures (fetch and analyze GitHub Actions logs)
- Coverage only (just verify coverage setup works)

## Configuration Files This Skill Checks

- `playwright-ct.config.ts` - CT test configuration
- `playwright.config.ts` - e2e test configuration  
- `playwright/istanbul-plugin.cjs` - Istanbul instrumentation plugin
- `src/ct-fixture.ts` - CT coverage capture fixture
- `playwright/e2e/fixtures.ts` - e2e coverage capture fixture
- `.nycrc.json` - NYC coverage reporting config
- `.github/workflows/ci.yml` - CI pipeline test jobs

## Success Criteria

✅ All CT tests pass without coverage
✅ All e2e tests pass without coverage  
✅ All CT tests pass with coverage (if requested)
✅ All e2e tests pass with coverage (if requested)
✅ Coverage data collected in `.nyc_output/`
✅ Coverage reports generated in `coverage/`
✅ No unexpected failures in CI
✅ Test execution times reasonable (CT ~1-2min without coverage, ~18min with coverage)
