import { test, expect } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../../../../test-helpers';
import { MachinePoolsSubstepStory } from './MachinePoolsSubstep.story';
import { ShowValidationContext } from '@patternfly-labs/react-form-wizard/contexts/ShowValidationProvider';
import type { Resource, MachineTypesDropdownType, VPC } from '../../../../types';

const mockResource = <TData,>(data: TData): Resource<TData> => ({
  data,
  error: null,
  isFetching: false,
  fetch: async () => {},
});

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
    const component = await mount(<MachinePoolsSubstepStory vpcList={mockResource<VPC[]>([])} />);

    await expect(component.getByText('Machine pools', { exact: true })).toBeVisible();
  });

  test('should display refresh button on VPC list', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepStory vpcList={mockResource<VPC[]>([])} />);

    await expect(
      component.locator('#machine-pools-section').getByLabel('Refresh', { exact: true })
    ).toBeVisible();
  });

  test('should call fetch callback when clicking refresh button on VPC list', async ({ mount }) => {
    let fetchCallCount = 0;

    const component = await mount(
      <MachinePoolsSubstepStory
        vpcList={{
          data: [],
          error: null,
          isFetching: false,
          // eslint-disable-next-line @typescript-eslint/require-await
          fetch: async () => {
            fetchCallCount++;
          },
        }}
      />
    );

    await component
      .locator('#machine-pools-section')
      .getByLabel('Refresh', { exact: true })
      .click();

    expect(fetchCallCount).toBe(1);
  });

  test('should render with empty machine types list', async ({ mount }) => {
    const component = await mount(
      <MachinePoolsSubstepStory machineTypes={mockResource<MachineTypesDropdownType[]>([])} />
    );

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

  test('should show disabled state for Compute node instance type when machine types are loading', async ({
    mount,
  }) => {
    const component = await mount(
      <MachinePoolsSubstepStory machineTypes={{ data: [], isFetching: true, error: null }} />
    );

    const machineTypeSelect = component.locator('#cluster-machine_type');
    await expect(machineTypeSelect).toBeVisible();
    await expect(machineTypeSelect.locator('.pf-m-disabled')).toBeVisible();
  });

  test('should not show disabled state for Compute node instance type when not loading', async ({
    mount,
  }) => {
    const component = await mount(
      <MachinePoolsSubstepStory machineTypes={{ data: [], isFetching: false, error: null }} />
    );

    const machineTypeSelect = component.locator('#cluster-machine_type');
    await expect(machineTypeSelect).toBeVisible();
    await expect(machineTypeSelect.locator('.pf-m-disabled')).not.toBeVisible();
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
    const defaultOption = page.getByText('default', { exact: true });
    await defaultOption.waitFor({ state: 'visible', timeout: 5000 });
    await defaultOption.click();

    await expect(component.locator('.pf-v6-c-label').getByText('default')).toBeVisible();

    await page.keyboard.press('Escape');

    const vpcSelect = component.locator('#cluster-selected_vpc');
    const vpcInput = vpcSelect.locator('[role="combobox"]');
    await vpcInput.click();

    const clearVpcButton = vpcSelect.getByRole('button', { name: 'Clear input value' });
    await clearVpcButton.click();

    await vpcInput.click();
    const stagingOption = page.getByText('my-staging-vpc', { exact: true });
    await stagingOption.waitFor({ state: 'visible', timeout: 5000 });
    await stagingOption.click();

    await vpcInput.click();
    await vpcSelect.getByRole('button', { name: 'Clear input value' }).click();
    await vpcInput.click();
    const productionOption = page.getByText('my-production-vpc', { exact: true });
    await productionOption.waitFor({ state: 'visible', timeout: 5000 });
    await productionOption.click();

    await expect(component.locator('.pf-v6-c-label').getByText('default')).not.toBeVisible();
  });
});

const ADVANCED_TOGGLE_TEXT = 'Advanced machine pool configuration (optional)';

const mountWithValidation = (
  mount: Parameters<Parameters<typeof test>[2]>[0]['mount'],
  clusterOverrides: Record<string, unknown> = {}
) =>
  mount(
    <ShowValidationContext.Provider value={true}>
      <MachinePoolsSubstepStory clusterOverrides={clusterOverrides} />
    </ShowValidationContext.Provider>
  );

