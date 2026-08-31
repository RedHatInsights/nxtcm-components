import { expect, type MountResult, test } from '@playwright/experimental-ct-react';
import type { Page } from '@playwright/test';
import { checkAccessibility } from '../../../test-helpers';
import { defaultRosaHcpWizardStrings } from '../../../stringsProvider/rosaHcpWizardStrings.defaults';
import rosaHcpWizardFixtures from '../../../ROSAHCPWizard.fixtures';
import {
  makeMachineTypesResource,
  makeVpcListResource,
} from '../../../test/rosaHcpWizardCtSpecHelpers';
import { maxReplicasSchema, minReplicasSchema, nodesComputeSchema } from '../../../yupSchemas';
import { FIELD_NAME } from '../../../constants';
import { MachinePoolsMount } from './MachinePools.spec-helpers';

const mp = defaultRosaHcpWizardStrings.machinePools;
const a = defaultRosaHcpWizardStrings.autoscaling;
const sg = defaultRosaHcpWizardStrings.securityGroups;

const [fixtureVpc1, fixtureVpc2] = rosaHcpWizardFixtures.mockVPCs;
const fixtureVpc1PrivateSubnet = fixtureVpc1.aws_subnets.find((subnet) =>
  subnet.name.includes('private')
)!;
const defaultMinReplicas = String(minReplicasSchema.getDefault());
const defaultMaxReplicas = String(maxReplicasSchema.getDefault());
const defaultNodesCompute = String(nodesComputeSchema.getDefault());

const vpcRefreshFormDefaults = {
  associated_aws_id: '123456789012',
  installer_role_arn: 'arn:aws:iam::123456789012:role/installer',
  region: 'us-east-1',
  cluster_version: '4.16.2',
} as const;

/** Typeahead combobox accessible name is the explicit {@link MachinePools} `placeholder` (not derived from label). */
const ctRegion = 'us-east-1';
const vpcSelectMenuName = `${mp.vpcPlaceholder} ${ctRegion}`;
const instanceTypeSelectName = 'Select the compute node instance type';

/**
 * Opens the VPC typeahead and chooses an option. Combobox name stays {@link vpcSelectMenuName} after selection.
 */
async function selectVpc(component: MountResult, page: Page, vpcName: string) {
  await component.getByRole('combobox', { name: vpcSelectMenuName, exact: true }).click();
  await page.getByRole('option', { name: vpcName, exact: true }).click();
}

