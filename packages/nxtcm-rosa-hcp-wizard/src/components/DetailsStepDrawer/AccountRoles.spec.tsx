import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../test-helpers';
import { AccountRolesMount } from './AccountRoles.spec-helpers';

test.describe('AccountRoles', () => {
  test('should render account roles copy instruction', async ({ mount }) => {
    const component = await mount(<AccountRolesMount />);
    await expect(component.getByTestId('copy-rosa-create-account-role')).toBeVisible();
    await expect(
      component.getByText('rosa create account-roles --hosted-cp --mode auto')
    ).toBeVisible();
  });

  test('should render info alert about manual instructions', async ({ mount }) => {
    const component = await mount(<AccountRolesMount />);
    const alert = component.locator('.pf-v6-c-alert.pf-m-info');
    await expect(alert).toBeVisible();
  });

  test('should render external link to AWS CLI documentation', async ({ mount }) => {
    const component = await mount(<AccountRolesMount />);
    const link = component.getByRole('link');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('target', '_blank');
  });

  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<AccountRolesMount />);
    await checkAccessibility({ component });
  });
});
