import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../../test-helpers';
import {
  SecurityGroupsViewListMount,
  mockSecurityGroups,
} from './SecurityGroupsViewList.spec-helpers';

test.describe('SecurityGroupsViewList', () => {
  test('should not render when security groups list is empty and no emptyMessage', async ({
    mount,
  }) => {
    const component = await mount(<SecurityGroupsViewListMount securityGroups={[]} />);
    await expect(component.locator('.pf-v6-c-label-group')).not.toBeVisible();
  });

  test('should render empty message when list is empty and emptyMessage provided', async ({
    mount,
  }) => {
    const emptyMessage = 'No security groups selected';
    const component = await mount(
      <SecurityGroupsViewListMount securityGroups={[]} emptyMessage={emptyMessage} />
    );
    await expect(component.getByText(emptyMessage)).toBeVisible();
  });

  test('should render security group labels', async ({ mount }) => {
    const component = await mount(
      <SecurityGroupsViewListMount securityGroups={mockSecurityGroups} />
    );
    await expect(component.getByText('default')).toBeVisible();
    await expect(component.getByText('k8s-traffic-rules')).toBeVisible();
    await expect(component.getByText('web-server-sg')).toBeVisible();
  });

  test('should render security group ID when name is empty', async ({ mount }) => {
    const groupsWithoutName = [{ id: 'sg-999999', name: '' }];
    const component = await mount(
      <SecurityGroupsViewListMount securityGroups={groupsWithoutName} />
    );
    await expect(component.getByText('sg-999999')).toBeVisible();
  });

  test('should render close buttons when onCloseItem is provided', async ({ mount }) => {
    const onCloseItem = () => undefined;
    const component = await mount(
      <SecurityGroupsViewListMount securityGroups={mockSecurityGroups} onCloseItem={onCloseItem} />
    );
    // PatternFly labels with onClose render a close button
    const closeButtons = component.locator('button[aria-label*="close"]');
    await expect(closeButtons).toHaveCount(mockSecurityGroups.length);
  });

  test('should call onCloseItem when close button clicked', async ({ mount }) => {
    const closedGroups: string[] = [];
    const onCloseItem = (id: string) => closedGroups.push(id);

    const component = await mount(
      <SecurityGroupsViewListMount securityGroups={mockSecurityGroups} onCloseItem={onCloseItem} />
    );

    // Click the first close button
    const firstCloseButton = component.locator('button[aria-label*="close"]').first();
    await firstCloseButton.click();

    expect(closedGroups).toEqual(['sg-123456']);
  });

  test('should not render close buttons when onCloseItem is not provided', async ({ mount }) => {
    const component = await mount(
      <SecurityGroupsViewListMount securityGroups={mockSecurityGroups} />
    );
    const closeButtons = component.locator('button[aria-label*="close"]');
    await expect(closeButtons).toHaveCount(0);
  });

  test('should pass accessibility tests with security groups', async ({ mount }) => {
    const component = await mount(
      <SecurityGroupsViewListMount securityGroups={mockSecurityGroups} />
    );
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests with empty message', async ({ mount }) => {
    const component = await mount(
      <SecurityGroupsViewListMount securityGroups={[]} emptyMessage="No groups" />
    );
    await checkAccessibility({ component });
  });
});