test.describe('MachinePools (ROSA HCP)', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<MachinePoolsMount />);
    await checkAccessibility({ component });
  });

  test('should render machine pool section with instance type and autoscaling', async ({
    mount,
  }) => {
    const component = await mount(<MachinePoolsMount />);
    await expect(component.getByText(mp.sectionLabel, { exact: true })).toBeVisible();
    await expect(
      component.getByRole('combobox', { name: vpcSelectMenuName, exact: true })
    ).toBeVisible();
    await expect(
      component.getByRole('checkbox', { name: a.enableLabel, exact: true })
    ).toBeVisible();
  });

  test('should disable private subnet select until a VPC is selected', async ({ mount }) => {
    const component = await mount(<MachinePoolsMount />);

    const subnetCombo = component.getByRole('combobox', {
      name: mp.subnetPlaceholder,
      exact: true,
    });
    await expect(subnetCombo).toBeDisabled();
  });

  test('should enable subnet select and list private subnets after choosing a VPC', async ({
    mount,
    page,
  }) => {
    const component = await mount(<MachinePoolsMount />);

    await selectVpc(component, page, fixtureVpc1.name);

    const subnetCombo = component.getByRole('combobox', {
      name: mp.subnetPlaceholder,
      exact: true,
    });
    await expect(subnetCombo).toBeEnabled();

    await subnetCombo.click();
    await expect(
      page.getByRole('option', { name: fixtureVpc1PrivateSubnet.name, exact: true })
    ).toBeVisible();
  });

  test('should reset subnet and security groups when VPC changes', async ({ mount, page }) => {
    const component = await mount(
      <MachinePoolsMount
        defaultValues={{
          selected_vpc: fixtureVpc1.id,
          machine_pools_subnets: [{ machine_pool_subnet: fixtureVpc1PrivateSubnet.subnet_id }],
          security_groups_worker: [rosaHcpWizardFixtures.mockSecurityGroups[0].id],
        }}
      />
    );

    await component.getByRole('button', { name: mp.advancedToggle, exact: true }).click();
    await expect(component.getByText('default', { exact: true })).toBeVisible();

    await selectVpc(component, page, fixtureVpc2.name);

    const subnetCombo = component.getByRole('combobox', {
      name: mp.subnetPlaceholder,
      exact: true,
    });
    await expect(subnetCombo).toHaveValue('');
    await expect(component.getByText('default', { exact: true })).not.toBeVisible();
  });

  test('should fetch machine types when region is present', async ({ mount }) => {
    const fetchedRegions: string[] = [];
    const machineTypes = makeMachineTypesResource({
      fetch: (args) => {
        fetchedRegions.push(args.region);
        return Promise.resolve();
      },
    });

    await mount(
      <MachinePoolsMount
        machineTypes={machineTypes}
        defaultValues={{
          installer_role_arn: 'arn:aws:iam::role/test-installer',
          selected_vpc: fixtureVpc1.id,
        }}
      />
    );

    await expect
      .poll(() => fetchedRegions.length > 0 && fetchedRegions.every((r) => r === 'us-east-1'))
      .toBe(true);
  });

  test('should sort General Purpose machine types to the top while preserving group-internal order', async ({
    mount,
    page,
  }) => {
    const machineTypes = makeMachineTypesResource({
      data: [
        {
          id: 'c5.2xlarge',
          label: 'c5.2xlarge',
          description: '8 vCPU',
          value: 'c5.2xlarge',
          category: 'RAM optimized',
        },
        {
          id: 'm5a.xlarge',
          label: 'm5a.xlarge',
          description: '4 vCPU',
          value: 'm5a.xlarge',
          category: 'General Purpose',
        },
        {
          id: 'r5.xlarge',
          label: 'r5.xlarge',
          description: '4 vCPU',
          value: 'r5.xlarge',
          category: 'Storage optimized',
        },
        {
          id: 'm6a.xlarge',
          label: 'm6a.xlarge',
          description: '4 vCPU',
          value: 'm6a.xlarge',
          category: 'General Purpose',
        },
      ],
    });

    const component = await mount(
      <MachinePoolsMount machineTypes={machineTypes} defaultValues={{ selected_vpc: '' }} />
    );

    const instanceTypeCombo = component.getByRole('combobox', {
      name: instanceTypeSelectName,
      exact: true,
    });
    await instanceTypeCombo.click();

    const options = page.getByRole('option');
    await expect(options.nth(0)).toHaveText(/m5a\.xlarge/);
    await expect(options.nth(1)).toHaveText(/m6a\.xlarge/);
    await expect(options.nth(2)).toHaveText(/c5\.2xlarge/);
    await expect(options.nth(3)).toHaveText(/r5\.xlarge/);
  });

  test('should hide compute node count when configured in hiddenFields', async ({ mount }) => {
    const component = await mount(
      <MachinePoolsMount config={{ hiddenFields: [FIELD_NAME.NODES_COMPUTE] }} />
    );

    await expect(
      component.getByRole('spinbutton', { name: a.computeCountLabel, exact: true })
    ).toHaveCount(0);
  });

  test('should show compute node count by default and min/max when autoscaling is enabled', async ({
    mount,
  }) => {
    const component = await mount(<MachinePoolsMount />);

    await expect(
      component.getByRole('spinbutton', { name: a.computeCountLabel, exact: true })
    ).toBeVisible();
    await expect(
      component.getByRole('spinbutton', { name: a.minLabel, exact: true })
    ).not.toBeVisible();

    await component.getByRole('checkbox', { name: a.enableLabel, exact: true }).click();

    await expect(
      component.getByRole('spinbutton', { name: a.minLabel, exact: true })
    ).toBeVisible();
    await expect(
      component.getByRole('spinbutton', { name: a.maxLabel, exact: true })
    ).toBeVisible();
    await expect(
      component.getByRole('spinbutton', { name: a.computeCountLabel, exact: true })
    ).not.toBeVisible();
  });

  test('should disable min replica plus button at max replica bound', async ({ mount }) => {
    const component = await mount(<MachinePoolsMount />);

    await component.getByRole('checkbox', { name: a.enableLabel, exact: true }).click();

    const minField = component.locator('#min_replicas-form-group');
    await minField.getByRole('button', { name: 'Plus' }).click();
    await minField.getByRole('button', { name: 'Plus' }).click();
    await expect(minField.getByRole('spinbutton')).toHaveValue(defaultMaxReplicas);
    await expect(minField.getByRole('button', { name: 'Plus' })).toBeDisabled();
  });

  test('should disable max replica minus button at min replica bound', async ({ mount }) => {
    const component = await mount(<MachinePoolsMount />);

    await component.getByRole('checkbox', { name: a.enableLabel, exact: true }).click();

    const maxField = component.locator('#max_replicas-form-group');
    await maxField.getByRole('button', { name: 'Minus' }).click();
    await maxField.getByRole('button', { name: 'Minus' }).click();
    await expect(maxField.getByRole('spinbutton')).toHaveValue(defaultMinReplicas);
    await expect(maxField.getByRole('button', { name: 'Minus' })).toBeDisabled();
  });

  test('should set replica defaults when autoscaling is enabled and restore compute count when disabled', async ({
    mount,
  }) => {
    const component = await mount(<MachinePoolsMount />);

    await component.getByRole('checkbox', { name: a.enableLabel, exact: true }).click();

    await expect(component.getByRole('spinbutton', { name: a.minLabel, exact: true })).toHaveValue(
      defaultMinReplicas
    );
    await expect(component.getByRole('spinbutton', { name: a.maxLabel, exact: true })).toHaveValue(
      defaultMaxReplicas
    );

    await component.getByRole('checkbox', { name: a.enableLabel, exact: true }).click();

    await expect(
      component.getByRole('spinbutton', { name: a.computeCountLabel, exact: true })
    ).toHaveValue(defaultNodesCompute);
    await expect(
      component.getByRole('spinbutton', { name: a.minLabel, exact: true })
    ).not.toBeVisible();
  });

  test('should show advanced machine pool controls inside expandable section', async ({
    mount,
  }) => {
    const component = await mount(<MachinePoolsMount />);

    await component.getByRole('button', { name: mp.advancedToggle, exact: true }).click();

    await expect(
      component.getByRole('radio', { name: new RegExp(`^${mp.imdsBothLabel}`) })
    ).toBeVisible();
    await expect(
      component.getByRole('spinbutton', { name: mp.rootDiskLabel, exact: true })
    ).toBeVisible();
  });

  test('should show security groups inside advanced section when a VPC is selected on a compatible version', async ({
    mount,
  }) => {
    const component = await mount(
      <MachinePoolsMount defaultValues={{ selected_vpc: fixtureVpc1.id }} />
    );

    await component.getByRole('button', { name: mp.advancedToggle, exact: true }).click();

    await expect(component.getByText(sg.formLabel, { exact: true })).toBeVisible();
    await expect(
      component.getByRole('button', { name: sg.optionsMenuAria, exact: true })
    ).toBeVisible();
  });

  test('should show incompatible version message for security groups when cluster version is too old', async ({
    mount,
  }) => {
    const component = await mount(
      <MachinePoolsMount
        defaultValues={{
          selected_vpc: fixtureVpc1.id,
          cluster_version: '4.13.0',
        }}
      />
    );

    await component.getByRole('button', { name: mp.advancedToggle, exact: true }).click();

    await expect(component.getByText(sg.incompatibleVersion, { exact: true })).toBeVisible();
  });

  test('should refetch vpc list when security groups refresh is pressed', async ({ mount }) => {
    let fetchCount = 0;
    const vpcList = makeVpcListResource({
      fetch: () => {
        fetchCount += 1;
        return Promise.resolve();
      },
    });

    const component = await mount(
      <MachinePoolsMount
        vpcList={vpcList}
        defaultValues={{
          ...vpcRefreshFormDefaults,
          selected_vpc: fixtureVpc1.id,
        }}
      />
    );

    await component.getByRole('button', { name: mp.advancedToggle, exact: true }).click();

    const advancedSection = component.getByRole('region', { name: mp.advancedToggle });
    const refreshButton = advancedSection.getByTestId('multiselect-refresh');

    await expect(refreshButton).toBeVisible();
    const fetchCountBeforeRefresh = fetchCount;
    await refreshButton.click();

    await expect.poll(() => fetchCount).toBe(fetchCountBeforeRefresh + 1);
  });

  test('should refetch vpc list from empty security groups refresh control', async ({ mount }) => {
    let fetchCount = 0;
    const vpcList = makeVpcListResource({
      fetch: () => {
        fetchCount += 1;
        return Promise.resolve();
      },
    });

    const component = await mount(
      <MachinePoolsMount
        vpcList={vpcList}
        defaultValues={{
          ...vpcRefreshFormDefaults,
          selected_vpc: fixtureVpc2.id,
        }}
      />
    );

    await component.getByRole('button', { name: mp.advancedToggle, exact: true }).click();

    const refreshButton = component.getByTestId('security-groups-refresh');
    await expect(refreshButton).toBeVisible();
    const fetchCountBeforeRefresh = fetchCount;
    await refreshButton.click();

    await expect.poll(() => fetchCount).toBe(fetchCountBeforeRefresh + 1);
  });

  test('should disable security groups refresh while vpc list is fetching', async ({ mount }) => {
    const vpcList = makeVpcListResource({
      isFetching: true,
      fetch: () => Promise.resolve(),
    });

    const component = await mount(
      <MachinePoolsMount
        vpcList={vpcList}
        defaultValues={{
          ...vpcRefreshFormDefaults,
          selected_vpc: fixtureVpc1.id,
        }}
      />
    );

    await component.getByRole('button', { name: mp.advancedToggle, exact: true }).click();

    const advancedSection = component.getByRole('region', { name: mp.advancedToggle });
    const refreshButton = advancedSection.getByTestId('multiselect-refresh');

    await expect(refreshButton).toBeVisible();
    await expect(refreshButton).toBeDisabled();
  });

  test('should show loading state on VPC select when vpc list is fetching', async ({ mount }) => {
    const vpcList = makeVpcListResource({
      data: [],
      isFetching: true,
      fetch: async () => {},
    });

    const component = await mount(<MachinePoolsMount vpcList={vpcList} />);

    const vpcCombo = component
      .locator('#machine-pools-section')
      .getByRole('combobox', { name: vpcSelectMenuName, exact: true });
    await expect(vpcCombo).toHaveValue('Loading...');
  });
});
