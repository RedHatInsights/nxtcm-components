# Unit & component test review checklist

For changed tests, helpers, and mocks in §5 scope.

Apply [TESTING.md](../TESTING.md) first (T1–T12). Runs under SKILL.md **§9** (REPO_SPECIFIC). Adds **UI stack** test conventions for this skill's default repos.

| Type | File pattern | Runner | What it covers |
|------|--------------|--------|----------------|
| **Playwright component tests** | `*.spec.tsx` | `npm run test:ct` | React components (mount, interact, assert in browser) |
| **Jest unit tests** | `*.test.ts` | `npm test` | TypeScript logic — utils, hooks, parsers, non-UI modules |

Run Playwright CT during [verification](../REPO_SPECIFIC/VERIFICATION.md) when the repo defines `test:ct`. Coverage gaps → [TESTING.md](../TESTING.md) §1.

---

## 1. Colocation & naming

| # | Check |
|---|--------|
| U18 | **Colocation & naming** — `Component.spec.tsx` beside `Component.tsx`; `util.test.ts` beside `util.ts` (or repo `__tests__/` convention) |

---

## 2. Playwright component tests (`*.spec.tsx`)

For React components mounted with Playwright CT (`mount`, `test:ct`).

| # | Check |
|---|--------|
| CT1 | **Query like a user** — prefer **`getByRole`**, `getByLabel`, `getByText`, `getByPlaceholder`; use `getByTestId` only when no accessible query works; **avoid** CSS class selectors (`.pf-c-button`), tag-only locators, and DOM structure (`locator('div > span:nth-child(2)')`, parent/child chains) |
| CT2 | **Assert behavior, not implementation** — test visible copy, roles, enabled/disabled state, and callback outcomes — not internal React state, private methods, or component instance details |
| CT3 | **Mount & props** — use repo `mount` helpers/wrappers; default props via shared fixtures; override only what the test needs in Arrange |
| CT4 | **Interactions** — use Playwright **`click`**, `fill`, `press`, `check` on locators; avoid low-level DOM events unless testing a specific keyboard edge case |
| CT5 | **Async done right** — `await expect(locator).toBeVisible()` / `toHaveText()` / `toBeEnabled()`; use Playwright auto-waiting; avoid bare `setTimeout` or fixed `page.waitForTimeout` except when the repo documents a required delay |
| CT6 | **Presence vs absence** — assert visible/enabled with `toBeVisible()` / `toBeEnabled()`; assert **not** shown with `toBeHidden()` / `not.toBeVisible()` / `toHaveCount(0)` — not a query that throws |
| CT7 | **Scoped locators** — narrow with `getByRole('dialog')` then `getByRole('button', { name: ... })`, or `locator.filter({ hasText: ... })`, instead of page-wide queries that match the wrong node |
| CT8 | **Snapshots sparingly** — large screenshot or DOM snapshots are brittle; prefer role/text/state assertions |
| CT9 | **Accessibility hooks** — when repo uses `checkAccessibility` or axe in CT, keep it on changed interactive UI; static a11y markup review → [ACCESSIBILITY.md](../UI/ACCESSIBILITY.md) |

**Playwright CT severity:** **major** — wrong assertions, would pass on regression, missing CT for new component behavior · **medium** — multiple behaviors per test, CSS/structure locators, duplicated mount setup, weak assertions · **minor** — naming, AAA readability, helper extraction

---

## 3. Jest unit tests (`*.test.ts`)

For pure TypeScript — no Playwright `mount`. Assert return values, thrown errors, and side effects at module boundaries.

| # | Check |
|---|--------|
| J1 | **Assert outputs & contracts** — test return values, thrown errors, and emitted events/callback args — not how the implementation computes them step-by-step |
| J2 | **No DOM unless necessary** — `.test.ts` files test logic directly; UI behavior belongs in the matching `*.spec.tsx`, not duplicated in Jest |
| J3 | **Mock imports consistently** — follow repo Jest mock patterns (`jest.mock`, manual mocks in `__mocks__`); reset mocks in `beforeEach`/`afterEach` when tests mutate them |
| J4 | **Async Jest** — `async/await` with `rejects.toThrow` / `resolves`; no floating promises or unhandled rejections |
| J5 | **Table-driven when appropriate** — `[].forEach` or `it.each` for many input/output pairs of the **same** behavior (still one logical concern per test case) |

**Jest severity:** same mapping as [TESTING.md](../TESTING.md) — **major** for wrong/missing logic coverage; **medium** for weak or implementation-coupled assertions

---

## 4. Anti-patterns (UI stack — flag in review)

| Pattern | Problem | Prefer |
|---------|---------|--------|
| `page.locator('.pf-c-button')` or `locator('div.card > button')` | Breaks on markup/CSS; not user-centric | `getByRole('button', { name: /save/i })` (CT1) |
| `data-testid` on every element | Bypasses accessibility; last resort | Role/label/text locators first (CT1) |
| Assert only `toBeVisible()` on root mount | Proves mount, not behavior | Assert copy, role state, or callback args (CT2) |
| Same component behavior tested in both `*.spec.tsx` and `*.test.ts` | Drift and duplicate maintenance | CT for UI; Jest for pure TS (J2) |
| Jest test imports and mounts React for full UI | Wrong runner for component UI | Add/update `Component.spec.tsx` instead |
| `page.waitForTimeout(3000)` | Flaky; hides real wait condition | `expect(locator).toBeVisible()` or event-driven wait (CT5) |

---

## 5. Quick scan (changed test files)

From repo root (`BASE` defaults to `main`, same as §3):

**Playwright component tests:**

```bash
BASE="${BASE:-main}"
git diff --name-only "$BASE"...HEAD -- '*.spec.tsx'
```

**Jest unit tests:**

```bash
BASE="${BASE:-main}"
git diff --name-only "$BASE"...HEAD -- '*.test.ts' '**/__mocks__/**'
```

For each changed `*.spec.tsx`, spot-check: **T1**, **T2**, **CT1**, **CT2**, **T3**, **T4**.

For each changed `*.test.ts`, spot-check: **T1**, **T2**, **J1**, **J2**, **T3**, **T4**.
