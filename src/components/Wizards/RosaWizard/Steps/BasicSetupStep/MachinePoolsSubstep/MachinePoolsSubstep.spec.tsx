import { test, expect } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../../../../test-helpers';
import { MachinePoolsSubstepMount } from './MachinePoolsSubstep.spec-helpers';
import { machinePoolsSubstepCtStrings, mockVpcList } from './MachinePoolsSubstep.fixtures';
import type { Resource, MachineTypesDropdownType, VPC } from '../../../../types';

/** Static `Resource` builder with noop `fetch` for CT overrides (empty lists, etc.). */
const mockResource = <TData,>(data: TData): Resource<TData> => ({
  data,
  error: null,
  isFetching: false,
  fetch: async () => {},
});

/** Core `MachinePoolsSubstep` UI: sections, controls, loading states, and refresh wiring. */
test.describe('MachinePoolsSubstep', () => {
  /** Default mount passes accessibility checks. */
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepMount />);
    await checkAccessibility({ component });
  });

  /** Machine pools title and intro helper text render. */
  test('should render Machine pools section', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepMount />);

    await expect(component.getByText('Machine pools', { exact: true })).toBeVisible();
    await expect(
      component.getByText(/Create machine pools and specify the private subnet/)
    ).toBeVisible();
  });

  /** VPC selection prompt is visible for installing pools into a VPC. */
  test('should display VPC select dropdown', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepMount />);

    await expect(component.getByText(/Select a VPC to install your machine pools/)).toBeVisible();
  });

  /** Compute instance type field label is shown for default machine types. */
  test('should display Compute node instance type dropdown', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepMount />);

    await expect(component.getByText('Compute node instance type', { exact: true })).toBeVisible();
  });

  /** Autoscaling label and enable checkbox are visible. */
  test('should display autoscaling checkbox', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepMount />);

    await expect(component.getByText('Autoscaling', { exact: true })).toBeVisible();
    await expect(component.getByRole('checkbox', { name: /Enable autoscaling/ })).toBeVisible();
  });

  /** With autoscaling off in defaults, fixed compute node count field appears. */
  test('should display Compute node count when autoscaling is disabled', async ({ mount }) => {
    const component = await mount(
      <MachinePoolsSubstepMount clusterOverrides={{ autoscaling: false }} />
    );

    await expect(component.getByText('Compute node count', { exact: true })).toBeVisible();
  });

  /** Machine pool selector and private subnet column labels render. */
  test('should display machine pool select component', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepMount />);

    await expect(component.getByText('Machine pool', { exact: true })).toBeVisible();
    await expect(component.getByText('Private subnet name', { exact: true })).toBeVisible();
  });

  /** Empty VPC resource still shows the Machine pools section shell. */
  test('should render with empty VPC list', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepMount vpcList={mockResource<VPC[]>([])} />);

    await expect(component.getByText('Machine pools', { exact: true })).toBeVisible();
  });

  /** VPC list toolbar exposes a Refresh control even when no VPCs are loaded. */
  test('should display refresh button on VPC list', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepMount vpcList={mockResource<VPC[]>([])} />);

    await expect(
      component.locator('#machine-pools-section').getByLabel('Refresh', { exact: true })
    ).toBeVisible();
  });

  /** Clicking VPC Refresh increments a test spy wired through `vpcList.fetch`. */
  test('should call fetch callback when clicking refresh button on VPC list', async ({ mount }) => {
    let fetchCallCount = 0;

    const component = await mount(
      <MachinePoolsSubstepMount
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

  /** Empty machine types still render the compute type field chrome. */
  test('should render with empty machine types list', async ({ mount }) => {
    const component = await mount(
      <MachinePoolsSubstepMount machineTypes={mockResource<MachineTypesDropdownType[]>([])} />
    );

    await expect(component.getByText('Compute node instance type', { exact: true })).toBeVisible();
  });

  /** Autoscaling checkbox is enabled and toggles on click. */
  test('should have autoscaling checkbox clickable', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepMount />);

    const autoscalingCheckbox = component.getByRole('checkbox', { name: /Enable autoscaling/ });
    await expect(autoscalingCheckbox).toBeVisible();
    await expect(autoscalingCheckbox).toBeEnabled();
    await autoscalingCheckbox.click();
  });

  /** Autoscaling helper blurb about scaling nodes is visible. */
  test('should display helper text for autoscaling', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepMount />);

    await expect(
      component.getByText(/Autoscaling automatically adds and removes nodes/)
    ).toBeVisible();
  });

  /** Global machine pool settings section title and description render. */
  test('should render Machine pools settings section', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepMount />);

    await expect(component.getByText('Machine pools settings', { exact: true })).toBeVisible();
    await expect(
      component.getByText(/The following settings apply to all machine pools/)
    ).toBeVisible();
  });

  /** Machine type select shows disabled styling while machine types are fetching. */
  test('should show disabled state for Compute node instance type when machine types are loading', async ({
    mount,
  }) => {
    const component = await mount(
      <MachinePoolsSubstepMount machineTypes={{ data: [], isFetching: true, error: null }} />
    );

    const machineTypeSelect = component.locator('#cluster-machine_type');
    await expect(machineTypeSelect).toBeVisible();
    await expect(machineTypeSelect.locator('.pf-m-disabled')).toBeVisible();
  });

  /** Idle empty machine types list does not apply disabled styling to the type select. */
  test('should not show disabled state for Compute node instance type when not loading', async ({
    mount,
  }) => {
    const component = await mount(
      <MachinePoolsSubstepMount machineTypes={{ data: [], isFetching: false, error: null }} />
    );

    const machineTypeSelect = component.locator('#cluster-machine_type');
    await expect(machineTypeSelect).toBeVisible();
    await expect(machineTypeSelect.locator('.pf-m-disabled')).not.toBeVisible();
  });
});

