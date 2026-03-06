import { test, expect } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../../../../test-helpers';
import { MachinePoolsSubstepStory } from './MachinePoolsSubstep.story';

test.describe('MachinePoolsSubstep', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepStory />);
    await checkAccessibility({ component });
  });

  test('should render Machine pools section', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepStory />);

    await expect(component.getByText('Machine pools', { exact: true })).toBeVisible();
    await expect(
      component.getByText(/Create machine pools and specify the private subnet/)
    ).toBeVisible();
  });

  test('should display VPC select dropdown', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepStory />);

    await expect(component.getByText(/Select a VPC to install your machine pools/)).toBeVisible();
  });

  test('should display Compute node instance type dropdown', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepStory />);

    await expect(component.getByText('Compute node instance type', { exact: true })).toBeVisible();
  });

  test('should display autoscaling checkbox', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepStory />);

    await expect(component.getByText('Autoscaling', { exact: true })).toBeVisible();
    await expect(component.getByRole('checkbox', { name: /Enable autoscaling/ })).toBeVisible();
  });

  test('should display Compute node count when autoscaling is disabled', async ({ mount }) => {
    const component = await mount(
      <MachinePoolsSubstepStory clusterOverrides={{ autoscaling: false }} />
    );

    await expect(component.getByText('Compute node count', { exact: true })).toBeVisible();
  });

  test('should display machine pool select component', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepStory />);

    await expect(component.getByText('Machine pool', { exact: true })).toBeVisible();
    await expect(component.getByText('Private subnet name', { exact: true })).toBeVisible();
  });

  test('should render with empty VPC list', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepStory vpcList={[]} />);

    await expect(component.getByText('Machine pools', { exact: true })).toBeVisible();
  });

  test('should render with empty machine types list', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepStory machineTypes={[]} />);

    await expect(component.getByText('Compute node instance type', { exact: true })).toBeVisible();
  });

  test('should have autoscaling checkbox clickable', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepStory />);

    const autoscalingCheckbox = component.getByRole('checkbox', { name: /Enable autoscaling/ });
    await expect(autoscalingCheckbox).toBeVisible();
    await expect(autoscalingCheckbox).toBeEnabled();
    await autoscalingCheckbox.click();
  });

  test('should display helper text for autoscaling', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepStory />);

    await expect(
      component.getByText(/Autoscaling automatically adds and removes nodes/)
    ).toBeVisible();
  });

  test('should render Machine pools settings section', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepStory />);

    await expect(component.getByText('Machine pools settings', { exact: true })).toBeVisible();
    await expect(
      component.getByText(/The following settings apply to all machine pools/)
    ).toBeVisible();
  });
});

