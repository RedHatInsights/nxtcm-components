# Playwright E2E Tests

This directory contains Playwright end-to-end tests converted from Cypress tests.

## Converted Tests

The following tests have been converted from Cypress to Playwright:

### Simple Display Tests
- **application.spec.ts** - Tests the application wizard display ✅
- **rosa.spec.ts** - Tests the ROSA wizard display ✅
- **argo.spec.ts** - Tests the Argo CD wizard display and name input ✅

### Workflow Tests
- **ansible.spec.ts** - Complete Ansible automation workflow with prehooks and posthooks ✅
- **policy.spec.ts** - Complete policy creation workflow with annotations
- **credentials.spec.ts** - Complete AWS credentials workflow with YAML validation
- **input.spec.ts** - Comprehensive inputs wizard testing all input types

### Policy Automation Tests
- **create-policy-automation.spec.ts** - Create policy automation workflow with YAML validation
- **edit-policy-automation.spec.ts** - Edit policy automation workflow with mode changes

### Policy Set Tests
- **create-policy-set.spec.ts** - Create policy set workflow with placement and bindings
- **edit-policy-set.spec.ts** - Edit policy set workflow with existing data

## Key Differences from Cypress

### URL Changes
- Cypress: `http://localhost:3000/?route=...`
- Playwright: `http://localhost:3000/wizards/?route=...`

### Selector Changes
1. **Button with aria-label**: Changed from `.getByRole('button', { name: 'Add job template' })` to `.locator('#add-button')` because buttons have `aria-label="Action"`
2. **Toggle buttons**: Changed from `.locator('.pf-v5-c-form__field-group-toggle .pf-v5-c-button')` to `.getByRole('button', { name: 'Details' })`
3. **Multiple buttons with same ID**: Use `.last()` to select the last occurrence

### Common Patterns

#### Basic wizard navigation:
```typescript
await page.goto('http://localhost:3000/wizards/?route=wizard-name');
await page.locator('#nav-toggle').click();
await page.locator('#yaml-switch').click({ force: true });
await expect(page.locator('h1')).toContainText('Wizard Title');
```

#### Form filling:
```typescript
await page.locator('#field-id').fill('value');
await page.locator('#dropdown-id').click();
await page.locator('#option-id').click();
```

#### Navigation buttons:
```typescript
await page.getByRole('button', { name: 'Next' }).click();
await page.getByRole('button', { name: 'Back' }).click();
await page.getByRole('button', { name: 'Submit' }).click();
```

#### Adding array items:
```typescript
// First item
await page.locator('#section-id').locator('#add-button').click();

// Second item (when multiple #add-button exist)
await page.locator('#section-id').locator('#add-button').last().click();
```

#### YAML validation:
```typescript
import YAML from 'yaml';

const expected = { /* your expected structure */ };
const yaml = YAML.stringify(expected);
await expect(page.locator('#yaml-editor')).toHaveText(yaml);
```

## Running Tests

Run all tests:
```bash
npm run test:e2e
```

Run specific test:
```bash
npm run test:e2e -- ansible.spec.ts
```

Run multiple tests:
```bash
npm run test:e2e -- application.spec.ts rosa.spec.ts argo.spec.ts
```

## Test Server Configuration

The tests automatically start the wizard server before running (configured in `playwright.config.ts`):
- Server: `http://localhost:3000/wizards/`
- Command: `npm run start` in `packages/react-form-wizard`
- Timeout: 120 seconds
- Reuses existing server in non-CI environments

## Notes

- Some tests may require specific test data that is provided by the wizard examples
- Tests run in parallel by default (configured in playwright.config.ts)
- The webServer configuration ensures the wizard app is running before tests execute
- All tests use the Chromium browser by default

