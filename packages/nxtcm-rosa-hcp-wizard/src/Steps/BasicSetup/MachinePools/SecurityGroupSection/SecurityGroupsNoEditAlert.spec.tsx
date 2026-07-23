import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../../test-helpers';
import { SecurityGroupsNoEditAlertMount } from './SecurityGroupsNoEditAlert.spec-helpers';

test.describe('SecurityGroupsNoEditAlert', () => {
  test('should render info alert', async ({ mount }) => {
    const component = await mount(<SecurityGroupsNoEditAlertMount />);
    await expect(component.locator('.pf-v6-c-alert.pf-m-info')).toBeVisible();
  });

  test('should render action link to ROSA security groups documentation', async ({ mount }) => {
    const component = await mount(<SecurityGroupsNoEditAlertMount />);
    const link = component.getByRole('link').first();
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('target', '_blank');
  });

  test('should render action link to AWS console', async ({ mount }) => {
    const component = await mount(<SecurityGroupsNoEditAlertMount />);
    const links = component.getByRole('link');
    await expect(links).toHaveCount(2);
    await expect(links.last()).toHaveAttribute('target', '_blank');
  });

  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<SecurityGroupsNoEditAlertMount />);
    await checkAccessibility({ component });
  });
});
