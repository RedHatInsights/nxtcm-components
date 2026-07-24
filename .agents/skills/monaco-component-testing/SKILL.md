---
skill: monaco-component-testing
description: Guide for testing Monaco editor components in Playwright CT, including known limitations and multi-layer testing strategy
version: 1.0.0
tags: [testing, monaco, playwright-ct, component-tests, yaml-editor]
---

# Monaco Editor Component Testing Guide

Comprehensive guide for testing Monaco editor components in Playwright Component Tests (CT), including known limitations, testing strategies, and best practices learned from YAML editor implementation.

## When to Use This Skill

Invoke this skill when:
- Testing components that use Monaco editor (CodeEditor, YAML editor, etc.)
- Planning test strategy for Monaco integration
- Debugging flaky Monaco tests
- Understanding why validation tests fail in CT
- Deciding which layer to test Monaco functionality

**Related skills:**
- `.agents/skills/monaco-e2e-testing/SKILL.md` - E2E testing for Monaco (different constraints)

## Critical Monaco Testing Limitations

### Limitation 1: `setValue()` Does NOT Trigger `onChange`

**The Problem:**
Monaco's `setValue()` method does not fire the `onChange` event that validation logic depends on.

```typescript
// ❌ This DOES NOT work in Playwright CT
await monacoEditor.evaluate((node) => {
  const editor = (window as any).monacoEditor;
  editor.setValue(invalidYaml); // onChange NOT triggered!
});

// Validation handler NEVER fires
// Error markers NEVER appear
// Error banner NEVER displays
```

**Impact:**
- Cannot test validation logic via Monaco in CT
- Cannot test error markers appearing in editor
- Cannot test error banner display
- Cannot test debounced validation

**Solution:**
Test validation logic separately in unit tests (see Testing Strategy below)

---

### Limitation 2: Complex DOM Structure Causes Click Interception

**The Problem:**
Monaco creates multiple overlapping DOM layers (editor, overlays, minimap, margins) that intercept click events.

```typescript
// ❌ These clicks are FLAKY in CT
await component.locator('.monaco-editor').click(); // Intercepted by overlay
await component.locator('button').click();          // Intercepted by editor
await component.locator('.monaco-editor textarea').click(); // Intercepted by margin
```

**Playwright Error:**
```
<div>…</div> from <div class="margin">…</div> subtree intercepts pointer events
<body>…</body> intercepts pointer events
```

**Impact:**
- Cannot reliably click buttons inside/near Monaco
- Cannot click into editor to trigger focus
- Cannot test click-based interactions

**Solution:**
Test these interactions in E2E tests with real browser or manual testing

---

### Limitation 3: Focus Management is Internal

**The Problem:**
Monaco manages focus internally via complex event handlers that don't work in CT environment.

```typescript
// ❌ Focus tests are FLAKY
await page.keyboard.press('Tab'); // May not reach editor
await expect(component.locator('.monaco-editor.focused')).toBeVisible(); // Unreliable
```

**Impact:**
- Cannot test keyboard navigation reliably
- Cannot test focus-based validation triggers
- Cannot test blur events triggering validation

**Solution:**
Verify accessibility features (textarea exists) but skip focus interaction tests

---

## Multi-Layer Testing Strategy

Test Monaco components at THREE layers, each with specific responsibilities:

### Layer 1: Unit Tests (Jest)

**What to test:** Pure validation/parsing functions

**Tools:** Jest, no DOM required

**Example:**
```typescript
// packages/.../yamlValidation.test.ts
import { validateYaml } from './yamlValidation';

test('rejects invalid YAML syntax', () => {
  const errors = validateYaml('invalid: [unclosed');
  expect(errors.length).toBeGreaterThan(0);
  expect(errors[0].message).toContain('syntax');
});

test('accepts valid YAML', () => {
  const errors = validateYaml(validYaml);
  expect(errors).toEqual([]);
});
```

**Coverage target:** 80%+ line coverage of validation logic

**Why this layer:**
- ✅ Fast (< 1 second for 39 tests)
- ✅ Reliable (pure functions, no browser)
- ✅ Easy to test all edge cases
- ✅ Covers the core business logic