test.describe('SecurityGroupsSection', () => {
  const vpcWithSecurityGroups = 'vpc-123';
  const vpcWithNoSecurityGroups = 'vpc-456';

  test('should not show security groups section when no VPC is selected', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepStory />);

    const advancedToggle = component.getByText('Advanced machine pool configuration (optional)');
    await advancedToggle.click();

    await expect(component.getByText('Additional security groups')).not.toBeVisible();
  });

  test('should show security groups section when a VPC is selected', async ({ mount }) => {
    const component = await mount(
      <MachinePoolsSubstepStory clusterOverrides={{ selected_vpc: vpcWithSecurityGroups }} />
    );

    const advancedToggle = component.getByText('Advanced machine pool configuration (optional)');
    await advancedToggle.click();

    await expect(component.getByText('Additional security groups')).toBeVisible();
  });

  test('should show no-edit alert and security groups selector when expanded with a VPC that has security groups', async ({
    mount,
  }) => {
    const component = await mount(
      <MachinePoolsSubstepStory clusterOverrides={{ selected_vpc: vpcWithSecurityGroups }} />
    );

    const advancedToggle = component.getByText('Advanced machine pool configuration (optional)');
    await advancedToggle.click();

    const securityGroupsToggle = component.getByText('Additional security groups');
    await securityGroupsToggle.click();

    await expect(
      component.getByText(/You cannot add or edit security groups associated with machine pools/)
    ).toBeVisible();

    await expect(component.getByText('Select security groups')).toBeVisible();
  });

  test('should show empty alert when VPC has no security groups', async ({ mount }) => {
    const component = await mount(
      <MachinePoolsSubstepStory clusterOverrides={{ selected_vpc: vpcWithNoSecurityGroups }} />
    );

    const advancedToggle = component.getByText('Advanced machine pool configuration (optional)');
    await advancedToggle.click();

    const securityGroupsToggle = component.getByText('Additional security groups');
    await securityGroupsToggle.click();

    await expect(
      component.getByText('There are no security groups for this Virtual Private Cloud')
    ).toBeVisible();

    await expect(component.getByText('Refresh Security Groups')).toBeVisible();
  });

  test('should display security group options in the dropdown', async ({ mount, page }) => {
    const component = await mount(
      <MachinePoolsSubstepStory clusterOverrides={{ selected_vpc: vpcWithSecurityGroups }} />
    );

    const advancedToggle = component.getByText('Advanced machine pool configuration (optional)');
    await advancedToggle.click();

    const securityGroupsToggle = component.getByText('Additional security groups');
    await securityGroupsToggle.click();

    await component.getByText('Select security groups').click();

    const expectedSecurityGroupNames = [
      'default',
      'k8s-traffic-rules',
      'web-server-sg',
      'database-access-sg',
    ];
    for (const name of expectedSecurityGroupNames) {
      await expect(page.getByText(name, { exact: true })).toBeVisible();
    }
  });

  test('should select a security group and show it as a label', async ({ mount, page }) => {
    const component = await mount(
      <MachinePoolsSubstepStory clusterOverrides={{ selected_vpc: vpcWithSecurityGroups }} />
    );

    const advancedToggle = component.getByText('Advanced machine pool configuration (optional)');
    await advancedToggle.click();

    const securityGroupsToggle = component.getByText('Additional security groups');
    await securityGroupsToggle.click();

    await component.getByText('Select security groups').click();
    await page.getByText('default', { exact: true }).click();

    await expect(component.locator('.pf-v6-c-label').getByText('default')).toBeVisible();
  });

  test('should show refresh button for security groups', async ({ mount }) => {
    const component = await mount(
      <MachinePoolsSubstepStory clusterOverrides={{ selected_vpc: vpcWithSecurityGroups }} />
    );

    const advancedToggle = component.getByText('Advanced machine pool configuration (optional)');
    await advancedToggle.click();

    const securityGroupsToggle = component.getByText('Additional security groups');
    await securityGroupsToggle.click();

    const refreshButton = component.locator('#refreshSecurityGroupsButton');
    await expect(refreshButton).toBeVisible();
  });

  test('should clear selected security groups when VPC is changed', async ({ mount, page }) => {
    const component = await mount(
      <MachinePoolsSubstepStory clusterOverrides={{ selected_vpc: vpcWithSecurityGroups }} />
    );

    const advancedToggle = component.getByText('Advanced machine pool configuration (optional)');
    await advancedToggle.click();

    const securityGroupsToggle = component.getByText('Additional security groups');
    await securityGroupsToggle.click();

    await component.getByText('Select security groups').click();
    await page.getByText('default', { exact: true }).click();

    await expect(component.locator('.pf-v6-c-label').getByText('default')).toBeVisible();

    await page.keyboard.press('Escape');

    const vpcInput = component.locator('#cluster-selected_vpc [role="combobox"]');

    await vpcInput.click();
    await page.getByText('my-staging-vpc', { exact: true }).click();

    await vpcInput.click();
    await page.getByText('my-production-vpc', { exact: true }).click();

    await expect(component.locator('.pf-v6-c-label').getByText('default')).not.toBeVisible();
  });
});
