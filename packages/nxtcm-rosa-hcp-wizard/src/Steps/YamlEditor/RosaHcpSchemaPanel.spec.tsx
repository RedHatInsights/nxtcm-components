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
    const tree = component.getByRole('tree', { name: s.schemaTreeAriaLabel });
    await expect(tree).toBeVisible();
    await expect(tree).toHaveAccessibleName(s.schemaTreeAriaLabel);
    await expect(component.getByRole('button', { name: /^autoNode\b/ })).toHaveAccessibleName(
      /^autoNode\b/
    );
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
    const autoNode = component.getByRole('button', { name: /^autoNode\b/ });
    const autoNodeItem = component.getByRole('treeitem', { name: /^autoNode\b/ });

    await page.keyboard.press('Tab');
    await expect(component.getByRole('button', { name: 'Reset' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(autoNode).toBeFocused();
    await expect(autoNode).toHaveAccessibleName(/^autoNode\b/);
    await expect(autoNodeItem).toHaveAttribute('aria-expanded', 'false');

    await page.keyboard.press('Space');
    await expect(autoNode).toBeFocused();
    await expect(autoNodeItem).toHaveAttribute('aria-expanded', 'true');
    await expect(component.getByText('roleARN', { exact: true })).toBeVisible();

    await page.keyboard.press('ArrowDown');
    await expect(component.getByRole('button', { name: /^mode/ })).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(component.getByRole('button', { name: /^roleARN/ })).toBeFocused();

    await page.keyboard.press('ArrowLeft');
    await expect(autoNode).toBeFocused();

    await page.keyboard.press('ArrowLeft');
    await expect(component.getByText('roleARN', { exact: true })).toBeHidden();
    await expect(autoNodeItem).toHaveAttribute('aria-expanded', 'false');
    await expect(autoNode).toBeFocused();

    await page.keyboard.press('ArrowRight');
    await expect(autoNodeItem).toHaveAttribute('aria-expanded', 'true');
    await expect(autoNode).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(autoNodeItem).toHaveAttribute('aria-expanded', 'false');
    await expect(autoNode).toBeFocused();
    await expect(component.getByText('roleARN', { exact: true })).toBeHidden();

    await page.keyboard.press('Enter');
    await expect(autoNodeItem).toHaveAttribute('aria-expanded', 'true');
    await expect(autoNode).toBeFocused();
    await expect(component.getByText('roleARN', { exact: true })).toBeVisible();
  });

  test('expands a second-level field with the keyboard and keeps it accessible', async ({
    mount,
    page,
  }) => {
    const component = await mount<typeof SchemaPanelMount>(SCHEMA_PANEL_STORY);
    const machinePool = component.getByRole('button', { name: /^defaultMachinePoolSpec\b/ });
    const machinePoolItem = component.getByRole('treeitem', { name: /^defaultMachinePoolSpec\b/ });
    const autoscaling = component.getByRole('button', { name: /^autoscaling\b/ });
    const autoscalingItem = component.getByRole('treeitem', { name: /^autoscaling\b/ });

    await expect(machinePool).toHaveAccessibleName(/^defaultMachinePoolSpec\b/);
    await expect(machinePoolItem).toHaveAttribute('aria-expanded', 'false');
    await machinePool.focus();
    await page.keyboard.press('Enter');
    await expect(machinePool).toBeFocused();
    await expect(machinePoolItem).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('ArrowDown');
    await expect(autoscaling).toBeFocused();
    await expect(autoscaling).toHaveAccessibleName(/^autoscaling\b/);
    await expect(autoscalingItem).toHaveAttribute('aria-expanded', 'false');

    await page.keyboard.press('Space');
    await expect(autoscaling).toBeFocused();
    await expect(autoscalingItem).toHaveAttribute('aria-expanded', 'true');
    await expect(component.getByRole('treeitem', { name: /^maxReplicas\b/ })).toBeVisible();

    await page.keyboard.press('Space');
    await expect(autoscaling).toBeFocused();
    await expect(autoscalingItem).toHaveAttribute('aria-expanded', 'false');
    await expect(component.getByRole('treeitem', { name: /^maxReplicas\b/ })).toBeHidden();

    await page.keyboard.press('Enter');
    await expect(autoscaling).toBeFocused();
    await expect(autoscalingItem).toHaveAttribute('aria-expanded', 'true');

    await expect(component.getByRole('treeitem', { name: /^maxReplicas\b/ })).toBeVisible();
    await expect(component.getByRole('group')).toHaveCount(2);
    await component.evaluate(async (element) => {
      await new Promise(requestAnimationFrame);
      await Promise.allSettled(
        element.getAnimations({ subtree: true }).map((animation) => animation.finished)
      );
    });
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
