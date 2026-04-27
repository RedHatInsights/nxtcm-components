---
name: nxtcm-e2e-playwright
description: >-
  Writes and updates end-to-end Playwright tests under playwright/e2e using
  @playwright/test (not CT), with baseURL and Vite webServer from
  playwright.config. Use when adding e2e specs, user flows, test:e2e, full-app
  navigation, or mirroring rosa-wizard e2e patterns. Do not use this skill to
  run Playwright in the terminal unless the user asked to run or fix e2e.
---

# NXTCM e2e (Playwright)

E2E tests live in **`playwright/e2e/`** and use **`@playwright/test`**, not `@playwright/experimental-ct-react`.

Apply `.cursor/rules/core-standards.mdc` where it affects app wiring; e2e files focus on user-visible flows.

## Configuration

- [`playwright.config.ts`](../../../playwright.config.ts): `testDir: './playwright/e2e/'`, `baseURL: 'http://localhost:3200'`, `webServer` runs the Vite e2e app. Playwright starts the server unless one is already running (per `reuseExistingServer` and CI).
- E2E entry/build is [`vite.e2e.config.ts`](../../../vite.e2e.config.ts) (referenced by the `webServer` command in config).

**Do not** set up ad hoc servers; rely on the config for local and CI.

## Conventions

- **Imports**: `import { test, expect, type Page } from '@playwright/test'`.
- **New files**: place under `playwright/e2e/`, e.g. `playwright/e2e/feature-name.spec.ts`.
- **Navigation**: `page.goto('/')` or paths relative to `baseURL` as in existing specs.
- **Selectors**: prefer `getByRole`, `getByLabel`, `getByText` (with regex when stable over exact copy). Reserve `data-testid` for cases where roles/labels are insufficient.
- **Helpers**: async functions taking `Page` to repeat multi-step flows, named after the user journey (see patterns in the reference file).

## Reference file

- [`playwright/e2e/rosa-wizard.spec.ts`](../../../playwright/e2e/rosa-wizard.spec.ts) — `beforeEach` navigation, `test.describe` nesting, validation groups, and role-based locators.

## Command (for the user unless they asked to run it)

- `npm run test:e2e` — e2e suite (starts or reuses the dev server per config). **Do not** run it unless the user explicitly asked to execute e2e or fix a failing run; otherwise mention it in your reply.

## Checklist before finishing

- [ ] Spec uses `@playwright/test` imports only; no `mount` from CT.
- [ ] Locators are resilient and accessibility-friendly.
- [ ] Reused flow chunks are factored into `async function` helpers with `Page` as needed.
- [ ] Tell the user they can run `npm run test:e2e` (or a file filter) to verify; do **not** run it unless asked.
