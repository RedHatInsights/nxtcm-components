import { test, expect } from '@playwright/experimental-ct-react';

import { checkAccessibility } from '../../../../../../test-helpers';
import type { MachineTypesResource } from '../../../types';
import { defaultRosaHcpWizardStrings } from '../../../stringsProvider/rosaHcpWizardStrings.defaults';
import rosaWizardFixtures from '../../../../RosaWizard/RosaWizard.fixtures';
import { makeVpcListResource } from '../../../rosaHcpWizardCtSpecHelpers';
import { MachinePoolsMount } from './MachinePools.spec-helpers';

const mp = defaultRosaHcpWizardStrings.machinePools;
const a = defaultRosaHcpWizardStrings.autoscaling;
const sg = defaultRosaHcpWizardStrings.securityGroups;

/** Plain (non-typeahead) Select: toggle shows explicit {@link MachinePools} `placeholder` (not derived from label). */
const ctRegion = 'us-east-1';
const vpcSelectMenuName = `${mp.vpcPlaceholder} ${ctRegion}`;

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
      component.getByRole('button', { name: vpcSelectMenuName, exact: true })
    ).toBeVisible();
    await expect(
      component.getByRole('checkbox', { name: a.enableLabel, exact: true })
    ).toBeVisible();
  });

  test('should disable private subnet select until a VPC is selected', async ({ mount }) => {
    const component = await mount(<MachinePoolsMount />);

    const subnetToggle = component.getByRole('button', { name: mp.subnetPlaceholder, exact: true });
    await expect(subnetToggle).toBeDisabled();
  });

  test('should enable subnet select and list private subnets after choosing a VPC', async ({
    mount,
    page,
  }) => {
    const component = await mount(<MachinePoolsMount />);

    await component.getByRole('button', { name: vpcSelectMenuName, exact: true }).click();
    await page.getByText('test-vpc-1', { exact: true }).click();

    const subnetToggle = component.getByRole('button', { name: mp.subnetPlaceholder, exact: true });
    await expect(subnetToggle).toBeEnabled();

    await subnetToggle.click();
    await expect(
      page.getByText('test-1-subnet-private1-us-east-1a', { exact: true })
    ).toBeVisible();
  });

  test('should fetch machine types when region is present', async ({ mount }) => {
    const regions: string[] = [];
    const machineTypes: MachineTypesResource = {
      data: rosaWizardFixtures.mockMachineTypes,
      error: null,
      isFetching: false,
      fetch: (region: string) => {
        regions.push(region);
        return Promise.resolve();
      },
    };

    await mount(<MachinePoolsMount machineTypes={machineTypes} />);

    await expect
      .poll(() => regions.length > 0 && regions.every((r) => r === 'us-east-1'))
      .toBe(true);
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

  test('should show security groups expandable section when a VPC is selected on a compatible version', async ({
    mount,
  }) => {
    const component = await mount(
      <MachinePoolsMount defaultValues={{ selected_vpc: rosaWizardFixtures.mockVPCs[0].id }} />
    );

    await expect(
      component.getByRole('button', { name: mp.securityGroupsToggle, exact: true })
    ).toBeVisible();
  });

  test('should show incompatible version message for security groups when cluster version is too old', async ({
    mount,
  }) => {
    const component = await mount(
      <MachinePoolsMount
        defaultValues={{
          selected_vpc: rosaWizardFixtures.mockVPCs[0].id,
          cluster_version: '4.13.0',
        }}
      />
    );

    await component.getByRole('button', { name: mp.securityGroupsToggle, exact: true }).click();

    await expect(component.getByText(sg.incompatibleVersion, { exact: true })).toBeVisible();
  });

  test('should show loading state on VPC select when vpc list is fetching', async ({ mount }) => {
    const vpcList = makeVpcListResource({
      data: [],
      isFetching: true,
      fetch: async () => {},
    });

    const component = await mount(<MachinePoolsMount vpcList={vpcList} />);

    const vpcLoadingToggle = component
      .locator('#machine-pools-section')
      .getByRole('button', { name: 'Loading...', exact: true })
      .first();
    await expect(vpcLoadingToggle).toBeVisible();
  });
});
