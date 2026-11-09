import type { Locator } from '@playwright/test';

import { expect, test } from '@/playwright/ct-fixture';

import { defaultRosaHcpWizardStrings } from '../../stringsProvider/rosaHcpWizardStrings.defaults';
import { checkAccessibility } from '../../test-helpers';
import type {
  YamlEditorStepMount,
  YamlEditorStepNoPrimarySchemaMount,
  YamlEditorStepValidationMount,
} from './RosaHcpYamlEditorStep.story';

const s = defaultRosaHcpWizardStrings.yamlEditor;
const EDITOR_NAME = s.title;
const VALIDATION_STORY =
  'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepValidationMount';
const NO_PRIMARY_STORY =
  'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepNoPrimarySchemaMount';

type MonacoTestHandle = { getValue: () => string; setValue: (value: string) => void };

// The panel's close button shares the toggle's name, so find the toggle by test id.
const schemaToggle = (component: Locator) => component.getByTestId('schema-panel-toggle');

async function schemaPanelCloseButton(component: Locator): Promise<Locator> {
  const panelId = await schemaToggle(component).getAttribute('aria-controls');
  return component
    .locator(`[id="${panelId}"]`)
    .getByRole('button', { name: s.schemaToggleAriaLabel });
}

async function expectTogglePointsAtPanel(component: Locator): Promise<void> {
  const toggle = schemaToggle(component);
  await expect(toggle).toHaveAttribute('aria-controls', /.+/);
  const panelId = (await toggle.getAttribute('aria-controls')) ?? '';
  await expect(
    component
      .locator(`[id="${panelId}"]`)
      .getByRole('heading', { name: /ROSAControlPlane schema/i })
  ).toBeVisible();
}

async function showSchemaErrors(component: Locator): Promise<void> {
  await component.getByRole('button', { name: 'Check schema errors' }).click();
  await expect(component.getByTestId('hasSchemaErrors-result')).toHaveValue('true');
}

// Helper to wait for Monaco editor to be ready

async function waitForMonaco(component: Locator): Promise<void> {
  // Wait for Monaco editor and its content to render
  await component.locator('.monaco-editor').waitFor({ timeout: 10000 });
  // Wait for view-lines (Monaco's content area) to be visible
  await component.locator('.view-lines').waitFor({ timeout: 10000 });
}

