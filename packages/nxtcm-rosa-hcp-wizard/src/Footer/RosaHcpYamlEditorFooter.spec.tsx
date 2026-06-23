import { expect, test } from '@playwright/experimental-ct-react';

import { checkAccessibility } from '../test-helpers';
import { defaultRosaHcpWizardStrings } from '../stringsProvider/rosaHcpWizardStrings.defaults';
import { YamlEditorFooterMount } from './RosaHcpYamlEditorFooter.spec-helpers';

const w = defaultRosaHcpWizardStrings.wizard;
const s = defaultRosaHcpWizardStrings.yamlEditor;

test.describe('RosaHcpYamlEditorFooter', () => {
  test('should pass accessibility checks', async ({ mount }) => {
    const component = await mount(<YamlEditorFooterMount />);
    await checkAccessibility({ component });
  });

  test('renders the Create cluster, Discard changes, and Cancel buttons', async ({ mount }) => {
    const component = await mount(<YamlEditorFooterMount />);
    await expect(component.getByRole('button', { name: w.createCluster })).toBeVisible();
    await expect(component.getByRole('button', { name: s.discardChanges })).toBeVisible();
    await expect(component.getByRole('button', { name: s.cancelCreation })).toBeVisible();
  });

  test('opens the discard confirmation modal when Discard is clicked', async ({ mount, page }) => {
    await mount(<YamlEditorFooterMount />);
    await page.getByRole('button', { name: s.discardChanges }).click();
    await expect(page.getByRole('heading', { name: s.discardConfirmTitle })).toBeVisible();
    await expect(page.getByText(s.discardConfirmBody)).toBeVisible();
  });

  test('calls onClose when the discard confirmation is accepted', async ({ mount, page }) => {
    let closed = false;
    await mount(
      <YamlEditorFooterMount
        onClose={() => {
          closed = true;
        }}
      />
    );
    await page.getByRole('button', { name: s.discardChanges }).click();
    await page.getByRole('button', { name: s.discardConfirmYes }).click();
    expect(closed).toBe(true);
  });

  test('keeps the modal closed after the user cancels the discard prompt', async ({
    mount,
    page,
  }) => {
    await mount(<YamlEditorFooterMount />);
    await page.getByRole('button', { name: s.discardChanges }).click();
    await expect(page.getByRole('heading', { name: s.discardConfirmTitle })).toBeVisible();

    await page.getByRole('button', { name: w.cancel }).click();
    await expect(page.getByRole('heading', { name: s.discardConfirmTitle })).not.toBeVisible();
  });

  test('calls onCancel when the Cancel cluster creation link is clicked', async ({
    mount,
    page,
  }) => {
    let cancelled = false;
    await mount(
      <YamlEditorFooterMount
        onCancel={() => {
          cancelled = true;
        }}
      />
    );
    await page.getByRole('button', { name: s.cancelCreation }).click();
    expect(cancelled).toBe(true);
  });

  test('does not call onSubmit when the editor has schema errors', async ({ mount, page }) => {
    let submitted = false;
    await mount(
      <YamlEditorFooterMount
        hasSchemaErrors={true}
        onSubmit={() => {
          submitted = true;
          return Promise.resolve();
        }}
      />
    );
    await page.getByRole('button', { name: w.createCluster }).click();
    expect(submitted).toBe(false);
  });
});
