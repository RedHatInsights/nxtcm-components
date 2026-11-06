import { expect, test } from '@/playwright/ct-fixture';

import { defaultRosaHcpWizardStrings } from '../../stringsProvider/rosaHcpWizardStrings.defaults';
import { checkAccessibility } from '../../test-helpers';
import type { SchemaPanelMount } from './RosaHcpSchemaPanel.story';

const s = defaultRosaHcpWizardStrings.yamlEditor;

const SCHEMA_PANEL_STORY =
  'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpSchemaPanel/SchemaPanelMount';

test.describe('RosaHcpSchemaPanel', () => {
  test('should pass accessibility checks', async ({ mount }) => {
    const component = await mount<typeof SchemaPanelMount>(SCHEMA_PANEL_STORY);
    await checkAccessibility({ component });
  });

  test('renders the panel title', async ({ mount }) => {
    const component = await mount<typeof SchemaPanelMount>(SCHEMA_PANEL_STORY);
    await expect(component.getByRole('heading', { name: s.schemaTitle })).toBeVisible();
  });

  test('renders a search input with the correct placeholder', async ({ mount }) => {
    const component = await mount<typeof SchemaPanelMount>(SCHEMA_PANEL_STORY);
    await expect(component.getByPlaceholder(s.schemaSearchPlaceholder)).toBeVisible();
  });

  test('renders schema fields from the ROSAControlPlane spec', async ({ mount }) => {
    const component = await mount<typeof SchemaPanelMount>(SCHEMA_PANEL_STORY);
    await expect(component.getByText('region', { exact: true })).toBeVisible();
    await expect(component.getByText('billingAccount', { exact: true })).toBeVisible();
  });

  test('filters fields when a search term is entered', async ({ mount }) => {
    const component = await mount<typeof SchemaPanelMount>(SCHEMA_PANEL_STORY);
    await component.getByPlaceholder(s.schemaSearchPlaceholder).fill('region');
    await expect(component.getByText('region', { exact: true })).toBeVisible();
    await expect(component.getByText('billingAccount', { exact: true })).toBeHidden();
  });

  test('renders no tree when the search matches nothing', async ({ mount }) => {
    const component = await mount<typeof SchemaPanelMount>(SCHEMA_PANEL_STORY);
    await component.getByPlaceholder(s.schemaSearchPlaceholder).fill('no-such-field');
    await expect(component.getByRole('tree')).toBeHidden();
    await expect(component.getByPlaceholder(s.schemaSearchPlaceholder)).toBeVisible();

    await component.getByRole('button', { name: 'Reset' }).click();
    await expect(component.getByRole('tree', { name: s.schemaTreeAriaLabel })).toBeVisible();
  });

  test('shows all fields again after clearing the search', async ({ mount }) => {
    const component = await mount<typeof SchemaPanelMount>(SCHEMA_PANEL_STORY);
    const searchInput = component.getByPlaceholder(s.schemaSearchPlaceholder);
    await searchInput.fill('region');
    await expect(component.getByText('billingAccount', { exact: true })).toBeHidden();

    await component.getByRole('button', { name: 'Reset' }).click();
    await expect(component.getByText('billingAccount', { exact: true })).toBeVisible();
  });

  test('renders the schema fields as a named tree', async ({ mount }) => {
    const component = await mount<typeof SchemaPanelMount>(SCHEMA_PANEL_STORY);
    await expect(component.getByRole('tree', { name: s.schemaTreeAriaLabel })).toBeVisible();
    await expect(component.getByRole('treeitem', { name: /^autoNode/ })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  test('expands a nested object field to reveal child properties', async ({ mount }) => {
    const component = await mount<typeof SchemaPanelMount>(SCHEMA_PANEL_STORY);
    await component.getByPlaceholder(s.schemaSearchPlaceholder).fill('autoNode');
    await expect(component.getByText('autoNode', { exact: true })).toBeVisible();
    await expect(component.getByText('roleARN', { exact: true })).toBeHidden();

    await component.getByRole('button', { name: /^autoNode/ }).click();
    await expect(component.getByRole('treeitem', { name: /^autoNode/ }).first()).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    await expect(component.getByText('roleARN', { exact: true })).toBeVisible();
  });

  test('collapses an expanded field when clicked again', async ({ mount }) => {
    const component = await mount<typeof SchemaPanelMount>(SCHEMA_PANEL_STORY);
    await component.getByPlaceholder(s.schemaSearchPlaceholder).fill('autoNode');
    await component.getByRole('button', { name: /^autoNode/ }).click();
    await expect(component.getByText('roleARN', { exact: true })).toBeVisible();

    await component.getByRole('button', { name: /^autoNode/ }).click();
    await expect(component.getByText('roleARN', { exact: true })).toBeHidden();
    await expect(component.getByRole('treeitem', { name: /^autoNode/ })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  test('navigates and expands nested fields with the keyboard', async ({ mount, page }) => {
    const component = await mount<typeof SchemaPanelMount>(SCHEMA_PANEL_STORY);
    await component.getByPlaceholder(s.schemaSearchPlaceholder).fill('autoNode');
    const autoNode = component.getByRole('button', { name: /^autoNode/ });

    await page.keyboard.press('Tab');
    await expect(component.getByRole('button', { name: 'Reset' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(autoNode).toBeFocused();

    await page.keyboard.press('Space');
    await expect(component.getByText('roleARN', { exact: true })).toBeVisible();

    await page.keyboard.press('ArrowDown');
    await expect(component.getByRole('button', { name: /^mode/ })).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(component.getByRole('button', { name: /^roleARN/ })).toBeFocused();

    await page.keyboard.press('ArrowLeft');
    await expect(autoNode).toBeFocused();

    await page.keyboard.press('ArrowLeft');
    await expect(component.getByText('roleARN', { exact: true })).toBeHidden();

    await page.keyboard.press('ArrowRight');
    await expect(component.getByRole('treeitem', { name: /^autoNode/ })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    await expect(autoNode).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(component.getByRole('button', { name: /^mode/ })).toBeFocused();
  });

  test('nests deeply nested fields in tree groups and keeps them accessible', async ({ mount }) => {
    const component = await mount<typeof SchemaPanelMount>(SCHEMA_PANEL_STORY);
    await component.getByRole('button', { name: /^defaultMachinePoolSpec/ }).click();
    await component.getByRole('button', { name: /^autoscaling/ }).click();

    await expect(component.getByRole('treeitem', { name: /^maxReplicas/ })).toBeVisible();
    await expect(component.getByRole('group')).toHaveCount(2);
    await checkAccessibility({ component });
  });

  test('calls onClose when the close button is clicked', async ({ mount, page }) => {
    const component = await mount<typeof SchemaPanelMount>(SCHEMA_PANEL_STORY, { onClose: true });
    await page.getByRole('button', { name: s.schemaToggleAriaLabel }).click();
    await expect
      .poll(() =>
        component
          .getByTestId('onClose-calls')
          .evaluate((input: HTMLInputElement) => JSON.parse(input.value) as unknown[][])
      )
      .toHaveLength(1);
  });
});
