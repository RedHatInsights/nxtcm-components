import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../test-helpers';
import { UserRoleMount } from './UserRole.spec-helpers';

test.describe('UserRole', () => {
  test('should render check linked section', async ({ mount }) => {
    const component = await mount(<UserRoleMount />);
    await expect(component.getByText(/check if you have a linked/i)).toBeVisible();
  });

  test('should render list user-role copy instruction', async ({ mount }) => {
    const component = await mount(<UserRoleMount />);
    await expect(component.getByTestId('copy-rosa-list-user-role')).toBeVisible();
    await expect(component.getByText('rosa list user-role')).toBeVisible();
  });

  test('should render info alert about existing linked role', async ({ mount }) => {
    const component = await mount(<UserRoleMount />);
    const alert = component.locator('.pf-v6-c-alert.pf-m-info');
    await expect(alert).toBeVisible();
  });

  test('should render TabGroup with two tabs', async ({ mount }) => {
    const component = await mount(<UserRoleMount />);
    const createTab = component.getByTestId('copy-user-role-tab-no');
    const linkTab = component.getByTestId('copy-user-role-tab-yes');
    await expect(createTab).toBeVisible();
    await expect(linkTab).toBeVisible();
  });

  test('should show create user role instruction in first tab', async ({ mount }) => {
    const component = await mount(<UserRoleMount />);
    await expect(component.getByTestId('copy-rosa-create-user-role')).toBeVisible();
    await expect(component.getByText('rosa create user-role')).toBeVisible();
  });

  test('should show popover hint for user role', async ({ mount }) => {
    const component = await mount(<UserRoleMount />);
    const hintButton = component.getByRole('button', { name: /more information/i });
    await expect(hintButton).toBeVisible();
  });

  test('should show link existing user role when second tab clicked', async ({ mount }) => {
    const component = await mount(<UserRoleMount />);

    const linkTab = component.getByTestId('copy-user-role-tab-yes');
    await linkTab.click();

    await expect(component.getByTestId('copy-rosa-link-user-role')).toBeVisible();
    await expect(component.getByText('rosa link user-role <arn>')).toBeVisible();
  });

  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<UserRoleMount />);
    await checkAccessibility({ component });
  });
});
