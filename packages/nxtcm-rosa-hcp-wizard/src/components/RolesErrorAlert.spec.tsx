import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../test-helpers';
import { RolesAlertMount } from './RolesErrorAlert.spec-helpers';

test.describe('RolesAlert', () => {
  test('should render danger alert', async ({ mount }) => {
    const component = await mount(<RolesAlertMount showMissingArnsError={true} />);
    await expect(component.locator('.pf-v6-c-alert.pf-m-danger')).toBeVisible();
  });

  test('should show missing ARNs error with copy instruction', async ({ mount }) => {
    const component = await mount(<RolesAlertMount showMissingArnsError={true} />);
    await expect(component.getByTestId('copy-rosa-create-account-roles')).toBeVisible();
    await expect(component.getByText('rosa create account-role --hosted-cp')).toBeVisible();
  });

  test('should not show missing ARNs error when showMissingArnsError is false', async ({
    mount,
  }) => {
    const component = await mount(<RolesAlertMount showMissingArnsError={false} />);
    await expect(component.getByTestId('copy-rosa-create-account-roles')).not.toBeVisible();
  });

  test('should show user role error with copy instruction', async ({ mount }) => {
    const component = await mount(<RolesAlertMount userRoleError="User role not found" />);
    await expect(component.getByTestId('copy-rosa-create-user-role')).toBeVisible();
    await expect(component.getByText('rosa create user-role')).toBeVisible();
  });

  test('should not show user role error when ocmRoleError is present', async ({ mount }) => {
    const component = await mount(
      <RolesAlertMount userRoleError="User error" ocmRoleError="OCM error" />
    );
    // User role copy instruction should not show when OCM error exists
    await expect(component.getByTestId('copy-rosa-create-user-role')).not.toBeVisible();
  });

  test('should show OCM role error message', async ({ mount }) => {
    const component = await mount(<RolesAlertMount ocmRoleError="OCM role is invalid" />);
    await expect(component.getByText('OCM role is invalid')).toBeVisible();
  });

  test('should show multiple error sections', async ({ mount }) => {
    const component = await mount(
      <RolesAlertMount
        showMissingArnsError={true}
        userRoleError="User error"
        ocmRoleError="OCM error"
      />
    );
    // Should show missing ARNs and OCM error (but not user role since OCM error exists)
    await expect(component.getByTestId('copy-rosa-create-account-roles')).toBeVisible();
    await expect(component.getByText('OCM error')).toBeVisible();
  });

  test('should pass accessibility tests with missing ARNs error', async ({ mount }) => {
    const component = await mount(<RolesAlertMount showMissingArnsError={true} />);
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests with user role error', async ({ mount }) => {
    const component = await mount(<RolesAlertMount userRoleError="User role error" />);
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests with OCM role error', async ({ mount }) => {
    const component = await mount(<RolesAlertMount ocmRoleError="OCM role error" />);
    await checkAccessibility({ component });
  });
});
