# Monaco Editor E2E Testing

Use this guide when writing Playwright E2E tests for Monaco editor integration in React applications.

---

## Critical Constraint: Monaco Event System

**Monaco's `setValue()` does NOT trigger `onChange` events.**

This means:
- Programmatically setting editor content will NOT fire validation handlers
- Debounced validation that depends on onChange will NOT run
- E2E tests CANNOT reliably test validation logic

**Rule:** E2E tests for Monaco should focus on **workflow and integration**, not validation.

---

## What to Test Where

### ✅ E2E Tests (Playwright E2E)
Test user workflows and integration:
- Opening/closing the editor
- Navigation between editor and other UI
- Initial content display (generated from form data)
- Editor initialization (Monaco loaded, visible, interactive)
- UI controls (buttons, panels, toggles)
- Modal confirmations (discard changes, etc.)

### ✅ Component Tests (Playwright CT)
Test validation and editor behavior:
- Validation error display
- Schema violations
- Format errors (YAML syntax, CIDR validation, etc.)
- Error markers in Monaco
- Error banner updates
- Mock Monaco events directly to trigger validation

### ✅ Unit Tests (Jest)
Test validation logic in isolation:
- Schema validation functions
- Custom format validators
- Error message formatting
- YAML parsing

---

## Exposing Monaco for E2E Testing

Add a global window reference when the editor mounts (development/test mode only):

```typescript
const handleEditorDidMount: EditorDidMount = useCallback(
  (editor, monaco) => {
    editorRef.current = editor;
    
    // Expose editor for E2E testing
    if (import.meta.env.DEV) {
      (window as typeof window & { monacoEditor?: typeof editor }).monacoEditor = editor;
    }
    
    // ... rest of editor setup
  },
  []
);
```

**Why `import.meta.env.DEV`?**
- Only exposes in development/test builds
- Not included in production bundle
- Works with Vite dev server for E2E tests

---

## Accessing Monaco Content

Use JavaScript evaluation, NOT DOM selectors:

```typescript
// ✅ Get current YAML content
export async function getMonacoYaml(page: Page): Promise<string> {
  return await page.evaluate(() => {
    const editor = (window as Window & { monacoEditor?: { getValue: () => string } }).monacoEditor;
    return editor ? editor.getValue() : '';
  });
}

// ✅ Check if editor is ready
const isEditable = await page.evaluate(() => {
  const editor = (window as Window & { monacoEditor?: { getModel: () => unknown } }).monacoEditor;
  return editor && editor.getModel() !== null;
});

// ❌ Don't try to access via DOM
const content = await page.locator('.view-lines').textContent(); // Unreliable
```

---

## Waiting for Monaco Initialization

Monaco loads asynchronously. Wait for both DOM and JavaScript initialization:

```typescript
// Wait for Monaco DOM elements
await page.locator('.monaco-editor').waitFor({ state: 'visible' });
await page.locator('.view-lines').waitFor({ state: 'visible' });

// Wait for Monaco JavaScript API
await page.waitForFunction(() => {
  return (window as Window & { monacoEditor?: unknown }).monacoEditor !== undefined;
}, { timeout: 5000 });

// Small buffer for content to load
await page.waitForTimeout(500);
```

**Why the 500ms timeout?**
- Monaco may render before content is fully loaded
- Gives editor time to apply initial value
- More reliable than polling for content changes

---

## Why Physical Typing Doesn't Work

Attempts to use `page.keyboard.type()` fail because:

1. **Monaco's textarea is not directly clickable**
   - Hidden contenteditable overlay
   - Pointer events intercepted by Monaco layers
   - `click()` on textarea times out

2. **Too slow for E2E tests**
   - Typing entire YAML documents character-by-character
   - Unreliable timing for debounced validation
   - Flaky in CI environments

3. **No keyboard focus API**
   - `editor.focus()` exists but doesn't enable keyboard input in Playwright context
   - Physical clicks required, but are blocked

**Solution:** Don't test validation in E2E. Use Component Tests instead.

---

## Validation Timing (If Testing in Component Tests)

If you ARE testing validation in Component Tests where you can mock events:

```typescript
// Validation debounce in component
const VALIDATION_DEBOUNCE = 300; // ms

// Wait in test
async function waitForValidation(page: Page): Promise<void> {
  await page.waitForTimeout(500); // 300ms debounce + 200ms buffer
}
```