test.describe('Root disk size validation', () => {
  test('should render root disk size input inside advanced section', async ({ mount }) => {
    const component = await mountWithValidation(mount);

    const advancedToggle = component.getByText(ADVANCED_TOGGLE_TEXT);
    await advancedToggle.click();

    await expect(component.getByText('Root disk size', { exact: true })).toBeVisible();
  });

  test('should not show validation error for a valid value', async ({ mount }) => {
    const component = await mountWithValidation(mount, { compute_root_volume: 100 });

    const advancedToggle = component.getByText(ADVANCED_TOGGLE_TEXT);
    await advancedToggle.click();

    await expect(component.getByText(/Root disk size must be/)).not.toBeVisible();
    await expect(component.getByText(/must not exceed/)).not.toBeVisible();
  });

  test('should not show validation error for minimum boundary value (75)', async ({ mount }) => {
    const component = await mountWithValidation(mount, { compute_root_volume: 75 });

    const advancedToggle = component.getByText(ADVANCED_TOGGLE_TEXT);
    await advancedToggle.click();

    await expect(component.getByText(/Root disk size must be/)).not.toBeVisible();
    await expect(component.getByText(/must not exceed/)).not.toBeVisible();
  });

  test('should not show validation error for maximum boundary value (16384) on OpenShift >= 4.14', async ({
    mount,
  }) => {
    const component = await mountWithValidation(mount, {
      compute_root_volume: 16384,
      cluster_version: '4.16.0',
    });

    const advancedToggle = component.getByText(ADVANCED_TOGGLE_TEXT);
    await advancedToggle.click();

    await expect(component.getByText(/Root disk size must be/)).not.toBeVisible();
    await expect(component.getByText(/must not exceed/)).not.toBeVisible();
  });

  test('should show error when root disk size is below minimum', async ({ mount }) => {
    const component = await mountWithValidation(mount, { compute_root_volume: 50 });

    const advancedToggle = component.getByText(ADVANCED_TOGGLE_TEXT);
    await advancedToggle.click();

    await expect(component.getByText('Root disk size must be at least 75 GiB.')).toBeVisible();
  });

  test('should show error when root disk size is not an integer', async ({ mount }) => {
    const component = await mountWithValidation(mount, { compute_root_volume: 75.5 });

    const advancedToggle = component.getByText(ADVANCED_TOGGLE_TEXT);
    await advancedToggle.click();

    await expect(component.getByText('Root disk size must be an integer.')).toBeVisible();
  });

  test('should show error when root disk size exceeds maximum for OpenShift >= 4.14', async ({
    mount,
  }) => {
    const component = await mountWithValidation(mount, {
      compute_root_volume: 20000,
      cluster_version: '4.16.0',
    });

    const advancedToggle = component.getByText(ADVANCED_TOGGLE_TEXT);
    await advancedToggle.click();

    await expect(component.getByText('Root disk size must not exceed 16384 GiB.')).toBeVisible();
  });

  test('should show error when root disk size exceeds maximum for OpenShift < 4.14', async ({
    mount,
  }) => {
    const component = await mountWithValidation(mount, {
      compute_root_volume: 2000,
      cluster_version: '4.12.0',
    });

    const advancedToggle = component.getByText(ADVANCED_TOGGLE_TEXT);
    await advancedToggle.click();

    await expect(component.getByText('Root disk size must not exceed 1024 GiB')).toBeVisible();
  });

  test('should not show validation error for maximum boundary value (1024) on OpenShift < 4.14', async ({
    mount,
  }) => {
    const component = await mountWithValidation(mount, {
      compute_root_volume: 1024,
      cluster_version: '4.12.0',
    });

    const advancedToggle = component.getByText(ADVANCED_TOGGLE_TEXT);
    await advancedToggle.click();

    await expect(component.getByText(/Root disk size must be/)).not.toBeVisible();
    await expect(component.getByText(/must not exceed/)).not.toBeVisible();
  });
});
