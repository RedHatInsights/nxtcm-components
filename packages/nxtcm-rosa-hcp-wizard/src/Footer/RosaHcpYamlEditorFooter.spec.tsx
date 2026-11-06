import { expect, test } from '@/playwright/ct-fixture';

import { defaultRosaHcpWizardStrings } from '../stringsProvider/rosaHcpWizardStrings.defaults';
import { checkAccessibility } from '../test-helpers';
import type { YamlEditorFooterMount } from './RosaHcpYamlEditorFooter.story';

const w = defaultRosaHcpWizardStrings.wizard;
const s = defaultRosaHcpWizardStrings.yamlEditor;

test.describe('RosaHcpYamlEditorFooter', () => {
  test('should pass accessibility checks', async ({ mount }) => {
    const component = await mount<typeof YamlEditorFooterMount>(
      'nxtcm-rosa-hcp-wizard/Footer/RosaHcpYamlEditorFooter/YamlEditorFooterMount'
    );
    await checkAccessibility({ component });
  });

  test('renders the Create cluster, Discard changes, and Cancel buttons', async ({ mount }) => {
    const component = await mount<typeof YamlEditorFooterMount>(
      'nxtcm-rosa-hcp-wizard/Footer/RosaHcpYamlEditorFooter/YamlEditorFooterMount'
    );
    await expect(component.getByRole('button', { name: w.createCluster })).toBeVisible();
    await expect(component.getByRole('button', { name: s.discardChanges })).toBeVisible();
    await expect(component.getByRole('button', { name: s.cancelCreation })).toBeVisible();
  });

  test('opens the discard confirmation modal when Discard is clicked', async ({ mount, page }) => {
    await mount<typeof YamlEditorFooterMount>(
      'nxtcm-rosa-hcp-wizard/Footer/RosaHcpYamlEditorFooter/YamlEditorFooterMount'
    );
    await page.getByRole('button', { name: s.discardChanges }).click();
    await expect(page.getByRole('heading', { name: s.discardConfirmTitle })).toBeVisible();
    await expect(page.getByText(s.discardConfirmBody)).toBeVisible();
  });

  test('calls onClose when the discard confirmation is accepted', async ({ mount, page }) => {
    const component = await mount<typeof YamlEditorFooterMount>(
      'nxtcm-rosa-hcp-wizard/Footer/RosaHcpYamlEditorFooter/YamlEditorFooterMount',
      {
        onClose: true,
      }
    );
    await page.getByRole('button', { name: s.discardChanges }).click();
    await page.getByRole('button', { name: s.discardConfirmYes }).click();
    await expect
      .poll(() =>
        component
          .getByTestId('onClose-calls')
          .evaluate((input: HTMLInputElement) => JSON.parse(input.value) as unknown[][])
      )
      .toHaveLength(1);
  });

  test('keeps the modal closed after the user cancels the discard prompt', async ({
    mount,
    page,
  }) => {
    await mount<typeof YamlEditorFooterMount>(
      'nxtcm-rosa-hcp-wizard/Footer/RosaHcpYamlEditorFooter/YamlEditorFooterMount'
    );
    await page.getByRole('button', { name: s.discardChanges }).click();
    await expect(page.getByRole('heading', { name: s.discardConfirmTitle })).toBeVisible();

    await page.getByRole('button', { name: w.cancel }).click();
    await expect(page.getByRole('heading', { name: s.discardConfirmTitle })).toBeHidden();
  });

  test('calls onCancel when the Cancel cluster creation link is clicked', async ({
    mount,
    page,
  }) => {
    const component = await mount<typeof YamlEditorFooterMount>(
      'nxtcm-rosa-hcp-wizard/Footer/RosaHcpYamlEditorFooter/YamlEditorFooterMount',
      {
        onCancel: true,
      }
    );
    await page.getByRole('button', { name: s.cancelCreation }).click();
    await expect
      .poll(() =>
        component
          .getByTestId('onCancel-calls')
          .evaluate((input: HTMLInputElement) => JSON.parse(input.value) as unknown[][])
      )
      .toHaveLength(1);
  });

  test('calls onSubmit with the exact YAML string returned by the editor, including advanced fields not mapped by the form', async ({
    mount,
    page,
  }) => {
    const EDITOR_YAML = [
      'kind: ROSAControlPlane',
      'metadata:',
      '  name: mycluster',
      'spec:',
      '  region: us-east-1',
      '  auditLog:',
      '    enabled: true',
    ].join('\n');
    const component = await mount<typeof YamlEditorFooterMount>(
      'nxtcm-rosa-hcp-wizard/Footer/RosaHcpYamlEditorFooter/YamlEditorFooterMount',
      {
        yamlContent: EDITOR_YAML,
        onSubmit: true,
      }
    );

    await page.getByRole('button', { name: w.createCluster }).click();

    await expect
      .poll(
        async () =>
          (
            await component
              .getByTestId('onSubmit-calls')
              .evaluate((input: HTMLInputElement) => JSON.parse(input.value) as unknown[][])
          )[0]?.[0]
      )
      .toBe(EDITOR_YAML);
  });

  test('does not call onSubmit when the editor has schema errors', async ({ mount, page }) => {
    const component = await mount<typeof YamlEditorFooterMount>(
      'nxtcm-rosa-hcp-wizard/Footer/RosaHcpYamlEditorFooter/YamlEditorFooterMount',
      {
        hasSchemaErrors: true,
        onSubmit: true,
      }
    );
    await page.getByRole('button', { name: w.createCluster }).click();
    await expect
      .poll(() =>
        component
          .getByTestId('onSubmit-calls')
          .evaluate((input: HTMLInputElement) => JSON.parse(input.value) as unknown[][])
      )
      .toHaveLength(0);
  });

  test.describe('Keyboard', () => {
    const STORY = 'nxtcm-rosa-hcp-wizard/Footer/RosaHcpYamlEditorFooter/YamlEditorFooterMount';

    for (const key of ['Enter', 'Space'] as const) {
      test(`${key} on Discard changes opens the dialog and focuses its first control`, async ({
        mount,
        page,
      }) => {
        const component = await mount<typeof YamlEditorFooterMount>(STORY);

        await component.getByRole('button', { name: s.discardChanges }).press(key);

        const dialog = page.getByRole('dialog', { name: s.discardConfirmTitle });
        await expect(dialog).toBeVisible();
        await expect(dialog).toHaveAccessibleDescription(s.discardConfirmBody);
        // Modal focuses its first tabbable element: the close button.
        await expect(
          dialog.getByRole('button', { name: s.discardModalCloseAriaLabel })
        ).toBeFocused();
      });
    }

    test('Tab and Shift+Tab keep focus inside the dialog', async ({ mount, page }) => {
      const component = await mount<typeof YamlEditorFooterMount>(STORY);
      await component.getByRole('button', { name: s.discardChanges }).press('Enter');

      const dialog = page.getByRole('dialog', { name: s.discardConfirmTitle });
      const close = dialog.getByRole('button', { name: s.discardModalCloseAriaLabel });
      const confirm = dialog.getByRole('button', { name: s.discardConfirmYes });
      const cancel = dialog.getByRole('button', { name: w.cancel, exact: true });
      await expect(close).toBeFocused();

      for (const next of [confirm, cancel, close]) {
        await page.keyboard.press('Tab');
        await expect(next).toBeFocused();
      }
      for (const previous of [cancel, confirm, close]) {
        await page.keyboard.press('Shift+Tab');
        await expect(previous).toBeFocused();
      }
    });

    test('Escape closes the dialog and returns focus to Discard changes', async ({
      mount,
      page,
    }) => {
      const component = await mount<typeof YamlEditorFooterMount>(STORY, { onClose: true });
      const discard = component.getByRole('button', { name: s.discardChanges });
      await discard.press('Enter');
      await expect(page.getByRole('dialog')).toBeVisible();

      await page.keyboard.press('Escape');

      await expect(page.getByRole('dialog')).toBeHidden();
      await expect(discard).toBeFocused();
      await expect(component.getByTestId('onClose-count')).toHaveValue('0');
    });

    test('Cancel closes the dialog and returns focus to Discard changes', async ({
      mount,
      page,
    }) => {
      const component = await mount<typeof YamlEditorFooterMount>(STORY, { onClose: true });
      const discard = component.getByRole('button', { name: s.discardChanges });
      await discard.press('Enter');

      await page
        .getByRole('dialog')
        .getByRole('button', { name: w.cancel, exact: true })
        .press('Enter');

      await expect(page.getByRole('dialog')).toBeHidden();
      await expect(discard).toBeFocused();
      await expect(component.getByTestId('onClose-count')).toHaveValue('0');
    });

    test('Enter on Yes closes the dialog and calls onClose', async ({ mount, page }) => {
      const component = await mount<typeof YamlEditorFooterMount>(STORY, { onClose: true });
      await component.getByRole('button', { name: s.discardChanges }).press('Enter');

      await page
        .getByRole('dialog')
        .getByRole('button', { name: s.discardConfirmYes })
        .press('Enter');

      await expect(page.getByRole('dialog')).toBeHidden();
      await expect(component.getByTestId('onClose-count')).toHaveValue('1');
    });

    for (const key of ['Enter', 'Space'] as const) {
      test(`${key} on Create cluster submits the YAML`, async ({ mount }) => {
        const component = await mount<typeof YamlEditorFooterMount>(STORY, {
          yamlContent: 'kind: ROSAControlPlane',
          onSubmit: true,
        });

        await component.getByRole('button', { name: w.createCluster }).press(key);

        await expect(component.getByTestId('onSubmit-count')).toHaveValue('1');
      });
    }

    test('Enter on Create cluster does not submit while the YAML has schema errors', async ({
      mount,
    }) => {
      const component = await mount<typeof YamlEditorFooterMount>(STORY, {
        hasSchemaErrors: true,
        onSubmit: true,
      });
      const createCluster = component.getByRole('button', { name: w.createCluster });

      await createCluster.press('Enter');

      await expect(component.getByTestId('onSubmit-count')).toHaveValue('0');
      await expect(createCluster).toBeFocused();
    });

    test('Enter on Cancel cluster creation calls onCancel', async ({ mount }) => {
      const component = await mount<typeof YamlEditorFooterMount>(STORY, { onCancel: true });

      await component.getByRole('button', { name: s.cancelCreation }).press('Enter');

      await expect(component.getByTestId('onCancel-count')).toHaveValue('1');
    });

    test('has no accessibility violations with the discard dialog open', async ({
      mount,
      page,
    }) => {
      const component = await mount<typeof YamlEditorFooterMount>(STORY);
      await component.getByRole('button', { name: s.discardChanges }).press('Enter');

      // The Modal renders outside the component root.
      await checkAccessibility({ component: page.getByRole('dialog') });
    });
  });
});
