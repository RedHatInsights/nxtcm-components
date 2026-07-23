import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../../test-helpers';
import { SecurityGroupsEmptyAlertMount } from './SecurityGroupsEmptyAlert.spec-helpers';

test.describe('SecurityGroupsEmptyAlert', () => {
  test('should render info alert', async ({ mount }) => {
    const component = await mount(<SecurityGroupsEmptyAlertMount />);
    await expect(component.locator('.pf-v6-c-alert.pf-m-info')).toBeVisible();
  });

  test('should render external link to AWS console', async ({ mount }) => {
    const component = await mount(<SecurityGroupsEmptyAlertMount />);
    const link = component.getByRole('link', { name: /aws console/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('target', '_blank');
  });

  test('should not render refresh button when refreshVPCCallback is not provided', async ({
    mount,
  }) => {
    const component = await mount(<SecurityGroupsEmptyAlertMount />);
    await expect(component.getByTestId('security-groups-refresh')).not.toBeVisible();
  });

  test('should render refresh button when refreshVPCCallback is provided', async ({ mount }) => {
    const refreshVPCCallback = () => undefined;
    const component = await mount(
      <SecurityGroupsEmptyAlertMount refreshVPCCallback={refreshVPCCallback} />
    );
    await expect(component.getByTestId('security-groups-refresh')).toBeVisible();
  });

  test('should call refreshVPCCallback when refresh button clicked', async ({ mount }) => {
    const calls: string[] = [];
    const refreshVPCCallback = () => calls.push('refresh');

    const component = await mount(
      <SecurityGroupsEmptyAlertMount refreshVPCCallback={refreshVPCCallback} />
    );
    await component.getByTestId('security-groups-refresh').click();
    expect(calls).toEqual(['refresh']);
  });

  test('should show loading state on refresh button', async ({ mount }) => {
    const component = await mount(
      <SecurityGroupsEmptyAlertMount refreshVPCCallback={() => undefined} isVPCLoading={true} />
    );
    await expect(component.getByTestId('security-groups-refresh')).toBeDisabled();
    await expect(component.locator('.pf-v6-c-spinner')).toBeVisible();
  });

  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<SecurityGroupsEmptyAlertMount />);
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests with refresh button', async ({ mount }) => {
    const component = await mount(
      <SecurityGroupsEmptyAlertMount refreshVPCCallback={() => undefined} />
    );
    await checkAccessibility({ component });
  });
});
