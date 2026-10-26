import { expect, test } from '@/playwright/ct-fixture';

import { checkAccessibility } from '../../test-helpers';
import type { AccountRolesMount } from './AccountRoles.story';

test.describe('AccountRoles', () => {
  test('should render account roles copy instruction', async ({ mount }) => {
    const component = await mount<typeof AccountRolesMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/AccountRoles/AccountRolesMount'
    );
    const copyInstruction = component.getByTestId('copy-rosa-create-account-role');
    await expect(copyInstruction).toBeVisible();
    await expect(
      copyInstruction.getByRole('textbox', {
        name: /rosa create account-roles --hosted-cp --mode auto/i,
      })
    ).toBeVisible();
  });

  test('should render info alert about manual instructions', async ({ mount }) => {
    const component = await mount<typeof AccountRolesMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/AccountRoles/AccountRolesMount'
    );
    const alert = component.getByRole('heading', {
      name: /manually create the required roles and policies/i,
    });
    await expect(alert).toBeVisible();
  });

  test('should render external link to AWS CLI documentation', async ({ mount }) => {
    const component = await mount<typeof AccountRolesMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/AccountRoles/AccountRolesMount'
    );
    const link = component.getByRole('link');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('target', '_blank');
  });

  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount<typeof AccountRolesMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/AccountRoles/AccountRolesMount'
    );
    await checkAccessibility({ component });
  });
});
