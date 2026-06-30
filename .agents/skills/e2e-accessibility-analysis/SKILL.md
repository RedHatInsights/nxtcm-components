---
skill: e2e-accessibility-analysis
description: Analyze E2E Playwright tests for accessibility best practices and identify opportunities to replace brittle selectors
version: 1.0.0
tags: [testing, accessibility, e2e, playwright, analysis]
---

# e2e-accessibility-analysis

Analyzes E2E Playwright tests to ensure they follow accessibility-first testing patterns using `getByRole`, `getByLabel`, and other semantic selectors instead of brittle CSS selectors or test IDs.

## When to Use This Skill

- After adding new E2E tests to verify they use accessibility selectors
- Before refactoring E2E tests to improve selector patterns
- When investigating why E2E tests are brittle or breaking frequently
- To audit test quality and adherence to Playwright best practices
- When component accessibility changes may affect test selectors

## What This Skill Analyzes

### 1. Selector Usage Metrics

Counts and categorizes all selectors in E2E tests:
- **`getByRole()`** - Accessibility-first (BEST)
- **`getByLabel()`** - Accessibility-first (BEST)
- **`getByPlaceholder()`** - Accessibility-first (GOOD)
- **`getByText()`** - Semantic selector (GOOD)
- **`getByAltText()`** - Semantic selector (GOOD)
- **`getByTitle()`** - Semantic selector (GOOD)
- **`getByTestId()`** - Implementation detail (AVOID)
- **`locator()` with CSS** - Brittle selector (AVOID)
- **`locator()` with XPath** - Very brittle (AVOID)

### 2. Accessibility Best Practices

Checks tests for:
- ✅ Human-readable selector names (not IDs, classes, XPath)
- ✅ Semantic HTML roles used for interactions
- ✅ Assertions based on visible text or accessible names
- ✅ Patterns that match how users interact (click buttons, type in textboxes)
- ❌ Brittle selectors tied to implementation (CSS classes, form IDs)
- ❌ Overly-specific selectors requiring DOM structure knowledge

### 3. Component Accessibility Gaps

Identifies when tests **must** use CSS selectors due to missing accessible names in components:
- Components without proper `aria-label` or visible labels
- Dropdowns/selects without accessible names on toggle buttons
- Custom widgets that don't expose semantic roles
- PatternFly components missing accessibility props

### 4. Comparison with Best Practices

Compares current test patterns against:
- Playwright official recommendations
- WCAG testing guidelines
- Component test patterns in this repo (for consistency)
- Historical patterns (e.g., comparing with main branch)

## Analysis Output

### Metrics Report

```
E2E Accessibility Metrics
=========================
Total selectors: 65
✅ Accessibility-first: 61 (93.8%)
⚠️  CSS selectors: 4 (6.2%)
❌ Test IDs: 0 (0%)

Breakdown:
- getByRole(): 61
- getByText(): 12  
- locator() with CSS: 4
- .first() usage: 9
```

### Issues Found

Lists specific problems with file paths and line numbers:

```
⚠️ CSS Selectors Found (4 instances)

File: playwright/e2e/rosa-wizard.spec.ts

Lines 18, 20: fillRolesStep() function
  locator('#installer_role_arn-form-group .pf-v6-c-menu-toggle')
  locator('#byo_oidc_config_id-form-group .pf-v6-c-menu-toggle')
  
Lines 77, 79, 82: Main test flow
  (Same selectors repeated in test body)

Reason: WizSelect components lack accessible names on toggle buttons
Fix Required: Component-level (not test-level)
```

### Recommendations

Prioritized action items:

```
🔴 Priority 1: Fix Component Accessibility
   - Add proper aria-label to Select/MenuToggle
   - Files: packages/nxtcm-rosa-hcp-wizard/src/components/Fields/Select/Select.tsx
   
🟡 Priority 2: Update Tests After Component Fix
   - Replace 4 CSS selectors with getByRole('button', { name: '...' })
   - Files: playwright/e2e/rosa-wizard.spec.ts
   
🟢 Priority 3: Add Automated Accessibility Testing
   - Integrate axe-core for automated WCAG checking
   - Add to CI pipeline
```