**Reference:** `packages/nxtcm-rosa-hcp-wizard/src/Steps/YamlEditor/yamlValidation.test.ts`

---

### Layer 2: Component Tests (Playwright CT)

**What to test:** Monaco initialization, rendering, configuration

**Tools:** Playwright Component Tests

**Example:**
```typescript
// packages/.../RosaHcpYamlEditorStep.spec.tsx
test('renders Monaco editor', async ({ mount }) => {
  const component = await mount(
    <TestWrapper>
      <YamlEditorStep />
    </TestWrapper>
  );

  await component.locator('.monaco-editor').waitFor({ timeout: 10000 });
  await expect(component.locator('.monaco-editor')).toBeVisible();
});

test('sets up YAML language mode', async ({ mount }) => {
  const component = await mount(<YamlEditorStep />);
  await component.locator('.monaco-editor').waitFor();
  
  // Verify view-lines (syntax highlighting) is present
  await expect(component.locator('.view-lines')).toBeVisible();
});

test('enables copy functionality', async ({ mount }) => {
  const component = await mount(<YamlEditorStep />);
  await component.locator('.monaco-editor').waitFor();
  
  const copyButton = component.locator('button[aria-label*="Copy"]');
  await expect(copyButton).toBeVisible();
});
```

**Coverage target:** 10-15 tests for rendering/config

**Why this layer:**
- ✅ Verifies Monaco loads correctly
- ✅ Checks configuration (language, options)
- ✅ Tests component props
- ✅ Validates accessibility features

**Reference:** `packages/nxtcm-rosa-hcp-wizard/src/Steps/YamlEditor/RosaHcpYamlEditorStep.spec.tsx`

---

### Layer 3: E2E Tests (Playwright E2E) or Manual Testing

**What to test:** User workflows with real typing and interaction

**Tools:** Playwright E2E (real browser) or manual testing

**Example E2E:**
```typescript
// playwright/e2e/yaml-editor-validation.spec.ts (FUTURE)
test('shows validation error when user types invalid YAML', async ({ page }) => {
  await page.goto('/yaml-editor');
  
  // Real user typing (triggers onChange!)
  await page.locator('.monaco-editor').click();
  await page.keyboard.type('invalid: [unclosed');
  
  // Wait for debounced validation (300ms)
  await page.waitForTimeout(400);
  
  // Blur to show error banner
  await page.keyboard.press('Tab');
  
  // Verify error displays
  await expect(page.getByRole('alert')).toContainText('validation error');
});
```

