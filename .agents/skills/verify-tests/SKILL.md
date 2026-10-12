---
name: verify-tests
description: >-
  Verify Playwright CT and E2E tests (with optional Istanbul coverage). Use after
  test infra changes, CI/local mismatches, or before pushing test config changes.
  Triggers: verify tests, test infrastructure, coverage not working, CI test failures.
---

# verify-tests

Tiered verification for component tests (~849) and E2E (~45). Deep troubleshooting: [`docs/agent-rules/test-verification.md`](../../../docs/agent-rules/test-verification.md).

## cost tiers

| Tier | What runs | When |
|------|-----------|------|
| **M** | CT smoke (1 grep) + optional coverage smoke + `nyc report` | Default — ask user if unclear |
| **L** | `npm run test:ct` + `npm run test:e2e` | User confirms full suite |
| **XL** | `npm run test:ct:coverage` + `npm run test:e2e:coverage` | **Explicit opt-in only** (slow) |

## workflow

1. **Prerequisites** — Playwright chromium installed; `npm ci` at repo root; ports 3100/3200 free.
2. **Ask tier** — M (smoke), L (full), XL (coverage), or diagnose CI (fetch Actions logs if requested).
3. **Run tier commands** (repo root):

**M — smoke**

```bash
rm -rf playwright/.cache && \
npx playwright test -c playwright-ct.config.ts --grep "CVECard.*should render the card with default title" --max-failures=1
```

Optional coverage path:

```bash
rm -rf playwright/.cache .nyc_output && \
COVERAGE=true npx playwright test -c playwright-ct.config.ts --grep "CVECard.*should render the card with default title" && \
npx nyc report --reporter=text-summary
```

**L — full**

```bash
npm run test:ct
npm run test:e2e
```

**XL — coverage** (confirm with user first)

```bash
npm run test:ct:coverage
npm run test:e2e:coverage
```

4. **Report** — exit codes, failing test names, and which troubleshooting section applies (cache, `COVERAGE`, fixture imports, CI env).

## scripts reference

| Script | Purpose |
|--------|---------|
| `npm run test:ct` | CT without coverage |
| `npm run test:ct:coverage` | CT with coverage + NYC |
| `npm run test:e2e` | E2E without coverage |
| `npm run test:e2e:coverage` | E2E with coverage + NYC |

## success criteria

- M: smoke CT passes; if coverage smoke requested, `.nyc_output/` exists and `nyc report` succeeds
- L: both full commands exit 0
- XL: coverage commands exit 0 with reasonable summary percentages