**Why 500ms total?**
- 300ms debounce delay
- 200ms for AJV validation processing
- Buffer for React state updates

---

## Common Selectors

### Monaco Editor Elements
```typescript
// Editor container
page.locator('.monaco-editor')

// Editor content
page.locator('.view-lines')

// Don't use these for content access - use evaluate() instead
```

### PatternFly Components (use role-based selectors)
```typescript
// Buttons
page.getByRole('button', { name: 'Edit in YAML' })
page.getByRole('button', { name: 'Discard changes and go back to Review step' })
page.getByRole('button', { name: 'Create cluster' })

// Modals
page.getByRole('dialog')

// Alerts
page.getByRole('alert').filter({ hasText: 'validation error' })
```

---

## Example E2E Test Patterns

### Test: Editor Opens and Displays Content
```typescript
test('displays initial YAML from form data', async ({ page }) => {
  await navigateToYamlEditor(page);
  
  const yaml = await getMonacoYaml(page);
  
  // Verify YAML structure
  expect(yaml).toContain('kind: ROSAControlPlane');
  expect(yaml).toContain("rosaClusterName: 'test-cluster'");
});
```

### Test: Editor is Interactive
```typescript
test('editor is ready for interaction', async ({ page }) => {
  await navigateToYamlEditor(page);
  
  const isEditable = await page.evaluate(() => {
    const editor = (window as Window & { monacoEditor?: { getModel: () => unknown } })
      .monacoEditor;
    return editor && editor.getModel() !== null;
  });
  
  expect(isEditable).toBe(true);
});
```

### Test: Discard Workflow
```typescript
test('discard button shows confirmation modal', async ({ page }) => {
  await navigateToYamlEditor(page);
  
  await page.getByRole('button', { name: 'Discard changes and go back to Review step' }).click();
  
  // Modal appears
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('Any changes you made to the YAML configuration will be lost.')).toBeVisible();
  
  // Confirm discard
  await page.getByRole('button', { name: 'Yes' }).click();
  
  // Back to review page
  await expect(page.getByRole('button', { name: 'Edit in YAML' })).toBeVisible();
});
```

---

## What NOT to Test in E2E

### ❌ Validation Errors
```typescript
// Don't do this - validation won't trigger
test('shows error for invalid CIDR', async ({ page }) => {
  await navigateToYamlEditor(page);
  
  // setValue() doesn't trigger onChange
  await page.evaluate(() => {
    (window as any).monacoEditor.setValue('invalid yaml');
  });
  
  // This will fail - no validation ran
  await expect(page.getByRole('alert')).toBeVisible();
});
```

**Move to Component Tests** where you can:
- Mock Monaco's `onDidChangeModelContent` event
- Directly call validation functions
- Control validation timing precisely

### ❌ Schema Panel Content Details
```typescript
// Don't test every schema field in E2E
test('schema shows all 47 fields', async ({ page }) => {
  // Too brittle, too slow
});
```

**Instead:** Test that schema panel toggle works, basic visibility.

### ❌ YAML → Form Synchronization
```typescript
// Don't test bidirectional sync in E2E
test('editing YAML updates form fields', async ({ page }) => {
  // Can't reliably set YAML content
});
```

**Move to Component Tests** with mocked data flows.

---

## File Naming Conventions

```
playwright/
  e2e/
    component-yaml-editor.spec.ts          # E2E workflow tests
    helpers/
      yaml-editor-helpers.ts               # Navigation and Monaco access helpers
```

Helper functions to extract:
- `navigateToYamlEditor(page)` - Navigate through wizard to editor
- `getMonacoYaml(page)` - Read current editor content
- Step navigation helpers (reusable across tests)

---

## References

- Monaco Editor API: https://microsoft.github.io/monaco-editor/docs.html
- Playwright evaluate(): https://playwright.dev/docs/evaluating
- Component vs E2E testing: Choose based on what you can reliably control
- This repo's example: `playwright/e2e/rosa-wizard-yaml-editor.spec.ts`

---

## Summary

**E2E tests for Monaco = workflow only**
- Opening, closing, navigation
- Initial content display
- UI controls and modals
- Editor initialization

**Validation = Component Tests or Unit Tests**
- Where you can mock events
- Where you can control timing
- Where you can test logic directly

**Access Monaco via JavaScript evaluation, not DOM manipulation.**