## How to Run Analysis

### Quick Analysis

Check current accessibility selector usage:

```bash
# Count getByRole usage
grep -o "getByRole" playwright/e2e/**/*.spec.ts | wc -l

# Count CSS locator usage  
grep -o "locator(" playwright/e2e/**/*.spec.ts | wc -l

# Find all CSS selector usage with context
grep -n "locator(" playwright/e2e/**/*.spec.ts
```

### Compare with Main Branch

See if accessibility patterns regressed:

```bash
# View main branch E2E tests
git show origin/main:playwright/e2e/rosa-wizard.spec.ts | grep -c "getByRole"
git show origin/main:playwright/e2e/rosa-wizard.spec.ts | grep -c "locator("

# Compare with current branch
git diff origin/main HEAD -- playwright/e2e/rosa-wizard.spec.ts | grep -E "^[+-].*getByRole|^[+-].*locator"
```

### Full Audit

Comprehensive analysis of all E2E tests:

```bash
# Run all E2E tests to verify they work
npm run test:e2e

# Generate selector usage report
for file in playwright/e2e/**/*.spec.ts; do
  echo "=== $file ==="
  echo "getByRole: $(grep -c "getByRole" "$file" || echo 0)"
  echo "getByLabel: $(grep -c "getByLabel" "$file" || echo 0)"
  echo "getByText: $(grep -c "getByText" "$file" || echo 0)"
  echo "locator(): $(grep -c "locator(" "$file" || echo 0)"
  echo "getByTestId: $(grep -c "getByTestId" "$file" || echo 0)"
  echo ""
done
```

## Known Issues (as of 2026-06-22)

### Issue 1: WizSelect Missing Accessible Names

**Status:** Component accessibility gap  
**Affected Tests:** `rosa-wizard.spec.ts` (4 CSS selectors)

**Problem:** 
The `Select` component's `MenuToggle` only sets `aria-label` conditionally:

```typescript
// Select.tsx line 311
const plainToggleAriaLabel = !toggleLabel && !isLoading ? placeholderText : undefined;

<MenuToggle
  aria-label={plainToggleAriaLabel}  // undefined when value selected or loading
  ...
>
```

**Impact:**
- Installer role dropdown has no accessible name
- OIDC config ID dropdown has no accessible name  
- E2E tests must use CSS selectors: `locator('#installer_role_arn-form-group .pf-v6-c-menu-toggle')`

