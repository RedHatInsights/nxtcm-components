---
name: nxtcm-component-tests
description: >-
  Writes and updates Playwright component tests in co-located *.spec.tsx
  using @playwright/experimental-ct-react (not Jest). Use when creating or
  changing component tests, .spec.tsx files, test:ct, accessibility on mounted
  components, or when mirroring test patterns from ResourceUtilization or
  ConsoleBreadcrumbs specs. Do not use this skill to run the terminal; only
  when writing or editing spec files unless the user asked to run tests.
---

# NXTCM component tests (Playwright CT)

This repository uses **Playwright Component Testing** for `*.spec.tsx` files, **not** Jest. Jest is configured in `jest.config.js` with `testPathIgnorePatterns` that exclude `\.spec\.` — Rely on CT for component-level tests.

Apply `.cursor/rules/testing.mdc` and `.cursor/rules/core-standards.mdc`.

## Conventions

- **Imports**: `import { test, expect } from '@playwright/experimental-ct-react'` and the component under test. Use `React` in JSX as in existing files.
- **API**: `mount` returns a `component` handle; use `component.getByRole`, `getByTestId`, etc. Use `page` from the test when you need the full page (e.g. `getByRole` on document).
- **Structure**: `test.describe('ComponentName', () => { ... })`; clear test names describing user-visible behavior.
- **Location**: `ComponentName.spec.tsx` co-located with `ComponentName.tsx` under `src/`.
- **Config**: Tests are selected by `playwright-ct.config.ts` with `testMatch: '**/*.spec.tsx'`.

## Accessibility

Import `checkAccessibility` from the correct relative path to `src/test-helpers` (depth depends on folder nesting — copy the import style from a sibling `*.spec.tsx` in the same or parent `components` tree). Example usage appears in:

- [`src/components/ConsoleBreadcrumbs/ConsoleBreadcrumbs.spec.tsx`](../../../src/components/ConsoleBreadcrumbs/ConsoleBreadcrumbs.spec.tsx)

## Complex components

- For wizards or large forms, if `*spec-helpers*.tsx` exists in that area, use shared mount wrappers and mock data from there instead of duplicating large inline trees (see the Rosa wizard folder).

## Reference files

| Style | File |
|-------|------|
| Donuts, `getByTestId`, text assertions | [`src/components/dashboard/ResourceUtilization/ResourceUtilization.spec.tsx`](../../../src/components/dashboard/ResourceUtilization/ResourceUtilization.spec.tsx) |
| a11y, `page` + `mount`, `MockLinkComponent` | [`src/components/ConsoleBreadcrumbs/ConsoleBreadcrumbs.spec.tsx`](../../../src/components/ConsoleBreadcrumbs/ConsoleBreadcrumbs.spec.tsx) |

## Commands (for the user, not the agent by default)

These verify what you wrote; **tell the user** they can run them. **Do not** run them in the terminal unless the user explicitly asked to run or fix tests.

- `npm run test:ct` — all component tests.
- `npm run test:ct:watch` — UI mode.
- `npm run test:ct:debug` — debug.
- `npm run test:all` — Jest (if any) **and** `test:ct`.

## Checklist before finishing

- [ ] No Jest or `@testing-library` imports for new `*.spec.tsx` in this project unless a separate Jest `*.test.tsx` is explicitly required for pure utils (rare; see `jest.config.js` `testMatch`).
- [ ] Assert behavior, not implementation details; use roles and labels where possible.
- [ ] Suggest the commands above in the message to the user; do **not** run them unless the user asked for execution.