**Example Manual Test:**
```
1. Open YAML editor
2. Type invalid YAML: `invalid: [unclosed`
3. Wait 300ms (debounce)
4. Click outside editor (blur)
5. Verify error banner shows: "1 validation error found"
6. Verify red squiggle appears in editor
```

**Coverage target:** Critical user paths

**Why this layer:**
- ✅ Real onChange events
- ✅ Real user interactions (typing, clicking)
- ✅ Tests full integration
- ✅ Catches issues unit/CT tests can't

**Reference:** `MANUAL-TEST-PLAN.md` Section 7 (YAML Editor)

---

## What CAN Be Tested in Component Tests

### ✅ Component Rendering

```typescript
test('renders Monaco editor', async ({ mount }) => {
  const component = await mount(<YamlEditorStep />);
  await component.locator('.monaco-editor').waitFor();
  await expect(component.locator('.monaco-editor')).toBeVisible();
});
```

### ✅ Initial State

```typescript
test('does not show error banner initially', async ({ mount }) => {
  const component = await mount(<YamlEditorStep />);
  await component.locator('.monaco-editor').waitFor();
  
  // Valid YAML from form, no errors
  await expect(component.getByRole('alert')).not.toBeVisible();
});
```

### ✅ Component Configuration

```typescript
test('sets up YAML language mode', async ({ mount }) => {
  const component = await mount(<YamlEditorStep />);
  await component.locator('.monaco-editor').waitFor();
  
  // Monaco renders with YAML syntax highlighting
  await expect(component.locator('.view-lines')).toBeVisible();
});

test('enables copy and download', async ({ mount }) => {
  const component = await mount(<YamlEditorStep />);
  await component.locator('.monaco-editor').waitFor();
  
  await expect(component.locator('button[aria-label*="Copy"]')).toBeVisible();
  await expect(component.locator('button[aria-label*="Download"]')).toBeVisible();
});
```

### ✅ Component Props

```typescript
test('renders with onClose prop', async ({ mount }) => {
  let closeCalled = false;
  
  const component = await mount(
    <YamlEditorStep onClose={() => { closeCalled = true; }} />
  );
  
  await component.locator('.monaco-editor').waitFor();
  // Component accepts prop without errors
});
```

### ✅ Accessibility Features

```typescript
test('Monaco textarea is accessible', async ({ mount }) => {
  const component = await mount(<YamlEditorStep />);
  await component.locator('.monaco-editor').waitFor();
  
  // Monaco creates textarea for screen readers
  const textarea = component.locator('.monaco-editor textarea');
  await expect(textarea).toBeVisible();
});
```

---

## What CANNOT Be Reliably Tested in Component Tests

### ❌ Setting Editor Content Programmatically

**Problem:** `setValue()` doesn't trigger onChange

**Don't do:**
```typescript
// ❌ DOES NOT WORK
test('validation errors appear', async ({ mount }) => {
  const component = await mount(<YamlEditorStep />);
  
  // This doesn't trigger onChange!
  await component.evaluate(() => {
    window.monacoEditor.setValue('invalid');
  });
  
  // Validation NEVER runs
  await expect(component.getByRole('alert')).toBeVisible(); // FAILS
});
```

**Alternative:** Test in unit tests or E2E

---

### ❌ Clicking Monaco UI Elements

**Problem:** DOM overlays intercept clicks

**Don't do:**
```typescript
// ❌ FLAKY - Will timeout
test('schema panel toggles', async ({ mount }) => {
  const component = await mount(<YamlEditorStep />);
  
  const toggleButton = component.getByRole('button', { name: /schema/i });
  await toggleButton.click(); // Intercepted by Monaco overlays!
  
  // Test will timeout or fail intermittently
});
```

**Alternative:** Test button existence, skip interaction test

---

### ❌ Focus and Blur Events

**Problem:** Monaco's internal focus management

**Don't do:**
```typescript
// ❌ FLAKY
test('editor receives focus', async ({ mount, page }) => {
  const component = await mount(<YamlEditorStep />);
  
  await page.keyboard.press('Tab');
  await expect(component.locator('.monaco-editor.focused')).toBeVisible(); // Unreliable
});
```

**Alternative:** Skip focus tests in CT, verify in E2E or manual

---

### ❌ Validation Error Display

**Problem:** Requires onChange to trigger

**Don't do:**
```typescript
// ❌ DOES NOT WORK
test('shows error banner', async ({ mount }) => {
  const component = await mount(<YamlEditorStep />);
  
  // Can't trigger validation without real typing
  await expect(component.getByRole('alert')).toContainText('error'); // FAILS
});
```

**Alternative:** Test validation logic in unit tests, error display in E2E

---

## Best Practices

### 1. Use Spec Helpers for Context Providers

**Problem:** Playwright CT can't mount wrapper components defined in test files

**Solution:** Create separate spec-helpers file

```typescript
// YamlEditorStep.spec-helpers.tsx
export function YamlEditorTestWrapper({ children }: { children: ReactNode }) {
  const methods = useForm<FormData>({ defaultValues: {...} });
  
  return (
    <StringsProvider>
      <FormProvider {...methods}>
        {children}
      </FormProvider>
    </StringsProvider>
  );
}

// YamlEditorStep.spec.tsx
import { YamlEditorTestWrapper } from './YamlEditorStep.spec-helpers';

test('renders', async ({ mount }) => {
  const component = await mount(
    <YamlEditorTestWrapper>
      <YamlEditorStep />
    </YamlEditorTestWrapper>
  );
  // ...
});
```

---

### 2. Wait for Monaco to Initialize

**Problem:** Monaco loads asynchronously

**Solution:** Wait for `.monaco-editor` with sufficient timeout

```typescript
async function waitForMonaco(component) {
  await component.locator('.monaco-editor').waitFor({ timeout: 10000 });
  await component.page().waitForTimeout(1000); // Extra buffer for full init
}

test('test name', async ({ mount }) => {
  const component = await mount(<YamlEditorStep />);
  await waitForMonaco(component); // Always wait first
  
  // Now safe to make assertions
  await expect(component.locator('.view-lines')).toBeVisible();
});
```

---

### 3. Keep Tests Simple and Focused

**Problem:** Complex tests become flaky

**Solution:** One assertion per test, avoid multi-step interactions

```typescript
// ✅ GOOD - Simple, focused
test('renders Monaco editor', async ({ mount }) => {
  const component = await mount(<YamlEditorStep />);
  await waitForMonaco(component);
  await expect(component.locator('.monaco-editor')).toBeVisible();
});

// ❌ BAD - Too complex, will be flaky
test('full validation workflow', async ({ mount }) => {
  const component = await mount(<YamlEditorStep />);
  await waitForMonaco(component);
  await component.locator('.monaco-editor').click(); // Flaky
  await component.keyboard.type('invalid'); // Doesn't work
  await expect(component.getByRole('alert')).toBeVisible(); // Fails
});
```

---

### 4. Test What's Visible, Not Internal State

**Problem:** Accessing Monaco's internal API is brittle

**Solution:** Assert on rendered DOM, not editor state

```typescript
// ✅ GOOD - Tests visible UI
test('copy button is visible', async ({ mount }) => {
  const component = await mount(<YamlEditorStep />);
  await waitForMonaco(component);
  await expect(component.locator('button[aria-label*="Copy"]')).toBeVisible();
});

// ❌ BAD - Relies on internal API
test('editor has correct model', async ({ mount }) => {
  const component = await mount(<YamlEditorStep />);
  const model = await component.evaluate(() => window.monacoEditor.getModel());
  expect(model).toBeDefined(); // Brittle
});
```

---

### 5. Document Limitations in Comments

**Problem:** Future developers may try flaky patterns

**Solution:** Add comments explaining why tests are skipped

```typescript
test.describe('Schema Panel Toggle', () => {
  test('renders schema toggle button', async ({ mount }) => {
    // Test button exists
  });

  // Note: Clicking the toggle button is flaky in CT due to Monaco's complex DOM overlays
  // This interaction is better tested in E2E or manual testing
});
```

---

## Common Patterns

### Pattern: Test Component Mounting

```typescript
test('renders Monaco editor component', async ({ mount }) => {
  const component = await mount(
    <TestWrapper>
      <YamlEditorStep />
    </TestWrapper>
  );

  await component.locator('.monaco-editor').waitFor({ timeout: 10000 });
  await expect(component.locator('.monaco-editor')).toBeVisible();
  await expect(component.locator('.view-lines')).toBeVisible();
});
```

### Pattern: Test Configuration Options

```typescript
test('Monaco is configured with correct options', async ({ mount }) => {
  const component = await mount(<YamlEditorStep />);
  await waitForMonaco(component);

  // PatternFly CodeEditor wrapper
  await expect(component.locator('.pf-v6-c-code-editor')).toBeVisible();
  
  // Copy/download enabled
  await expect(component.locator('button[aria-label*="Copy"]')).toBeVisible();
  await expect(component.locator('button[aria-label*="Download"]')).toBeVisible();
  
  // YAML language mode (view-lines indicates syntax highlighting)
  await expect(component.locator('.view-lines')).toBeVisible();
});
```

### Pattern: Test Props Passing

```typescript
test('accepts callback props without errors', async ({ mount }) => {
  let onCloseCalled = false;
  let onCancelCalled = false;

  const component = await mount(
    <TestWrapper>
      <YamlEditorStep
        onClose={() => { onCloseCalled = true; }}
        onCancel={() => { onCancelCalled = true; }}
      />
    </TestWrapper>
  );

  await waitForMonaco(component);
  // Component renders successfully with props
  await expect(component.locator('.monaco-editor')).toBeVisible();
});
```

### Pattern: Test Accessibility

```typescript
test('Monaco editor is accessible', async ({ mount }) => {
  const component = await mount(<YamlEditorStep />);
  await waitForMonaco(component);

  // Monaco creates a textarea for screen reader access
  const textarea = component.locator('.monaco-editor textarea');
  await expect(textarea).toBeVisible();
  
  // Textarea should not have aria-hidden
  const ariaHidden = await textarea.getAttribute('aria-hidden');
  expect(ariaHidden).not.toBe('true');
});
```

---

## Test Suite Structure

### Recommended Organization

```typescript
test.describe('YamlEditorStep - Monaco Integration', () => {
  test.describe('Component Rendering', () => {
    test('renders Monaco editor', async ({ mount }) => { ... });
    test('displays CodeEditor component', async ({ mount }) => { ... });
  });

  test.describe('Initial State', () => {
    test('does not show error banner initially', async ({ mount }) => { ... });
  });

  test.describe('Component Props', () => {
    test('renders with onClose prop', async ({ mount }) => { ... });
    test('renders with onCancel prop', async ({ mount }) => { ... });
  });

  test.describe('Monaco Configuration', () => {
    test('sets up YAML language mode', async ({ mount }) => { ... });
    test('enables copy functionality', async ({ mount }) => { ... });
    test('enables download functionality', async ({ mount }) => { ... });
  });

  test.describe('Editor Accessibility', () => {
    test('Monaco textarea is accessible', async ({ mount }) => { ... });
  });
});
```

### Typical Test Count

**Good baseline:** 10-15 tests
- 2-3 rendering tests
- 1-2 initial state tests
- 2-3 props tests
- 3-4 configuration tests
- 1-2 accessibility tests

**Don't over-test:** More tests != better coverage when most Monaco interactions can't be tested in CT

---

## Troubleshooting

### Test Times Out Waiting for Monaco

**Symptom:**
```
Test timeout of 10000ms exceeded
waiting for locator('.monaco-editor')
```

**Solution:**
- Increase timeout: `waitFor({ timeout: 15000 })`
- Check Monaco assets are loading (webpack/vite config)
- Verify CodeEditor is imported correctly

---

### Click is Intercepted

**Symptom:**
```
<div>…</div> from <div class="margin">…</div> subtree intercepts pointer events
```

**Solution:**
- Don't test clicking in Monaco CT tests
- Test button existence only, skip click test
- Move interaction tests to E2E

---

### Validation Doesn't Trigger

**Symptom:**
Error banner never appears after setting content

**Solution:**
- This is expected! `setValue()` doesn't trigger onChange
- Test validation logic in unit tests instead
- Test error display in E2E tests with real typing

---

## Related References

- **packages/nxtcm-rosa-hcp-wizard/docs/testing/MONACO-INTEGRATION-TESTS.md** - Comprehensive summary of Monaco testing work
- **yamlValidation.test.ts** - Example unit tests for validation logic
- **RosaHcpYamlEditorStep.spec.tsx** - Example component tests for Monaco
- **MANUAL-TEST-PLAN.md** Section 7 - Manual YAML editor test scenarios
- **.agents/skills/monaco-e2e-testing/SKILL.md** - E2E testing guide (different constraints)

---

## Quick Decision Tree

**Should I test this in Component Tests?**

```
Does it involve Monaco?
├─ NO → Use standard Playwright CT patterns
└─ YES → Does it require user typing or onChange events?
    ├─ YES → Use E2E tests or unit tests
    │   ├─ Pure function (validateYaml)? → Unit tests
    │   └─ User workflow (typing)? → E2E or manual
    └─ NO → Does it involve clicking Monaco elements?
        ├─ YES → Skip or move to E2E (clicks are flaky)
        └─ NO → Safe for Component Tests!
            ├─ Rendering? ✅ CT
            ├─ Configuration? ✅ CT
            ├─ Props? ✅ CT
            ├─ Accessibility? ✅ CT
            └─ Initial state? ✅ CT
```

---

## Summary

**Monaco Component Testing Strategy:**

1. **Unit tests** for validation logic (fast, reliable, comprehensive)
2. **Component tests** for rendering and configuration (what works in CT)
3. **E2E or manual** for user interactions (what doesn't work in CT)

**Remember:**
- `setValue()` doesn't trigger onChange
- Clicks are flaky due to DOM overlays
- Focus management is internal
- Keep tests simple and focused
- Test what's visible, not internal state
- Document why tests are skipped

**Success:** 10 reliable tests > 30 flaky tests!