/** Additional security groups UX under advanced machine pool config for different VPC/version states. */
test.describe('SecurityGroupsSection', () => {
  /** `mockVpcList` production VPC id (has `aws_security_groups`). */
  const vpcWithSecurityGroups = 'vpc-123';
  /** `mockVpcList` staging VPC id (empty security groups). */
  const vpcWithNoSecurityGroups = 'vpc-456';

  /** Localized strings from defaults for assertions that must track i18n keys. */
  const {
    mp: mpStrings,
    sg: sgStrings,
    securityGroupsListErrorTitle,
  } = machinePoolsSubstepCtStrings;

  /** Advanced panel open without VPC must not list additional security groups controls. */
  test('should not show security groups section when no VPC is selected', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepMount />);

    const advancedToggle = component.getByText('Advanced machine pool configuration (optional)');
    await advancedToggle.click();

    await expect(component.getByText('Additional security groups')).not.toBeVisible();
  });

  /** With a VPC selected, advanced config exposes the Additional security groups subsection. */
  test('should show security groups section when a VPC is selected', async ({ mount }) => {
    const component = await mount(
      <MachinePoolsSubstepMount clusterOverrides={{ selected_vpc: vpcWithSecurityGroups }} />
    );

    const advancedToggle = component.getByText('Advanced machine pool configuration (optional)');
    await advancedToggle.click();

    await expect(component.getByText('Additional security groups')).toBeVisible();
  });

  /** VPC with SGs: no-edit alert and multi-select UI appear under the security groups toggle. */
  test('should show no-edit alert and security groups selector when expanded with a VPC that has security groups', async ({
    mount,
  }) => {
    const component = await mount(
      <MachinePoolsSubstepMount clusterOverrides={{ selected_vpc: vpcWithSecurityGroups }} />
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

  /** VPC without SGs shows empty-state messaging and refresh affordance instead of the picker. */
  test('should show empty alert when VPC has no security groups', async ({ mount }) => {
    const component = await mount(
      <MachinePoolsSubstepMount clusterOverrides={{ selected_vpc: vpcWithNoSecurityGroups }} />
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

  /** Security group menu lists expected mock SG names from the production VPC fixture. */
  test('should display security group options in the dropdown', async ({ mount, page }) => {
    const component = await mount(
      <MachinePoolsSubstepMount clusterOverrides={{ selected_vpc: vpcWithSecurityGroups }} />
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

  /** Selecting "default" closes into a PatternFly label chip on the control. */
  test('should select a security group and show it as a label', async ({ mount, page }) => {
    const component = await mount(
      <MachinePoolsSubstepMount clusterOverrides={{ selected_vpc: vpcWithSecurityGroups }} />
    );

    const advancedToggle = component.getByText('Advanced machine pool configuration (optional)');
    await advancedToggle.click();

    const securityGroupsToggle = component.getByText('Additional security groups');
    await securityGroupsToggle.click();

    await component.getByText('Select security groups').click();
    await page.getByText('default', { exact: true }).click();

    await expect(component.locator('.pf-v6-c-label').getByText('default')).toBeVisible();
  });

  /** Security groups area exposes the dedicated refresh control for reloading SG data. */
  test('should show refresh button for security groups', async ({ mount }) => {
    const component = await mount(
      <MachinePoolsSubstepMount clusterOverrides={{ selected_vpc: vpcWithSecurityGroups }} />
    );

    const advancedToggle = component.getByText('Advanced machine pool configuration (optional)');
    await advancedToggle.click();

    const securityGroupsToggle = component.getByText('Additional security groups');
    await securityGroupsToggle.click();

    const refreshButton = component.locator('#refreshSecurityGroupsButton');
    await expect(refreshButton).toBeVisible();
  });

  /** Pre-4.14 clusters show incompatible-version copy and hide SG picker despite VPC selection. */
  test('should show incompatible cluster version message instead of security group controls below OpenShift 4.14', async ({
    mount,
  }) => {
    const component = await mount(
      <MachinePoolsSubstepMount
        clusterOverrides={{ selected_vpc: vpcWithSecurityGroups, cluster_version: '4.12.0' }}
      />
    );

    const advancedToggle = component.getByText(mpStrings.advancedToggle, { exact: true });
    await advancedToggle.click();

    const securityGroupsToggle = component.getByText(mpStrings.securityGroupsToggle, {
      exact: true,
    });
    await securityGroupsToggle.click();

    await expect(component.getByText(sgStrings.incompatibleVersion, { exact: true })).toBeVisible();
    await expect(component.getByText(sgStrings.selectToggle, { exact: true })).not.toBeVisible();
  });

  /** VPC list error surfaces list error summary instead of the empty-SG alert for a selected VPC. */
  test('should not show empty security groups alert when the VPC list request failed', async ({
    mount,
  }) => {
    const component = await mount(
      <MachinePoolsSubstepMount
        clusterOverrides={{ selected_vpc: vpcWithNoSecurityGroups }}
        vpcList={{ ...mockVpcList, error: 'Failed to load VPCs' }}
      />
    );

    const advancedToggle = component.getByText(mpStrings.advancedToggle, { exact: true });
    await advancedToggle.click();

    const securityGroupsToggle = component.getByText(mpStrings.securityGroupsToggle, {
      exact: true,
    });
    await securityGroupsToggle.click();

    await expect(component.getByText(sgStrings.emptyTitle, { exact: true })).not.toBeVisible();
    // Substring match: exact fails when the summary lives under Button > FormHelperText (PF layout).
    await expect(component.getByText(securityGroupsListErrorTitle)).toBeVisible();
  });

  /** Changing VPC after selecting an SG clears prior SG labels from the multi-select. */
  test('should clear selected security groups when VPC is changed', async ({ mount, page }) => {
    const component = await mount(
      <MachinePoolsSubstepMount clusterOverrides={{ selected_vpc: vpcWithSecurityGroups }} />
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

/** Label text for the advanced machine pool expandable used across root-disk validation tests. */
const ADVANCED_TOGGLE_TEXT = 'Advanced machine pool configuration (optional)';

/** Mounts `MachinePoolsSubstepMount` with `showValidation` and optional cluster default overrides. */
const mountWithValidation = (
  mount: Parameters<Parameters<typeof test>[2]>[0]['mount'],
  clusterOverrides: Record<string, unknown> = {}
) => mount(<MachinePoolsSubstepMount clusterOverrides={clusterOverrides} showValidation />);

/** Root disk GiB validation rules across OpenShift version thresholds and min/max boundaries. */
test.describe('Root disk size validation', () => {
  /** Advanced section expanded shows the root disk size field. */
  test('should render root disk size input inside advanced section', async ({ mount }) => {
    const component = await mountWithValidation(mount);

    const advancedToggle = component.getByText(ADVANCED_TOGGLE_TEXT);
    await advancedToggle.click();

    await expect(component.getByText('Root disk size', { exact: true })).toBeVisible();
  });

  /** Valid default root volume (100) produces no min/max validation messages. */
  test('should not show validation error for a valid value', async ({ mount }) => {
    const component = await mountWithValidation(mount, { compute_root_volume: 100 });

    const advancedToggle = component.getByText(ADVANCED_TOGGLE_TEXT);
    await advancedToggle.click();

    await expect(component.getByText(/Root disk size must be/)).not.toBeVisible();
    await expect(component.getByText(/must not exceed/)).not.toBeVisible();
  });

  /** Lower bound 75 GiB is accepted without validation errors. */
  test('should not show validation error for minimum boundary value (75)', async ({ mount }) => {
    const component = await mountWithValidation(mount, { compute_root_volume: 75 });

    const advancedToggle = component.getByText(ADVANCED_TOGGLE_TEXT);
    await advancedToggle.click();

    await expect(component.getByText(/Root disk size must be/)).not.toBeVisible();
    await expect(component.getByText(/must not exceed/)).not.toBeVisible();
  });

  /** On 4.16, max allowed 16384 GiB passes validation at the upper boundary. */
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

  /** Root disk below the allowed minimum (50 GiB) shows the at-least-75 GiB validation error. */
  test('should show error when root disk size is below minimum', async ({ mount }) => {
    const component = await mountWithValidation(mount, { compute_root_volume: 50 });

    const advancedToggle = component.getByText(ADVANCED_TOGGLE_TEXT);
    await advancedToggle.click();

    await expect(component.getByText('Root disk size must be at least 75 GiB.')).toBeVisible();
  });

  /** Non-integer root disk size shows the integer-only validation message. */
  test('should show error when root disk size is not an integer', async ({ mount }) => {
    const component = await mountWithValidation(mount, { compute_root_volume: 75.5 });

    const advancedToggle = component.getByText(ADVANCED_TOGGLE_TEXT);
    await advancedToggle.click();

    await expect(component.getByText('Root disk size must be an integer.')).toBeVisible();
  });

  /** Oversized volume on 4.16 exceeds post-4.14 cap and surfaces the 16384 GiB max error. */
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

  /** On 4.12, volumes above legacy 1024 GiB cap show the older maximum error text. */
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

  /** Exactly 1024 GiB is valid for pre-4.14 clusters at the legacy upper bound. */
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