**Attempted Fixes:**
1. ❌ `getByRole('combobox', { name: 'Select an Installer role' })` - Wrong role (it's a button)
2. ❌ `getByRole('button', { name: 'Select an Installer role' })` - Accessible name not present

**Proper Fix (Component Team):**

```diff
// Select.tsx
- const plainToggleAriaLabel = !toggleLabel && !isLoading ? placeholderText : undefined;
+ const toggleAriaLabel = plainToggleAriaLabel || label || placeholderText;

<MenuToggle
-  aria-label={plainToggleAriaLabel}
+  aria-label={toggleAriaLabel}
   ...
>
```

**Then Update Tests:**

```diff
- await page.locator('#installer_role_arn-form-group .pf-v6-c-menu-toggle').click();
+ await page.getByRole('button', { name: 'Installer role' }).click();
```

### Issue 2: Main Branch Comparison

**Question:** Did main branch E2E tests use accessibility selectors?

**Finding:** Main branch used `getByRole('combobox')` which also doesn't work with current components.

**Possible Scenarios:**
1. Component was refactored between main and current branch, breaking accessibility
2. Main branch tests were already broken (not caught in CI)
3. Different component props were passed on main branch

**Investigation Needed:** Check out main and run `npm run test:e2e` to verify.

## Best Practices Reference

### Selector Priority (Playwright Recommended)

1. **`getByRole()`** - ALWAYS prefer when possible
   ```typescript
   page.getByRole('button', { name: 'Submit' })
   page.getByRole('textbox', { name: 'Email' })
   page.getByRole('checkbox', { name: 'Accept terms' })
   ```

2. **`getByLabel()`** - For form fields with explicit labels
   ```typescript
   page.getByLabel('Email address')
   ```

3. **`getByPlaceholder()`** - When placeholder is the identifier
   ```typescript
   page.getByPlaceholder('Enter your email')
   ```

4. **`getByText()`** - For visible text (buttons, headings, etc.)
   ```typescript
   page.getByText('Submit')
   ```

5. **`getByTestId()`** - ONLY when no semantic alternative exists
   ```typescript
   // Avoid this if possible
   page.getByTestId('submit-button')
   ```

6. **`locator()`** - LAST RESORT for CSS/XPath
   ```typescript
   // Avoid - tied to implementation
   page.locator('#form-group-id .submit-button')
   ```

### Examples from This Repo

**Good (Accessibility-First):**
```typescript
// Using semantic roles and names
await page.getByRole('textbox', { name: 'Cluster name' }).fill('test-cluster');
await page.getByRole('combobox', { name: 'Select an OpenShift version' }).click();
await page.getByRole('option', { name: 'OpenShift 4.12.0' }).click();
await page.getByRole('button', { name: 'Next' }).click();

// Using visible text for assertions
await expect(page.getByText('Required')).toBeVisible();
await expect(page.getByText(/isn't valid CIDR notation/)).toBeVisible();
```

**Bad (Brittle CSS Selectors):**
```typescript
// Tied to PatternFly internal classes and form IDs
await page.locator('#installer_role_arn-form-group .pf-v6-c-menu-toggle').click();
await page.locator('.pf-v6-c-form-group #field-id').fill('value');

// Breaks when PatternFly updates or IDs change
```

**Necessary Workaround (Component Gap):**
```typescript
// When component lacks accessible name, CSS selector is pragmatic
// BUT: File a component issue to add proper accessibility
await page.locator('#field-without-label .toggle-button').click();
// TODO: Update to getByRole after component fix
```

## Adding Automated Accessibility Testing

Once component accessibility gaps are fixed, add axe-core automated testing:

### 1. Add axe-core Test

```typescript
// playwright/e2e/rosa-wizard.spec.ts
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('wizard should have no WCAG violations', async ({ page }) => {
    // Test Details step
    await expect(page.getByRole('textbox', { name: 'Cluster name' })).toBeVisible();
    const detailsResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(detailsResults.violations).toHaveLength(0);
    
    // Navigate and test Roles step
    await fillDetailsStep(page);
    const rolesResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(rolesResults.violations).toHaveLength(0);
    
    // Continue for all wizard steps...
  });
});
```

### 2. Run Accessibility Tests

```bash
npm run test:e2e -- --grep "Accessibility"
```

### 3. Review Violations

If violations are found, axe-core provides detailed reports:

```
Accessibility violations detected:

Rule: button-name
Description: Buttons must have discernible text
Impact: critical
Help: https://dequeuniversity.com/rules/axe/4.4/button-name
Nodes:
  - <button class="pf-v6-c-menu-toggle"></button>
    Fix: Add aria-label or visible text
```

## References

- [Playwright Locators Guide](https://playwright.dev/docs/locators)
- [WCAG Testing Guidelines](https://www.w3.org/WAI/test-evaluate/)
- [PatternFly Accessibility](https://www.patternfly.org/accessibility/accessibility-fundamentals)
- [axe-core Playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)

## Success Criteria

A well-tested E2E suite should have:

- ✅ **≥90%** accessibility-first selectors (`getByRole`, `getByLabel`, etc.)
- ✅ **<5%** CSS `locator()` usage (only for documented component gaps)
- ✅ **0** `getByTestId()` usage (unless absolutely necessary)
- ✅ Human-readable assertions based on visible text
- ✅ Automated axe-core accessibility scans on all major flows
- ✅ Documentation of any necessary CSS selectors with links to component issues
