import { expect, test } from '@playwright/experimental-ct-react';

import { checkAccessibility } from '../../test-helpers';
import { defaultRosaHcpWizardStrings } from '../../stringsProvider/rosaHcpWizardStrings.defaults';
import { SchemaPanelMount } from './RosaHcpSchemaPanel.spec-helpers';

const s = defaultRosaHcpWizardStrings.yamlEditor;

test.describe('RosaHcpSchemaPanel', () => {
  test('should pass accessibility checks', async ({ mount }) => {
    const component = await mount(<SchemaPanelMount />);
    await checkAccessibility({ component });
  });

  test('renders the panel title', async ({ mount }) => {
    const component = await mount(<SchemaPanelMount />);
    await expect(component.getByRole('heading', { name: s.schemaTitle })).toBeVisible();
  });

  test('renders a search input with the correct placeholder', async ({ mount }) => {
    const component = await mount(<SchemaPanelMount />);
    await expect(component.getByPlaceholder(s.schemaSearchPlaceholder)).toBeVisible();
  });

  test('renders schema fields from the ROSAControlPlane spec', async ({ mount }) => {
    const component = await mount(<SchemaPanelMount />);
    await expect(component.getByText('region', { exact: true })).toBeVisible();
    await expect(component.getByText('billingAccount', { exact: true })).toBeVisible();
  });

  test('filters fields when a search term is entered', async ({ mount }) => {
    const component = await mount(<SchemaPanelMount />);
    await component.getByPlaceholder(s.schemaSearchPlaceholder).fill('region');
    await expect(component.getByText('region', { exact: true })).toBeVisible();
    await expect(component.getByText('billingAccount', { exact: true })).not.toBeVisible();
  });

  test('shows all fields again after clearing the search', async ({ mount }) => {
    const component = await mount(<SchemaPanelMount />);
    const searchInput = component.getByPlaceholder(s.schemaSearchPlaceholder);
    await searchInput.fill('region');
    await expect(component.getByText('billingAccount', { exact: true })).not.toBeVisible();

    await component.getByRole('button', { name: 'Reset' }).click();
    await expect(component.getByText('billingAccount', { exact: true })).toBeVisible();
  });

  test('shows an expand button on object-type fields with nested properties', async ({ mount }) => {
    const component = await mount(<SchemaPanelMount />);
    await expect(
      component.getByRole('button', { name: 'Expand', exact: true }).first()
    ).toBeVisible();
  });

  test('expands a nested object field to reveal child properties', async ({ mount }) => {
    const component = await mount(<SchemaPanelMount />);
    await component.getByPlaceholder(s.schemaSearchPlaceholder).fill('autoNode');
    await expect(component.getByText('autoNode', { exact: true })).toBeVisible();
    await expect(component.getByText('roleARN', { exact: true })).not.toBeVisible();

    await component.getByRole('button', { name: 'Expand', exact: true }).click();
    await expect(component.getByText('roleARN', { exact: true })).toBeVisible();
  });

  test('collapses an expanded field when clicked again', async ({ mount }) => {
    const component = await mount(<SchemaPanelMount />);
    await component.getByPlaceholder(s.schemaSearchPlaceholder).fill('autoNode');
    await component.getByRole('button', { name: 'Expand', exact: true }).click();
    await expect(component.getByText('roleARN', { exact: true })).toBeVisible();

    await component.getByRole('button', { name: 'Collapse', exact: true }).click();
    await expect(component.getByText('roleARN', { exact: true })).not.toBeVisible();
  });

  test('calls onClose when the close button is clicked', async ({ mount, page }) => {
    let closed = false;
    await mount(
      <SchemaPanelMount
        onClose={() => {
          closed = true;
        }}
      />
    );
    await page.getByRole('button', { name: s.schemaToggleAriaLabel }).click();
    expect(closed).toBe(true);
  });
});
