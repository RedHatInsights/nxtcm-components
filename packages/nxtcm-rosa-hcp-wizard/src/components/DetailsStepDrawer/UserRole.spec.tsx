import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../test-helpers';
import { UserRoleMount } from './UserRole.spec-helpers';

test.describe('UserRole', () => {
  test('should render check linked section', async ({ mount }) => {
    const component = await mount(<UserRoleMount />);
    await expect(component.getByText(/check if a role exists and is linked/i)).toBeVisible();
  });

  test('should render list user-role copy instruction', async ({ mount }) => {
    const component = await mount(<UserRoleMount />);
    const copyInstruction = component.getByTestId('copy-rosa-list-user-role');
    await expect(copyInstruction).toBeVisible();
    await expect(copyInstruction.getByRole('textbox', { name: /list user-role/i })).toBeVisible();
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
    const copyInstruction = component.getByTestId('copy-rosa-create-user-role');
    await expect(copyInstruction).toBeVisible();
    await expect(copyInstruction.getByRole('textbox', { name: /create user-role/i })).toBeVisible();
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

    const copyInstruction = component.getByTestId('copy-rosa-link-user-role');
    await expect(copyInstruction).toBeVisible();
    await expect(copyInstruction.getByRole('textbox', { name: /link user-role/i })).toBeVisible();
  });

  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<UserRoleMount />);
    await checkAccessibility({ component });
  });
});
