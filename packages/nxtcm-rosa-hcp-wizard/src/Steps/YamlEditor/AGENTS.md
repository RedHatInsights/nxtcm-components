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
- **E2E:** never click into Monaco to type. Its input element sits under editor layers,
  so the click times out. Enter with the keyboard instead (see
  [keyboard model](#keyboard-model)); after that, `page.keyboard.type()` reaches the model.
- **CT:** `setValue()` reaches `onCodeChange`. The missing alert is the
  `showBanner: false` suppression above, not a missing Monaco event.
- **Jest:** test pure validators and parsers without Monaco.

## what to test where

| Layer | Tool | Responsibilities |
|-------|------|------------------|
| Unit | Jest | Schema/YAML validators, error messages, parsing (`yamlValidation.test.ts`, etc.) |
| Component | Playwright CT | Mount, Monaco visible, language/options, copy/download controls, **mock-driven** validation display, a11y where stable |
| E2E | Playwright | Wizard navigation to YAML step, initial YAML from form, discard modals, editor readiness via `window.monacoEditor`, keyboard entry/exit and typed edits |
| Manual | — | Screen reader announcements, error squiggle rendering |

Reference specs:

- CT: `packages/nxtcm-rosa-hcp-wizard/src/Steps/YamlEditor/RosaHcpYamlEditorStep.spec.tsx`
- E2E: `playwright/e2e/rosa-wizard-yaml-editor.spec.ts`
- E2E keyboard: `playwright/e2e/rosa-wizard-yaml-editor-keyboard.spec.ts`
- Helpers: `playwright/e2e/helpers/yaml-editor-helpers.ts` (`enterYamlEditor`: keyboard entry before typing),
  `playwright/e2e/helpers/focus-helpers.ts`

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

## keyboard model

Verified in E2E on Chromium (Monaco 0.54, PatternFly CodeEditor 6.5.1).

| Action | Key | Result |
|--------|-----|--------|
| Reach editor | Tab | Focus lands on the CodeEditor wrapper (`div[tabindex=0]`), not inside Monaco |
| Enter editor | ArrowDown or Space on the wrapper | Focus moves to Monaco's textbox. Enter does nothing |
| Leave editor | Shift+Tab | Focus returns to the wrapper; the next Tab moves past the editor |
| Tab moves focus | Ctrl+M (Windows/Linux), Ctrl+Shift+M (macOS) | Toggles Monaco tab-focus mode. Monaco announces the new mode in its own `role="alert"` region |
| Next / previous problem | F8 / Shift+F8 | Opens the marker widget with the validation message; Escape closes it and keeps focus in the editor |
| Escape | — | Does **not** leave the editor |

Input surface differs by engine:

- **Chromium:** Monaco uses the EditContext API. The focused element is
  `div.native-edit-context[role="textbox"]`; the `<textarea>` exists but is
  `aria-hidden="true"`.
- **Firefox / WebKit:** no EditContext support, so Monaco falls back to the `<textarea>`.

Locate it with `getByRole('textbox', { name })` on every engine, never `textarea`.
`options.ariaLabel` sets that name (Monaco's default is `Editor content`).

`accessibilitySupport: 'auto'` exposes no content (browsers cannot detect a screen
reader, so `auto` behaves as off). `'on'` exposes the visible content to assistive tech.

Playwright device profiles send a Windows user agent, so Monaco uses Windows/Linux
bindings in E2E on every host OS (Ctrl+M, not Ctrl+Shift+M).

Monaco 0.54 standalone has no accessibility help dialog (Alt+F1 does nothing). F1
opens the command palette.

Monaco's own `role="alert"` regions are always in the DOM. Scope alert assertions
to the wizard's validation region, not `page.getByRole('alert')`. That region is an
always-rendered `AlertGroup isLiveRegion` (`data-testid="yaml-validation-live-region"`);
assert banner presence with its `listitem` count.

The CT story `YamlEditorStepValidationMount` mounts YAML with `invalidLineCount` schema
errors and a "Check schema errors" button that calls `hasSchemaErrors()`, the same path
the YAML footer uses before submit.

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
- Clicking Monaco's input element to focus it (enter with Tab + ArrowDown instead).
- Using `setValue()` to simulate user edits in keyboard/validation flows.
- Unscoped `page.getByRole('alert')` (matches Monaco's internal alert regions).
- Asserting every schema field in the side panel.
- Bidirectional YAML ↔ form sync via automation.

## validation timing (CT with mocks)

If tests mock change events, allow debounce + processing (e.g. 300 ms debounce → wait
~500 ms before assertions).

## selectors

- Prefer `getByRole('button', { name: /Edit in YAML/i })` for PF chrome.
- `.monaco-editor` / `.view-lines` only for **visibility/wait**, not content assertions.
