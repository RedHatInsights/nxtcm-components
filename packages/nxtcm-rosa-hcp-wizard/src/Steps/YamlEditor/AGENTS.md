# YamlEditor — Monaco testing

Single source of truth for testing the YAML/Monaco integration in this folder
(`RosaHcpYamlEditorStep` and related files).

## critical constraint

**Monaco `setValue()` emits a model content-change event.** `onDidChangeModelContent`
listeners run. `@monaco-editor/react` forwards that event to React `onChange`, except
while it applies the controlled `value` prop.

This editor does not drop that event. `handleCodeChange` schedules
`setEditorMarkers(value, false)` after 300 ms, so markers update. The validation alert
stays suppressed on that path (`showBanner` is false) until the banner is already
visible, or until blur / `hasSchemaErrors()` calls `setEditorMarkers` with the banner
enabled.

- **E2E:** `setValue()` does run that path. Do not expect `role="alert"` from
  `setValue()` alone. Assert markers only after the debounce, or use a path that
  enables the banner.
- **E2E:** do not drive the editor with `page.keyboard.type()`. Monaco's textarea sits
  under editor layers, so the click times out and keystrokes never reach the model.
- **CT:** `setValue()` reaches `onCodeChange`. The missing alert is the
  `showBanner: false` suppression above, not a missing Monaco event.
- **Jest:** test pure validators and parsers without Monaco.

## what to test where

| Layer | Tool | Responsibilities |
|-------|------|------------------|
| Unit | Jest | Schema/YAML validators, error messages, parsing (`yamlValidation.test.ts`, etc.) |
| Component | Playwright CT | Mount, Monaco visible, language/options, copy/download controls, **mock-driven** validation display, a11y where stable |
| E2E | Playwright | Wizard navigation to YAML step, initial YAML from form, discard modals, editor readiness via `window.monacoEditor` |
| Manual | — | Real typing, debounced validation, error squiggles when automation is impractical |

Reference specs:

- CT: `packages/nxtcm-rosa-hcp-wizard/src/Steps/YamlEditor/RosaHcpYamlEditorStep.spec.tsx`
- E2E: `playwright/e2e/rosa-wizard-yaml-editor.spec.ts`
- Helpers: `playwright/e2e/helpers/yaml-editor-helpers.ts`

## CT limitations

1. **`setValue()` / evaluate edits** — `onCodeChange` runs. The alert does not, because
   `handleCodeChange` passes `showBanner: false`.
2. **Click interception** — Monaco margins/overlays block clicks on nearby buttons;
   avoid flaky click chains through `.monaco-editor`.
3. **Focus / keyboard** — internal focus management is unreliable in CT; prefer
   role-based checks on surrounding UI.

For validation UI in CT, trigger the same code paths the app uses when the model
changes (test doubles, direct handler invocation, or fixtures documented in the
YamlEditor spec).

## E2E: expose editor (dev/test only)

```typescript
if (import.meta.env.DEV) {
  (window as Window & { monacoEditor?: typeof editor }).monacoEditor = editor;
}
```

Read content via evaluation, not `.view-lines` text:

```typescript
export async function getMonacoYaml(page: Page): Promise<string> {
  return page.evaluate(() => {
    const editor = (window as Window & { monacoEditor?: { getValue: () => string } }).monacoEditor;
    return editor ? editor.getValue() : '';
  });
}
```

Wait for initialization:

```typescript
await page.locator('.monaco-editor').waitFor({ state: 'visible' });
await page.waitForFunction(
  () => (window as Window & { monacoEditor?: unknown }).monacoEditor !== undefined,
  { timeout: 5000 }
);
await page.waitForTimeout(500); // initial value applied
```

## E2E patterns (workflow)

- Open editor from review (`Edit in YAML`), assert YAML contains expected cluster fields.
- Discard flow: confirmation modal, return to review.
- Assert `getModel()` is non-null for "editor ready".

## E2E anti-patterns

- Expecting `role="alert"` from `monacoEditor.setValue()` alone (`onCodeChange` keeps
  `showBanner` false).
- Typing YAML with `page.keyboard.type()` or clicking the Monaco textarea.
- Asserting every schema field in the side panel.
- Bidirectional YAML ↔ form sync via automation.

## validation timing (CT with mocks)

If tests mock change events, allow debounce + processing (e.g. 300 ms debounce → wait
~500 ms before assertions).

## selectors

- Prefer `getByRole('button', { name: /Edit in YAML/i })` for PF chrome.
- `.monaco-editor` / `.view-lines` only for **visibility/wait**, not content assertions.
