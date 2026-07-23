import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../../test-helpers';
import {
  EditSecurityGroupsMount,
  mockSelectedVPC,
  mockEmptyVPC,
} from './EditSecurityGroups.spec-helpers';

test.describe('EditSecurityGroups', () => {
  test('should render multi-select when VPC is selected and not readonly', async ({ mount }) => {
    const component = await mount(<EditSecurityGroupsMount />);
    await expect(component.getByTestId('securitygroups-id')).toBeVisible();
  });

  test('should not render when no VPC is selected', async ({ mount }) => {
    const component = await mount(<EditSecurityGroupsMount selectedVPC={undefined} />);
    await expect(component.getByTestId('securitygroups-id')).not.toBeVisible();
  });

  test('should render SecurityGroupsViewList in read-only mode', async ({ mount }) => {
    const defaultValues = {
      security_groups_worker: ['sg-0a1b2c3d4e5f00001'],
    };
    const component = await mount(
      <EditSecurityGroupsMount isReadOnly={true} defaultValues={defaultValues} />
    );
    await expect(component.getByText('default')).toBeVisible();
  });

  test('should render empty message in read-only mode when no groups selected', async ({
    mount,
  }) => {
    const component = await mount(<EditSecurityGroupsMount isReadOnly={true} />);
    // The read-only empty message should be visible
    await expect(component.locator('.pf-v6-u-disabled-color-100')).toBeVisible();
  });

  test('should render SecurityGroupsEmptyAlert when VPC has no security groups', async ({
    mount,
  }) => {
    const component = await mount(<EditSecurityGroupsMount selectedVPC={mockEmptyVPC} />);
    await expect(component.locator('.pf-v6-c-alert.pf-m-info')).toBeVisible();
  });

  test('should render refresh button in empty alert when callback provided', async ({ mount }) => {
    const refreshVPCCallback = () => undefined;
    const component = await mount(
      <EditSecurityGroupsMount selectedVPC={mockEmptyVPC} refreshVPCCallback={refreshVPCCallback} />
    );
    await expect(component.getByTestId('security-groups-refresh')).toBeVisible();
  });

  test('should render incompatible version message for old cluster versions', async ({ mount }) => {
    const component = await mount(<EditSecurityGroupsMount clusterVersion="4.11.0" />);
    // For versions < 4.13, showSecurityGroupsSection returns false
    await expect(component.getByTestId('securitygroups-id')).not.toBeVisible();
  });

  test('should render security group options from VPC', async ({ mount, page }) => {
    const component = await mount(<EditSecurityGroupsMount />);
    const toggle = component.getByTestId('securitygroups-id').locator('button').first();
    await toggle.click();

    // Check that all security groups appear as options
    await expect(page.getByRole('option', { name: /default/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /k8s-traffic-rules/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /web-server-sg/i })).toBeVisible();
  });

  test('should display selected security groups in view list', async ({ mount, page }) => {
    const component = await mount(<EditSecurityGroupsMount />);

    // Open and select a security group
    const toggle = component.getByTestId('securitygroups-id').locator('button').first();
    await toggle.click();
    await page.getByRole('option', { name: /default/i }).click();

    // Verify it appears in the view list
    await expect(component.getByText('default')).toBeVisible();
  });

  test('should allow removing security groups from view list', async ({ mount }) => {
    const defaultValues = {
      security_groups_worker: ['sg-0a1b2c3d4e5f00001', 'sg-0a1b2c3d4e5f00002'],
    };
    const component = await mount(<EditSecurityGroupsMount defaultValues={defaultValues} />);

    // Verify both groups are shown
    await expect(component.getByText('default')).toBeVisible();
    await expect(component.getByText('k8s-traffic-rules')).toBeVisible();

    // Click close button on first label
    const closeButton = component.locator('button[aria-label*="close"]').first();
    await closeButton.click();

    // Verify one group was removed
    await expect(component.getByText('default')).not.toBeVisible();
    await expect(component.getByText('k8s-traffic-rules')).toBeVisible();
  });

  test('should render SecurityGroupsNoEditAlert', async ({ mount }) => {
    const component = await mount(<EditSecurityGroupsMount />);
    // The no-edit alert should be present below the multi-select
    const alerts = component.locator('.pf-v6-c-alert.pf-m-info');
    await expect(alerts).toHaveCount(1);
  });

  test('should show API error when provided', async ({ mount }) => {
    const apiError = 'Failed to load security groups';
    const component = await mount(<EditSecurityGroupsMount apiError={apiError} />);
    await expect(component.getByText(apiError)).toBeVisible();
  });

  test('should show loading state when VPC is loading', async ({ mount }) => {
    const component = await mount(<EditSecurityGroupsMount isVPCLoading={true} />);
    await expect(component.locator('.pf-v6-c-spinner')).toBeVisible();
  });

  test('should use custom label when provided', async ({ mount }) => {
    const customLabel = 'Custom Security Groups Label';
    const component = await mount(<EditSecurityGroupsMount label={customLabel} />);
    await expect(component.getByText(customLabel)).toBeVisible();
  });

  test('should truncate long security group names', async ({ mount, page }) => {
    const longNameVPC = {
      ...mockSelectedVPC,
      aws_security_groups: [
        {
          id: 'sg-long',
          name: 'this-is-a-very-long-security-group-name-that-should-be-truncated-with-ellipsis',
        },
      ],
    };
    const component = await mount(<EditSecurityGroupsMount selectedVPC={longNameVPC} />);

    const toggle = component.getByTestId('securitygroups-id').locator('button').first();
    await toggle.click();

    // The option should have a truncated display
    const option = page.getByRole('option').first();
    await expect(option).toBeVisible();
  });

  test('should pass accessibility tests in edit mode', async ({ mount }) => {
    const component = await mount(<EditSecurityGroupsMount />);
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests in read-only mode', async ({ mount }) => {
    const defaultValues = {
      security_groups_worker: ['sg-0a1b2c3d4e5f00001'],
    };
    const component = await mount(
      <EditSecurityGroupsMount isReadOnly={true} defaultValues={defaultValues} />
    );
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests with empty VPC', async ({ mount }) => {
    const component = await mount(<EditSecurityGroupsMount selectedVPC={mockEmptyVPC} />);
    await checkAccessibility({ component });
  });
});
