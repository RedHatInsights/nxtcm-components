# test verification and coverage infrastructure

reference for Playwright CT/E2E runs, Istanbul coverage, and common failure modes. use the **verify-tests** skill for tiered execution; this doc holds troubleshooting detail.

## suite scale (approximate)

| Suite | Command | Scale |
|-------|---------|-------|
| Component tests (CT) | `npm run test:ct` | ~849 tests in 63 files |
| E2E | `npm run test:e2e` | ~45 tests in 2 files |
| CT + coverage | `npm run test:ct:coverage` | same CT count; slower build |
| E2E + coverage | `npm run test:e2e:coverage` | same E2E count |

## smoke grep (infrastructure check)

Use a single fast CT test to verify the pipeline without running the full suite:

```bash
rm -rf playwright/.cache && \
npx playwright test -c playwright-ct.config.ts --grep "CVECard.*should render the card with default title" --max-failures=1
```

Coverage instrumentation smoke:

```bash
rm -rf playwright/.cache .nyc_output && \
COVERAGE=true npx playwright test -c playwright-ct.config.ts --grep "CVECard.*should render the card with default title" && \
ls -la .nyc_output/
```

Then:

```bash
npx nyc report --reporter=text-summary
```

## configuration files

- `playwright-ct.config.ts` — CT config, Istanbul plugin loading
- `playwright.config.ts` — E2E config
- `playwright/istanbul-plugin.cjs` — custom Istanbul/Vite plugin (not `vite-plugin-istanbul` v8+)
- `ct-fixture.ts` — writes Istanbul JSON after each CT. Only specs that `import { test } from '@/ct-fixture'` run this fixture. Specs that import `@playwright/experimental-ct-react` directly do not (most wizard specs).
- `playwright/e2e/fixtures.ts` — E2E coverage capture
- `.nycrc.json` — NYC reporting
- `.github/workflows/ci.yml` — CI test jobs

## ports and prerequisites

- CT dev server port: **3100**; E2E: **3200** — kill conflicting processes if tests hang on startup
- Browsers: `npx playwright install chromium` if executable missing
- Dependencies: `npm ci` at repo root (workspaces)

## common issues

### Istanbul plugin running when it should not

- **Symptom:** many CT failures in CI, all pass locally
- **Cause:** `process.env.CI` incorrectly gates coverage instrumentation
- **Fix:** remove `|| !!process.env.CI` from coverage enable conditions

### No `.nyc_output` after coverage run

1. Stale Playwright cache — `rm -rf playwright/.cache .nyc_output`
2. Plugin not in `playwright-ct.config.ts` plugins array
3. `COVERAGE=true` not set for coverage scripts
4. The spec does not import `@/ct-fixture`. Coverage JSON is written only by that fixture (`{ auto: true, scope: 'test' }` in `ct-fixture.ts`). A wizard spec that imports `@playwright/experimental-ct-react` can pass with instrumentation on and still leave `.nyc_output/` empty. The CVECard smoke spec does import `@/ct-fixture`.

### Coverage at 0% or 100%

- Check `playwright/istanbul-plugin.cjs` include/exclude patterns vs workspace layout
- Verify instrumentation runs and fixtures write JSON under `.nyc_output/`

### Tests timeout with coverage only

- Istanbul adds build overhead; CT coverage script uses extended timeout in `package.json`
- For wizard-heavy specs, consider per-test timeout increases when `COVERAGE=true`

### Module resolution after rebase

- Path aliases in `playwright-ct.config.ts` for `@/` and workspace packages
- `npm install` to refresh workspace links

### `vite-plugin-istanbul` ES module errors

Use `playwright/istanbul-plugin.cjs` (already in repo); official plugin v8+ is ESM-only and incompatible with CT config compilation.

## success criteria (full verification)

- CT without coverage: exit 0
- E2E without coverage: exit 0
- Optional coverage: `.nyc_output/` populated, `nyc report` shows reasonable percentages (not all 0% or 100%)
- CI jobs green for the changed branch