test.describe('RosaHcpYamlEditorStep - Monaco Integration', () => {
  test('renders Monaco editor', async ({ mount }) => {
    const component = await mount<typeof YamlEditorStepMount>(
      'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount'
    );

    await waitForMonaco(component);

    // Verify Monaco editor is rendered
    await expect(component.locator('.monaco-editor')).toBeVisible();
    await expect(component.locator('.view-lines')).toBeVisible();
  });

  test('displays CodeEditor component', async ({ mount }) => {
    const component = await mount<typeof YamlEditorStepMount>(
      'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount'
    );

    await waitForMonaco(component);

    // Verify PatternFly CodeEditor wrapper is present
    await expect(component.locator('.pf-v6-c-code-editor')).toBeVisible();
  });

  test.describe('Schema Panel Toggle', () => {
    test('toggles the schema panel', async ({ mount }) => {
      const component = await mount<typeof YamlEditorStepMount>(
        'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount'
      );

      await waitForMonaco(component);

      const toggleButton = component.getByTestId('schema-panel-toggle');
      const schemaHeading = component.getByRole('heading', {
        name: /ROSAControlPlane schema/i,
      });

      await expect(toggleButton).toBeVisible();
      await expect(schemaHeading).toBeVisible();

      await toggleButton.click();
      await expect(schemaHeading).toBeHidden();

      await toggleButton.click();
      await expect(schemaHeading).toBeVisible();
    });

    test('hides the schema toggle when no schema is primary', async ({ mount }) => {
      const component = await mount<typeof YamlEditorStepNoPrimarySchemaMount>(NO_PRIMARY_STORY);

      await waitForMonaco(component);

      // No panel can render, so the toggle must not report one.
      await expect(component.getByRole('button', { name: s.schemaToggleAriaLabel })).toHaveCount(0);
      await expect(
        component.getByRole('heading', { name: /ROSAControlPlane schema/i })
      ).toHaveCount(0);
    });

    test('does not move focus on first render', async ({ mount, page }) => {
      const component = await mount<typeof YamlEditorStepMount>(
        'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount'
      );

      await waitForMonaco(component);

      expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
    });

    test('acts as a disclosure and keeps focus while toggled from the keyboard', async ({
      mount,
    }) => {
      const component = await mount<typeof YamlEditorStepMount>(
        'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount'
      );

      await waitForMonaco(component);

      const toggle = schemaToggle(component);
      const schemaHeading = component.getByRole('heading', { name: /ROSAControlPlane schema/i });
      await expect(toggle).toHaveAccessibleName(s.schemaToggleAriaLabel);
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expectTogglePointsAtPanel(component);

      await toggle.press('Enter');
      await expect(schemaHeading).toBeHidden();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(toggle).not.toHaveAttribute('aria-controls');
      await expect(toggle).toBeFocused();

      await toggle.press('Space');
      await expect(schemaHeading).toBeVisible();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expectTogglePointsAtPanel(component);
      await expect(toggle).toBeFocused();
    });

    test('returns focus to the toggle when the panel close button is used', async ({ mount }) => {
      const component = await mount<typeof YamlEditorStepMount>(
        'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount'
      );

      await waitForMonaco(component);

      await (await schemaPanelCloseButton(component)).press('Enter');

      const toggle = schemaToggle(component);
      await expect(
        component.getByRole('heading', { name: /ROSAControlPlane schema/i })
      ).toBeHidden();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(toggle).toBeFocused();
    });

    test('has no accessibility violations with the schema panel closed', async ({ mount }) => {
      const component = await mount<typeof YamlEditorStepMount>(
        'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount'
      );

      await waitForMonaco(component);
      await schemaToggle(component).press('Enter');
      await expect(
        component.getByRole('heading', { name: /ROSAControlPlane schema/i })
      ).toBeHidden();

      // Monaco's syntax colors fail contrast.
      await checkAccessibility({ component, ignoreRules: ['color-contrast'] });
    });
  });

  test.describe('Toolbar', () => {
    test('reaches every toolbar control with Tab, in order, by accessible name', async ({
      mount,
      page,
    }) => {
      const component = await mount<typeof YamlEditorStepMount>(
        'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount'
      );

      await waitForMonaco(component);

      const copy = component.getByRole('button', { name: 'Copy code to clipboard' });
      await copy.focus();
      await expect(copy).toBeFocused();

      for (const control of [
        component.getByRole('button', { name: 'Download code' }),
        schemaToggle(component),
        component.getByRole('button', { name: s.shortcutsButtonText }),
      ]) {
        await page.keyboard.press('Tab');
        await expect(control).toBeFocused();
      }
    });
  });

  test.describe('Initial State', () => {
    test('does not show error banner initially', async ({ mount }) => {
      const component = await mount<typeof YamlEditorStepMount>(
        'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount'
      );

      await waitForMonaco(component);

      // Monaco has its own role="alert" nodes; check our region only.
      const region = component.getByTestId('yaml-validation-live-region');
      await expect(region).toBeAttached();
      await expect(region.getByRole('listitem')).toHaveCount(0);
    });

    // Note: Monaco interaction tests (clicking, focusing) are flaky in CT due to Monaco's
    // complex DOM structure. These interactions are better tested in E2E or manual testing.
  });

  test.describe('Component Props', () => {
    test('renders without errors when onClose prop is provided', async ({ mount }) => {
      const component = await mount<typeof YamlEditorStepMount>(
        'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount',
        {
          onClose: true,
        }
      );

      await waitForMonaco(component);
      await expect(component.locator('.monaco-editor')).toBeVisible();
    });

    test('renders without errors when onCancel prop is provided', async ({ mount }) => {
      const component = await mount<typeof YamlEditorStepMount>(
        'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount',
        {
          onCancel: true,
        }
      );

      await waitForMonaco(component);
      await expect(component.locator('.monaco-editor')).toBeVisible();
    });
  });

  test.describe('Monaco Configuration', () => {
    test('sets up YAML language mode', async ({ mount }) => {
      const component = await mount<typeof YamlEditorStepMount>(
        'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount'
      );

      await waitForMonaco(component);

      // Check that Monaco is configured for YAML
      // The .view-lines should contain YAML syntax highlighting
      const viewLines = component.locator('.view-lines');
      await expect(viewLines).toBeVisible();
    });

    test('enables copy functionality', async ({ mount }) => {
      const component = await mount<typeof YamlEditorStepMount>(
        'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount'
      );

      await waitForMonaco(component);

      // CodeEditor should have copy button
      const copyButton = component.locator('button[aria-label*="Copy"]');
      await expect(copyButton).toBeVisible();
    });

    test('enables download functionality', async ({ mount }) => {
      const component = await mount<typeof YamlEditorStepMount>(
        'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount'
      );

      await waitForMonaco(component);

      // CodeEditor should have download button
      const downloadButton = component.locator('button[aria-label*="Download"]');
      await expect(downloadButton).toBeVisible();
    });
  });

  test.describe('Editor Accessibility', () => {
    test('Monaco textarea is accessible', async ({ mount }) => {
      const component = await mount<typeof YamlEditorStepMount>(
        'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount'
      );

      await waitForMonaco(component);

      // Monaco creates a textarea for accessibility
      const textarea = component.locator('.monaco-editor textarea');
      await expect(textarea).toBeVisible();
    });

    // Note: Keyboard navigation tests are flaky in CT due to Monaco's focus management
    // Keyboard accessibility is better verified in E2E or manual testing
  });

  test.describe('Editor Name and Shortcuts', () => {
    test('names the Monaco textbox', async ({ mount }) => {
      const component = await mount<typeof YamlEditorStepMount>(
        'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount'
      );

      await waitForMonaco(component);
      // Firefox reports Monaco's input as hidden.
      const textbox = component.getByRole('textbox', { name: EDITOR_NAME });
      await expect(textbox).toBeAttached();
      await expect(textbox).not.toHaveAttribute('aria-hidden', 'true');
    });

    test('names the focusable editor wrapper and describes how to enter and leave', async ({
      mount,
    }) => {
      const component = await mount<typeof YamlEditorStepMount>(
        'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount'
      );

      await waitForMonaco(component);

      const wrapper = component.getByRole('group', { name: EDITOR_NAME });
      await expect(wrapper).toHaveAttribute('tabindex', '0');
      await expect(wrapper).toHaveAccessibleDescription(s.editorInstructions);
    });

    test('lists the editor keyboard shortcuts in a keyboard-reachable popover', async ({
      mount,
      page,
    }) => {
      const component = await mount<typeof YamlEditorStepMount>(
        'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount'
      );

      await waitForMonaco(component);

      const shortcutsButton = component.getByRole('button', { name: s.shortcutsButtonText });
      await shortcutsButton.focus();
      await page.keyboard.press('Enter');

      const popover = page.getByRole('dialog', { name: s.shortcutsAriaLabel });
      await expect(popover).toBeVisible();
      await expect(popover.getByRole('definition')).toHaveText([
        s.shortcutStartEditing,
        s.shortcutLeaveEditor,
        s.shortcutToggleTabFocus,
        s.shortcutNextProblem,
        s.shortcutPreviousProblem,
        s.shortcutCommandPalette,
      ]);
      // Key labels concatenate without spaces.
      await expect(popover.getByRole('term')).toHaveText([
        'Down Arrow',
        'Shift+Tab',
        'Ctrl+MCtrl+Shift+M(macOS)',
        'F8',
        'Shift+F8',
        'F1',
      ]);

      // Keys stay on one line, with a gap before the description.
      const MIN_GAP_PX = 16;
      const crowdedTerms = await popover.getByRole('term').evaluateAll(
        (terms, minGap) =>
          terms
            .filter((term) => {
              const leaves = Array.from(term.querySelectorAll('*')).filter(
                (el) => el.childElementCount === 0
              );
              const contentRight = Math.max(
                ...leaves.map((el) => el.getBoundingClientRect().right)
              );
              const description = term.parentElement?.querySelector('dd');
              if (!description) return true;
              return description.getBoundingClientRect().left - contentRight < minGap;
            })
            .map((term) => term.textContent),
        MIN_GAP_PX
      );
      expect(crowdedTerms).toEqual([]);

      await page.keyboard.press('Escape');
      await expect(popover).toBeHidden();
      await expect(shortcutsButton).toBeFocused();
    });

    test('has no accessibility violations in the default editor view', async ({ mount }) => {
      const component = await mount<typeof YamlEditorStepMount>(
        'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount'
      );

      await waitForMonaco(component);

      // Monaco's syntax colors fail contrast.
      await checkAccessibility({ component, ignoreRules: ['color-contrast'] });
    });
  });

  test.describe('Validation Feedback', () => {
    test('renders an empty polite live region before any error is shown', async ({ mount }) => {
      const component = await mount<typeof YamlEditorStepValidationMount>(VALIDATION_STORY);

      await waitForMonaco(component);

      // The banner waits for submit or blur.
      const region = component.getByTestId('yaml-validation-live-region');
      await expect(region).toHaveAttribute('aria-live', 'polite');
      await expect(region.getByRole('listitem')).toHaveCount(0);
    });

    test('shows the validation alert inside the live region', async ({ mount }) => {
      const component = await mount<typeof YamlEditorStepValidationMount>(VALIDATION_STORY);

      await waitForMonaco(component);
      await showSchemaErrors(component);

      const region = component.getByTestId('yaml-validation-live-region');
      await expect(region.getByRole('listitem')).toHaveCount(1);
      await expect(region).toContainText(s.parseErrorTitle);
      await expect(region).toContainText('1 validation error found');
    });

    test('pluralizes the error count', async ({ mount }) => {
      const component = await mount<typeof YamlEditorStepValidationMount>(VALIDATION_STORY, {
        invalidLineCount: 2,
      });

      await waitForMonaco(component);
      await showSchemaErrors(component);

      await expect(component.getByTestId('yaml-validation-live-region')).toContainText(
        '2 validation errors found'
      );
    });

    test('clears the alert once the YAML is valid again', async ({ mount, page }) => {
      const component = await mount<typeof YamlEditorStepValidationMount>(VALIDATION_STORY);

      await waitForMonaco(component);
      await showSchemaErrors(component);

      const region = component.getByTestId('yaml-validation-live-region');
      await expect(region.getByRole('listitem')).toHaveCount(1);

      // A visible banner updates on edit.
      await page.evaluate(() => {
        const editor = (window as Window & { monacoEditor?: MonacoTestHandle }).monacoEditor;
        if (!editor) throw new Error('window.monacoEditor is not exposed');
        editor.setValue(
          editor
            .getValue()
            .split('\n')
            .filter((line) => !line.includes('INVALID'))
            .join('\n')
        );
      });

      await expect(region.getByRole('listitem')).toHaveCount(0);
      await expect(region).toHaveAttribute('aria-live', 'polite');

      await component.getByRole('button', { name: 'Check schema errors' }).click();
      await expect(component.getByTestId('hasSchemaErrors-result')).toHaveValue('false');
    });

    test('has no accessibility violations while the validation alert is shown', async ({
      mount,
    }) => {
      const component = await mount<typeof YamlEditorStepValidationMount>(VALIDATION_STORY);

      await waitForMonaco(component);
      await showSchemaErrors(component);
      await expect(
        component.getByTestId('yaml-validation-live-region').getByRole('listitem')
      ).toHaveCount(1);

      // Monaco's syntax colors fail contrast.
      await checkAccessibility({ component, ignoreRules: ['color-contrast'] });
    });
  });
});
