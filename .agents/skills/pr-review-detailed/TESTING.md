# Test review checklist (language & framework agnostic)

For changed tests, helpers, and mocks in §5 scope.

Repo- and stack-specific test conventions → companion files in [REPO_SPECIFIC/](REPO_SPECIFIC/) (when present).

---

## 1. Coverage & verification gate

| Situation | Where | Rule |
|-----------|-------|------|
| Test **command failed** (lint/types/build/test script you ran) | **Verification stop** | Fix per [REPO_SPECIFIC/VERIFICATION.md](REPO_SPECIFIC/VERIFICATION.md); do not proceed to review checklists until affected commands pass |
| **Missing** tests for changed logic | **Finding** (T12) | Report in §11 — **not** a verification failure when test commands passed or were skipped |
| **Weak** tests (exist but do not prove behavior or miss meaningful branches) | **Finding** (T3, T10) | Report in §11 — same rule |

**Missing or weak coverage never blocks verification (§1)** unless a test command you ran failed.

When production code changes in §5 with no matching test updates, report **T12**. When tests exist but only smoke-check setup (initialize fixture, invoke, no meaningful assert), report **T3**.

---

## 2. Checklist

| # | Check |
|---|--------|
| T1 | **One behavior per test** — each test case asserts a single outcome; prefer **multiple focused tests** over one test that exercises several features or branches |
| T2 | **AAA structure** — **Arrange** setup, **Act** (one action or call), **Assert** expected result; keep the three phases visible (blank lines or comments only when order is not obvious) |
| T3 | **Tests prove the feature** — each test would **fail** if the behavior regressed; no tests that only invoke code or set up fixtures without a meaningful assertion |
| T4 | **Reuse mocks & helpers** — use existing test utils, wrappers, factories, and fixture patterns from the repo; **new shared mocks/helpers go in a separate file** — not duplicated inline across test files |
| T5 | **Descriptive names** — name states **condition + expected outcome** (e.g. `returns empty array when input is null`); not `works`, `test 1`, or opaque abbreviations |
| T6 | **Mock at boundaries** — stub HTTP/API/module/external-service boundaries; do not over-mock internals unless the repo pattern requires it |
| T7 | **Deterministic data** — fixed dates, ids, and fixtures; no unseeded randomness or reliance on execution order across tests |
| T8 | **No flaky patterns** — no arbitrary sleeps, race-prone waits with weak conditions, or tests depending on other tests' side effects |
| T9 | **Setup proportionality** — shared setup in suite hooks or helpers; test-specific Arrange stays in the test so intent stays readable |
| T10 | **Error & edge paths** — when behavior handles failure, empty, or loading states, tests cover **meaningful** branches (align with [GENERAL.md](GENERAL.md) #10 — not exhaustive impossible edges) |
| T11 | **Cleanup & isolation** — no leaked timers, open handles, or global mutations; restore mocks/timers after the test |
| T12 | **New/changed logic covered** — diff adds or updates behavior → corresponding tests exist, or gap is reported |

---

## 3. Anti-patterns (flag in review)

| Pattern | Problem | Prefer |
|---------|---------|--------|
| One test checks setup + action + side effect + unrelated assertion | Hard to diagnose failures; violates T1 | Split into focused tests |
| Large inline mock duplicated across test files | Noise; not reusable | Extract to shared mock/helper file (T4) |
| Assert only that code runs without error | Proves execution, not behavior | Assert outputs, state, or observable outcomes (T3) |
| Testing third-party library defaults | Not your code | Test your wiring and contract at boundaries only |

**Test severity:** **major** — wrong/missing logic coverage, would pass on regression · **medium** — multiple behaviors per test, implementation-coupled assertions, duplicated setup · **minor** — naming, AAA readability, helper extraction
