// See docs/agent-rules/playwright-ct.md for Playwright component test conventions.
import { expect, storyCallback, storyCallbackCalls, test } from '@/ct-fixture';

import { defaultRosaHcpWizardStrings } from '../stringsProvider/rosaHcpWizardStrings.defaults';
import { checkAccessibility } from '../test-helpers';

const w = defaultRosaHcpWizardStrings.wizard;
const s = defaultRosaHcpWizardStrings.yamlEditor;

test.describe('RosaHcpYamlEditorFooter', () => {
  test('should pass accessibility checks', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/Footer/RosaHcpYamlEditorFooter/YamlEditorFooterMount'
    );
    await checkAccessibility({ component });
  });

  test('renders the Create cluster, Discard changes, and Cancel buttons', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/Footer/RosaHcpYamlEditorFooter/YamlEditorFooterMount'
    );
    await expect(component.getByRole('button', { name: w.createCluster })).toBeVisible();
    await expect(component.getByRole('button', { name: s.discardChanges })).toBeVisible();
    await expect(component.getByRole('button', { name: s.cancelCreation })).toBeVisible();
  });

  test('opens the discard confirmation modal when Discard is clicked', async ({ mount, page }) => {
    await mount('nxtcm-rosa-hcp-wizard/Footer/RosaHcpYamlEditorFooter/YamlEditorFooterMount');
    await page.getByRole('button', { name: s.discardChanges }).click();
    await expect(page.getByRole('heading', { name: s.discardConfirmTitle })).toBeVisible();
    await expect(page.getByText(s.discardConfirmBody)).toBeVisible();
  });

  test('calls onClose when the discard confirmation is accepted', async ({ mount, page }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/Footer/RosaHcpYamlEditorFooter/YamlEditorFooterMount',
      {
        onClose: storyCallback('onClose'),
      }
    );
    await page.getByRole('button', { name: s.discardChanges }).click();
    await page.getByRole('button', { name: s.discardConfirmYes }).click();
    await expect.poll(() => storyCallbackCalls(component, 'onClose')).toHaveLength(1);
  });

  test('keeps the modal closed after the user cancels the discard prompt', async ({
    mount,
    page,
  }) => {
    await mount('nxtcm-rosa-hcp-wizard/Footer/RosaHcpYamlEditorFooter/YamlEditorFooterMount');
    await page.getByRole('button', { name: s.discardChanges }).click();
    await expect(page.getByRole('heading', { name: s.discardConfirmTitle })).toBeVisible();

    await page.getByRole('button', { name: w.cancel }).click();
    await expect(page.getByRole('heading', { name: s.discardConfirmTitle })).not.toBeVisible();
  });

  test('calls onCancel when the Cancel cluster creation link is clicked', async ({
    mount,
    page,
  }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/Footer/RosaHcpYamlEditorFooter/YamlEditorFooterMount',
      {
        onCancel: storyCallback('onCancel'),
      }
    );
    await page.getByRole('button', { name: s.cancelCreation }).click();
    await expect.poll(() => storyCallbackCalls(component, 'onCancel')).toHaveLength(1);
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
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/Footer/RosaHcpYamlEditorFooter/YamlEditorFooterMount',
      {
        yamlContent: EDITOR_YAML,
        onSubmit: storyCallback('onSubmit'),
      }
    );

    await page.getByRole('button', { name: w.createCluster }).click();

    await expect
      .poll(async () => (await storyCallbackCalls(component, 'onSubmit'))[0]?.[0])
      .toBe(EDITOR_YAML);
  });

  test('does not call onSubmit when the editor has schema errors', async ({ mount, page }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/Footer/RosaHcpYamlEditorFooter/YamlEditorFooterMount',
      {
        hasSchemaErrors: true,
        onSubmit: storyCallback('onSubmit'),
      }
    );
    await page.getByRole('button', { name: w.createCluster }).click();
    await expect.poll(() => storyCallbackCalls(component, 'onSubmit')).toHaveLength(0);
  });
});
