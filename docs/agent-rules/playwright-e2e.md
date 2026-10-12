# playwright e2e tests

rules for ROSA HCP wizard E2E specs under `playwright/e2e/`.

## layout

```text
playwright/
  e2e/
    fixtures.ts              # extends base test; optional coverage capture
    rosa-wizard.spec.ts      # wizard flows, CIDR, navigation
    rosa-wizard-yaml-editor.spec.ts
    helpers/
      yaml-editor-helpers.ts # navigateToYamlEditor, getMonacoYaml, step fillers
  index.tsx                  # E2E app entry
playwright.config.ts         # root E2E config (port ~3200)
```

Package context: [`packages/nxtcm-rosa-hcp-wizard/AGENTS.md`](../../packages/nxtcm-rosa-hcp-wizard/AGENTS.md).

CT selector rules also apply to E2E: see [`playwright-ct.md`](playwright-ct.md) (priority: `getByRole` > `getByLabel` > `getByText` > `getByTestId` > CSS).

## running

```bash
npm run test:e2e
npm run test:e2e:coverage   # COVERAGE=true + nyc report
npx playwright test playwright/e2e/rosa-wizard.spec.ts
```

## selector audit (static review)

When reviewing E2E specs, categorize locators:

| Category | Examples | Preference |
|----------|----------|------------|
| Accessibility-first | `getByRole`, `getByLabel`, `getByPlaceholder` | Preferred |
| Semantic | `getByText`, `getByAltText` | Good |
| Test ID | `getByTestId` | OK when component exposes stable id (e.g. installer role selects) |
| CSS/XPath `locator()` | `.pf-v6-*`, structural selectors | Avoid |

Flag:

- CSS class selectors tied to PatternFly internals
- `.first()` without a clear unique target
- Missing accessible names on custom controls (fix component or use documented `data-testid`)

### audit workflow

1. scan `playwright/e2e/**/*.ts` for `locator(` with CSS (especially `.pf-`), weak `getByTestId`, and `.first()` without scope.
2. report counts (role/label vs testId vs CSS) and file:line fixes.
3. apply minimal selector changes; run `npx playwright test` on touched files only.

## implementation patterns

### cross-field validation (CIDR)

Fill, **Tab** to blur (`onTouched` / validation), then assert error text:

```typescript
await openCidrFields(page);
await page.getByRole('textbox', { name: 'Machine CIDR' }).fill('10.0.0.0/16');
await page.getByRole('textbox', { name: 'Machine CIDR' }).press('Tab');
const serviceCidr = page.getByRole('textbox', { name: 'Service CIDR' });
await serviceCidr.fill('10.0.0.0/16');
await serviceCidr.press('Tab');
await expect(page.getByText(/overlaps.*Machine CIDR/i)).toBeVisible();
```

Reuse navigation helpers from `rosa-wizard.spec.ts` (`fillDetailsStep`, `openCidrFields`, etc.) or extract shared helpers to avoid duplication.

### state reset (VPC → subnet)

After changing VPC, assert dependent subnet control returns to placeholder/unselected state.

### review edit workflow

Fill wizard → review → **Edit** link for a step → change field → advance back to review → assert updated value.

### wizard navigation

Use step **Next** and sidebar links consistently; read [`packages/nxtcm-rosa-hcp-wizard/AGENTS.md`](../../packages/nxtcm-rosa-hcp-wizard/AGENTS.md) for step-gating vs validation (E2E exercises UI; schema rules live in Yup).

## monaco / yaml editor

See [`monaco-testing.md`](monaco-testing.md). E2E covers workflows; not debounced YAML validation via programmatic editor edits.

## adding tests

1. Prefer extending `rosa-wizard.spec.ts` or a focused `*.spec.ts` beside helpers
2. Extract repeated step flows to `helpers/`
3. Mock data comes from the E2E harness (`playwright/index.tsx`), not live APIs
4. Run targeted file before full suite: `npx playwright test playwright/e2e/rosa-wizard.spec.ts`

## what not to test in E2E

- Every Yup edge case (cover in Jest / CT)
- Monaco validation via `setValue` (see monaco-testing doc)
- Implementation details of `fieldMetaChangeEffects` (unit/registry tests)
