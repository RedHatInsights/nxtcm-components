import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../../test-helpers';
import { SecurityGroupsRefreshButtonMount } from './SecurityGroupsRefreshButton.spec-helpers';

test.describe('SecurityGroupsRefreshButton', () => {
  test('should not render when onRefresh is not provided', async ({ mount }) => {
    const component = await mount(<SecurityGroupsRefreshButtonMount />);
    await expect(component.getByTestId('security-groups-refresh')).not.toBeVisible();
  });

  test('should render refresh button when onRefresh is provided', async ({ mount }) => {
    const component = await mount(<SecurityGroupsRefreshButtonMount onRefresh={() => undefined} />);
    await expect(component.getByTestId('security-groups-refresh')).toBeVisible();
  });

  test('should call onRefresh when clicked', async ({ mount }) => {
    const calls: string[] = [];
    const onRefresh = () => calls.push('refresh');

    const component = await mount(<SecurityGroupsRefreshButtonMount onRefresh={onRefresh} />);
    const button = component.getByTestId('security-groups-refresh');

    await button.click();
    expect(calls).toEqual(['refresh']);
  });

  test('should show spinner icon when loading', async ({ mount }) => {
    const component = await mount(
      <SecurityGroupsRefreshButtonMount onRefresh={() => undefined} isLoading={true} />
    );
    await expect(component.locator('.pf-v6-c-spinner')).toBeVisible();
  });

  test('should be disabled when loading', async ({ mount }) => {
    const component = await mount(
      <SecurityGroupsRefreshButtonMount onRefresh={() => undefined} isLoading={true} />
    );
    await expect(component.getByTestId('security-groups-refresh')).toBeDisabled();
  });

  test('should be disabled when isDisabled is true', async ({ mount }) => {
    const component = await mount(
      <SecurityGroupsRefreshButtonMount onRefresh={() => undefined} isDisabled={true} />
    );
    await expect(component.getByTestId('security-groups-refresh')).toBeDisabled();
  });

  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<SecurityGroupsRefreshButtonMount onRefresh={() => undefined} />);
    await checkAccessibility({ component });
  });
});
