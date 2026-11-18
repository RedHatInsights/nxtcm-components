# Keyboard and focus coverage

Where keyboard focus lands in the ROSA HCP wizard, and which spec asserts it (FCN-818). Axe scans, labels, and display settings are covered separately; see [`display-coverage.md`](./display-coverage.md).

Specs live in two Playwright projects, both run in CI: component tests (CT, next to each component) and `playwright/e2e`. A focus destination is asserted in CT where the behavior belongs to one component, and in E2E where it depends on how the full wizard is assembled.

## How focus is asserted

- Locators are semantic (`getByRole` first). Focus is asserted with `toBeFocused()`; where the ticket requires a visible destination, `expectFocusVisible()` also checks `:focus-visible` and an outline or box-shadow.
- `playwright/e2e/helpers/focus-helpers.ts` provides `tabUntilFocused` (lists the elements visited on failure), `expectFocusVisible`, and `expectFocusVisibleOnContainerOf`.
- Step content has no role, so specs check that the focused element is the container holding a known piece of that step, and not `<body>`, the nav, or the footer. E2E specs use `expectFocusVisibleOnContainerOf` to also check its focus ring.

## Where each destination is implemented

| Behavior                                         | Implemented in                                                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Focus after Next and Back                        | PatternFly `Wizard` (`shouldFocusContent`, on by default), which focuses the step content         |
| Focus after a failed Next or Skip to review      | `Footer/RosaHcpWizardFooter.tsx`: first visible `aria-invalid="true"` control in the step content |
| Focus after Skip to review succeeds              | `Footer/RosaHcpWizardFooter.tsx`: step content, as Next and Back do                               |
| Create cluster stays focused while submitting    | `Footer/RosaHcpWizardFooter.tsx` and `Footer/RosaHcpYamlEditorFooter.tsx` (`isAriaDisabled`)      |
| Focus across submit error, YAML editor, and back | `ROSAHCPWizardBody.tsx`: layout effect on view changes (FCN-832)                                  |
| Details drawer                                   | PatternFly `Drawer` focus trap, configured in `DetailsStepDrawer.tsx`                             |
| Discard dialog (YAML editor)                     | PatternFly `Modal` in `Footer/RosaHcpYamlEditorFooter.tsx`                                        |

## Wizard navigation and footer

Specs: `packages/nxtcm-rosa-hcp-wizard/src/Footer/RosaHcpWizardFooter.spec.tsx` (the "keyboard and focus" block, CT), `playwright/e2e/rosa-wizard-keyboard.spec.ts` (E2E), and `packages/nxtcm-rosa-hcp-wizard/src/Footer/rosaHcpWizardFooter.utils.test.ts` (unit tests for the first-invalid-control lookup).

| Interaction                                           | Focus destination                                                        | CT  | E2E |
| ----------------------------------------------------- | ------------------------------------------------------------------------ | --- | --- |
| Enter or Space on Next / Back                         | Step content of the new step (E2E checks a visible ring)                 | ✓   | ✓   |
| Tab to Next, then Enter                               | Next is focused (E2E also checks a visible ring)                         | ✓   | ✓   |
| Next fails validation                                 | First invalid control (E2E also checks a visible ring)                   | ✓   | ✓   |
| Next fails again after a retry                        | First invalid control again                                              | ✓   | ✓   |
| First invalid control is a select                     | The select's combobox                                                    | ✓   | —   |
| Skip to review fails validation                       | First invalid control (E2E also checks a visible ring)                   | ✓   | ✓   |
| Skip to review succeeds                               | Review step content; the Skip button is gone (E2E checks a visible ring) | ✓   | ✓   |
| First invalid control is in a collapsed section       | Skipped; the first visible invalid control, or Next if there is none     | ✓   | —   |
| Enter on a visited step in the left nav               | Stays on that nav item; the step opens                                   | —   | ✓   |
| Shift+Tab from Next on the Details step               | Skips the disabled Back button                                           | ✓   | —   |
| Create cluster pressed on Review (submission pending) | Stays on Create cluster, `aria-disabled="true"`                          | ✓   | —   |
| Create cluster pressed in the YAML editor (pending)   | Stays on Create cluster, `aria-disabled="true"`                          | ✓   | —   |

The pending-submission rows are CT-only because the E2E app's `onSubmit` resolves immediately.

## View changes: submit error, YAML editor, back to Review

Specs: `packages/nxtcm-rosa-hcp-wizard/src/ROSAHCPWizardBody.spec.tsx` (CT) and `playwright/e2e/rosa-wizard-yaml-editor-keyboard.spec.ts` (E2E). Delivered by FCN-832 and FCN-819.

| Interaction                                         | Focus destination                                       |
| --------------------------------------------------- | ------------------------------------------------------- |
| A submission fails                                  | The submit error view                                   |
| Back to the wizard, error came from a middle step   | That step's nav item; entered form values are preserved |
| Back to the wizard, error came from Review          | Edit in YAML on Review                                  |
| Back to the wizard, error came from the YAML editor | The YAML editor                                         |
| Review: Enter on Edit in YAML                       | The YAML editor                                         |
| YAML applied successfully                           | Edit in YAML on Review                                  |

