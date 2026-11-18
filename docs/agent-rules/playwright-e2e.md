# playwright e2e tests

rules for ROSA HCP wizard E2E specs under `playwright/e2e/`.

## layout

```text
playwright/
  e2e/
    fixtures.ts              # extends base test; optional coverage capture
    rosa-wizard.spec.ts      # wizard flows, CIDR, navigation
    rosa-wizard-yaml-editor.spec.ts
    rosa-wizard-yaml-editor-keyboard.spec.ts # keyboard-only YAML editor flows
    rosa-wizard-keyboard.spec.ts # keyboard navigation, validation focus, and Skip to review focus
    helpers/
      yaml-editor-helpers.ts # navigateToYamlEditor, navigateToReview, enterYamlEditor, getMonacoYaml, fill*Step helpers
      focus-helpers.ts       # tabUntilFocused, expectFocusVisible
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

Native E2E runs exclude `*-visual.spec.ts` files. Run screenshot comparisons in the
pinned Linux container with `npm run test:visual`, or run the full suite including
visual specs with `npm run test:e2e:container`. Use `npm run test:visual:update` to
regenerate intentional baseline changes. The container runner sets
`PLAYWRIGHT_INCLUDE_VISUAL_TESTS=true` internally to include visual specs in either mode.

## visual regression coverage

`rosa-wizard-visual.spec.ts` covers the initial wizard viewport, the Details form,
Roles and policies, Machine pool, Networking, Encryption, Cluster updates, and the
populated Review step. It also captures Details required-field errors after **Next**
and the open OpenShift version dropdown. Each test starts from a fresh wizard and
uses the mock data in `e2e-app/e2e.tsx`.

Conditional-state coverage includes autoscaling min/max inputs, expanded advanced
machine pool settings, private endpoint access, overlapping CIDR validation,
custom KMS and etcd required-field errors, manual updates, and the open update-day
dropdown. Autoscaling, advanced machine pool, CIDR errors, and custom encryption
screenshots capture the entire step form, including fields below the viewport.

Viewport screenshots capture the top of the desktop viewport (1280 × 720), with
the surrounding wizard layout; content below a scroll boundary is not included.
Tests wait for the intended state and fonts, reset scroll positions, and use the
shared animation, caret, and comparison settings from `playwright.config.ts`.
The Roles step uses a fixed custom operator-role prefix entered through the UI,
so its CLI command and the Review summary remain identical across runs.

```bash
npm run test:visual                          # compare committed baselines
npm run test:visual:update                   # regenerate intentional changes
npm run test:visual -- --reporter=list,html   # generate a report for inspection
PLAYWRIGHT_REACT_VERSION=18 npm run test:e2e:container
PLAYWRIGHT_REACT_VERSION=19 npm run test:e2e:container
```

Generate baselines only in the pinned container. Inspect every added or changed PNG
under `playwright/e2e/rosa-wizard-visual.spec.ts-snapshots/` before committing, then
run `npm run test:visual` again without updates. Investigate unexpected differences
using the HTML report and actual/expected/diff images; do not regenerate baselines
just to clear a failure. CI compares the same baselines with React 18 and React 19
and never updates them.

## selector audit (static review)

When reviewing E2E specs, categorize locators:

| Category              | Examples                                      | Preference                                                        |
| --------------------- | --------------------------------------------- | ----------------------------------------------------------------- |
| Accessibility-first   | `getByRole`, `getByLabel`, `getByPlaceholder` | Preferred                                                         |
| Semantic              | `getByText`, `getByAltText`                   | Good                                                              |
| Test ID               | `getByTestId`                                 | OK when component exposes stable id (e.g. installer role selects) |
| CSS/XPath `locator()` | `.pf-v6-*`, structural selectors              | Avoid                                                             |

Flag:

- CSS class selectors tied to PatternFly internals
- `.first()` without a clear unique target
- Missing accessible names on custom controls (fix component or use documented `data-testid`)

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

See [`YamlEditor/AGENTS.md`](../../packages/nxtcm-rosa-hcp-wizard/src/Steps/YamlEditor/AGENTS.md). E2E covers workflows; not debounced YAML validation via programmatic editor edits.

## adding tests

1. Prefer extending `rosa-wizard.spec.ts` or a focused `*.spec.ts` beside helpers
2. Extract repeated step flows to `helpers/`
3. Mock data comes from the E2E harness (`playwright/index.tsx`), not live APIs
4. Run targeted file before full suite: `npx playwright test playwright/e2e/rosa-wizard.spec.ts`

## what not to test in E2E

- Every Yup edge case (cover in Jest / CT)
- Monaco validation via `setValue` (see [`YamlEditor/AGENTS.md`](../../packages/nxtcm-rosa-hcp-wizard/src/Steps/YamlEditor/AGENTS.md))
- Implementation details of `fieldMetaChangeEffects` (unit/registry tests)
