import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../test-helpers';
import { OCMRoleMount } from './OCMRole.spec-helpers';

test.describe('OCMRole', () => {
  test('should render check linked section', async ({ mount }) => {
    const component = await mount(<OCMRoleMount />);
    await expect(component.getByText(/check if you have a linked/i)).toBeVisible();
  });

  test('should render list ocm-role copy instruction', async ({ mount }) => {
    const component = await mount(<OCMRoleMount />);
    await expect(component.getByText('rosa list ocm-role')).toBeVisible();
  });

  test('should render info alert about existing linked role', async ({ mount }) => {
    const component = await mount(<OCMRoleMount />);
    const alerts = component.locator('.pf-v6-c-alert.pf-m-info');
    await expect(alerts.first()).toBeVisible();
  });

  test('should render TabGroup with two tabs', async ({ mount }) => {
    const component = await mount(<OCMRoleMount />);
    // "Create new" and "Link existing" tabs
    const createTab = component.getByTestId('copy-ocm-role-tab-no');
    const linkTab = component.getByTestId('copy-ocm-role-tab-yes');
    await expect(createTab).toBeVisible();
    await expect(linkTab).toBeVisible();
  });

  test('should show create OCM role instructions in first tab', async ({ mount }) => {
    const component = await mount(<OCMRoleMount />);
    // First tab should be active by default
    await expect(component.getByTestId('copy-rosa-create-ocm-role')).toBeVisible();
    await expect(component.getByText('rosa create ocm-role')).toBeVisible();
  });

  test('should show admin OCM role instruction', async ({ mount }) => {
    const component = await mount(<OCMRoleMount />);
    await expect(component.getByTestId('copy-rosa-create-ocm-admin-role')).toBeVisible();
    await expect(component.getByText('rosa create ocm-role --admin')).toBeVisible();
  });

  test('should show link existing OCM role when second tab clicked', async ({
    mount,
    page: _page,
  }) => {
    const component = await mount(<OCMRoleMount />);

    const linkTab = component.getByTestId('copy-ocm-role-tab-yes');
    await linkTab.click();

    await expect(component.getByTestId('copy-rosa-link-ocm-role')).toBeVisible();
    await expect(component.getByText('rosa link ocm-role <arn>')).toBeVisible();
  });

  test('should render popover hint for why link account', async ({ mount }) => {
    const component = await mount(<OCMRoleMount />);
    const hintButton = component.getByRole('button', { name: /why link/i });
    await expect(hintButton).toBeVisible();
  });

  test('should render external link to AWS account association docs', async ({ mount }) => {
    const component = await mount(<OCMRoleMount />);
    const hintButton = component.getByRole('button', { name: /why link/i });
    await hintButton.click();

    const link = component.getByRole('link');
    await expect(link).toHaveAttribute('target', '_blank');
  });

  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<OCMRoleMount />);
    await checkAccessibility({ component });
  });
});