The YAML editor's own keyboard model (entering and leaving Monaco, F8, schema toggle, copy and download) is documented in [`YamlEditor/AGENTS.md`](../../packages/nxtcm-rosa-hcp-wizard/src/Steps/YamlEditor/AGENTS.md) and tested in `rosa-wizard-yaml-editor-keyboard.spec.ts` and `RosaHcpYamlEditorStep.spec.tsx`.

## Select and MultiSelect

Specs: `packages/nxtcm-rosa-hcp-wizard/src/components/Fields/Select/Select.spec.tsx` and `.../MultiSelect/MultiSelect.spec.tsx` (CT).

| Control      | Interaction                   | Focus destination                                                             |
| ------------ | ----------------------------- | ----------------------------------------------------------------------------- |
| Typeahead    | Open, arrow keys, Enter       | Stays in the input; the active option is tracked with `aria-activedescendant` |
| Typeahead    | Escape                        | Stays in the input; the menu closes                                           |
| Typeahead    | Tab from an open menu         | The next control, in one press                                                |
| Plain Select | Enter or Space                | Stays on the toggle; the menu opens                                           |
| Plain Select | Arrow keys                    | Skip disabled options; Enter selects                                          |
| Plain Select | Enter on an option, or Escape | Back on the toggle                                                            |
| Plain Select | Tab from an open menu         | The menu closes and focus stays on the toggle; the next Tab moves on          |
| MultiSelect  | Enter or Space                | Stays on the toggle; the menu opens                                           |
| MultiSelect  | Space on options, Escape      | Checkboxes toggle; focus returns to the toggle                                |
| MultiSelect  | Tab from an open menu         | The menu closes and focus stays on the toggle; the next Tab moves on          |
| Any select   | Disabled                      | Skipped by Tab and Shift+Tab                                                  |
| Any select   | Loading                       | The loading row is not focusable; Escape still returns to the toggle          |

## Drawers and dialogs

| Component                    | Interaction                                             | Focus destination                                                   | Spec                                             |
| ---------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------ |
| Details drawer               | Open from the trigger (keyboard or pointer)             | The header close button (visible ring asserted after keyboard open) | `DetailsStepDrawer.spec.tsx`, `Details.spec.tsx` |
| Details drawer               | Tab and Shift+Tab                                       | Stay inside the dialog and wrap                                     | `DetailsStepDrawer.spec.tsx`                     |
| Details drawer               | Tab through the whole expanded panel                    | Header close, step sections and their controls, bottom Close        | `DetailsStepDrawer.spec.tsx`                     |
| Details drawer               | Close with the header or bottom button, Enter or Space  | The trigger                                                         | `Details.spec.tsx`, `DetailsStepDrawer.spec.tsx` |
| Details drawer               | Escape                                                  | The trigger                                                         | `DetailsStepDrawer.spec.tsx`                     |
| Drawer step sections         | Enter or Space on a section toggle                      | Stays on the toggle; `aria-expanded` updates                        | `AssociateAWSAccountInfo.spec.tsx`               |
| Drawer role tabs (toggles)   | Tab, then Enter or Space                                | Stays on the pressed toggle; content and `aria-pressed` update      | `TabGroup.spec.tsx`                              |
| Discard dialog (YAML editor) | Enter or Space on Discard changes                       | The dialog's first control                                          | `RosaHcpYamlEditorFooter.spec.tsx`               |
| Discard dialog (YAML editor) | Tab and Shift+Tab                                       | Stay inside the dialog                                              | `RosaHcpYamlEditorFooter.spec.tsx`               |
| Discard dialog (YAML editor) | Escape, or Cancel                                       | Back on Discard changes                                             | `RosaHcpYamlEditorFooter.spec.tsx`               |
| Schema panel (YAML editor)   | Toggle from the keyboard; close from the panel's button | Stays on the toggle; the close button returns focus to it           | `RosaHcpYamlEditorStep.spec.tsx`                 |
| Schema tree                  | Arrow keys, Enter or Space                              | Move through and expand nested fields                               | `RosaHcpSchemaPanel.spec.tsx`                    |

The role tabs in the drawer are a PatternFly `ToggleGroup`: buttons with `aria-pressed`, so arrow-key navigation does not apply and is not tested.

## Known gaps and exceptions

| Gap                                                                                                | Why                                                                                                                                                                                                               | Status     |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Tab from an open plain Select or MultiSelect menu takes two presses, while the typeahead takes one | PatternFly's default closes the menu and keeps focus on the toggle; the typeahead overrides it. Focus is never lost or trapped.                                                                                   | Left as is |
| Create cluster fails validation on Review                                                          | The invalid fields live on earlier steps, so Review has nothing to focus. Only reachable with `enableAllWizardNavSteps`. The alert is announced and focus stays on Create cluster (`ROSAHCPWizardBody.spec.tsx`). | Left as is |
| Invalid field inside a collapsed section (for example Networking's advanced CIDR fields)           | Collapsed sections are not expanded automatically, so the field cannot take focus. Focus moves to the first visible invalid control, or stays on Next; the alert is announced.                                    | Left as is |
| Screen reader announcements (alert text, field errors, button state)                               | Not automated; see below.                                                                                                                                                                                         | Manual     |

Dashboard keyboard behavior (notification rows) is covered by FCN-814 and FCN-827, not here.

## Manual checks

Automation asserts where focus is, not what a screen reader says. Before release, check with VoiceOver or NVDA:

- A failed Next announces the alert and the focused field's name and error together.
- Create cluster is announced as unavailable while a submission is pending.
