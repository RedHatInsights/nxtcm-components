import { expect, type MountResult, test } from '@playwright/experimental-ct-react';
import type { Page } from '@playwright/test';
import { checkAccessibility } from '../../../test-helpers';
import {
  defaultRosaHcpWizardStrings,
  defaultRosaHcpWizardValidatorStrings,
} from '../../../stringsProvider/rosaHcpWizardStrings.defaults';
import rosaHcpWizardFixtures from '../../../ROSAHCPWizard.fixtures';
import {
  makeMachineTypesResource,
  makeVpcListResource,
} from '../../../test/rosaHcpWizardCtSpecHelpers';
import { maxReplicasSchema, minReplicasSchema, nodesComputeSchema } from '../../../yupSchemas';
import {
  MachinePoolsMount,
  MachinePoolsForwardNavMount,
  MachinePoolsWizardNavMount,
} from './MachinePools.spec-helpers';

const mp = defaultRosaHcpWizardStrings.machinePools;
const a = defaultRosaHcpWizardStrings.autoscaling;
const sg = defaultRosaHcpWizardStrings.securityGroups;
const w = defaultRosaHcpWizardStrings.wizard;

const wizardNavStepErrorButtonName = (stepLabel: string): RegExp =>
  new RegExp(`, error ${stepLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');

const [fixtureVpc1, fixtureVpc2] = rosaHcpWizardFixtures.mockVPCs;
const fixtureVpc1PrivateSubnet = fixtureVpc1.aws_subnets.find((subnet) =>
  subnet.name.includes('private')
)!;
const defaultMinReplicas = String(minReplicasSchema.getDefault());
const defaultMaxReplicas = String(maxReplicasSchema.getDefault());
const defaultNodesCompute = String(nodesComputeSchema.getDefault());

/** Plain (non-typeahead) Select: toggle shows explicit {@link MachinePools} `placeholder` (not derived from label). */
const ctRegion = 'us-east-1';
const vpcSelectMenuName = `${mp.vpcPlaceholder} ${ctRegion}`;

/**
 * Opens the VPC select. Toggle shows {@link vpcSelectMenuName} when empty, or the selected VPC label when set.
 */
async function selectVpc(
  component: MountResult,
  page: Page,
  vpcName: string,
  toggleName: string = vpcSelectMenuName
) {
  await component.getByRole('button', { name: toggleName, exact: true }).click();
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

    await selectVpc(component, page, fixtureVpc1.name);

    const subnetToggle = component.getByRole('button', { name: mp.subnetPlaceholder, exact: true });
    await expect(subnetToggle).toBeEnabled();

    await subnetToggle.click();
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

    await selectVpc(component, page, fixtureVpc2.name, fixtureVpc1.name);

    const subnetToggle = component.getByRole('button', { name: mp.subnetPlaceholder, exact: true });
    await expect(subnetToggle).toHaveText(mp.subnetPlaceholder);
    await expect(component.getByText('default', { exact: true })).not.toBeVisible();
  });

  test('should fetch machine types when region is present', async ({ mount }) => {
    const fetchedRegions: string[] = [];
    const machineTypes = makeMachineTypesResource({
      fetch: (region: string) => {
        fetchedRegions.push(region);
        return Promise.resolve();
      },
    });

    await mount(<MachinePoolsMount machineTypes={machineTypes} />);

    await expect
      .poll(() => fetchedRegions.length > 0 && fetchedRegions.every((r) => r === 'us-east-1'))
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

  test('should clear machine pools nav error when autoscaling is disabled', async ({ mount }) => {
    const component = await mount(<MachinePoolsWizardNavMount />);
    const autoscalingCheckbox = component.getByRole('checkbox', {
      name: a.enableLabel,
      exact: true,
    });

    await autoscalingCheckbox.click();

    for (let click = 0; click < 3; click += 1) {
      await component.getByRole('button', { name: 'Minus' }).nth(1).click();
    }

    await expect(
      component.getByRole('button', {
        name: wizardNavStepErrorButtonName(w.stepLabels.machinePools),
      })
    ).toBeVisible();

    await autoscalingCheckbox.click();

    await expect(
      component.getByRole('button', {
        name: wizardNavStepErrorButtonName(w.stepLabels.machinePools),
      })
    ).not.toBeVisible();
  });

  test('should show machine pools nav error when max is less than min', async ({ mount }) => {
    const component = await mount(<MachinePoolsWizardNavMount />);

    await component.getByRole('checkbox', { name: a.enableLabel, exact: true }).click();

    for (let click = 0; click < 3; click += 1) {
      await component.getByRole('button', { name: 'Minus' }).nth(1).click();
    }

    await expect(
      component.getByRole('button', {
        name: wizardNavStepErrorButtonName(w.stepLabels.machinePools),
      })
    ).toBeVisible();
    await expect(
      component.getByRole('button', {
        name: wizardNavStepErrorButtonName(w.stepLabels.basicSetup),
      })
    ).toBeVisible();
  });

  test('should hide machine pools nav error while the VPC select menu is open', async ({
    mount,
  }) => {
    const component = await mount(<MachinePoolsWizardNavMount />);
    const vpcToggle = component.getByRole('button', { name: vpcSelectMenuName, exact: true });
    const machinePoolsNavError = component.getByRole('button', {
      name: wizardNavStepErrorButtonName(w.stepLabels.machinePools),
    });
    const sectionTitle = component
      .locator('#machine-pools-section')
      .getByText(mp.sectionLabel, { exact: true });

    await vpcToggle.click();
    await sectionTitle.click();

    await expect(machinePoolsNavError).toBeVisible();

    await vpcToggle.click();
    await expect(machinePoolsNavError).not.toBeVisible();

    await sectionTitle.click();
    await expect(machinePoolsNavError).toBeVisible();
  });

  test('should disable forward visited steps after the VPC reset-source field changes', async ({
    mount,
    page,
  }) => {
    const component = await mount(
      <MachinePoolsForwardNavMount
        defaultValues={{
          selected_vpc: fixtureVpc1.id,
          machine_pools_subnets: [{ machine_pool_subnet: fixtureVpc1PrivateSubnet.subnet_id }],
        }}
      />
    );

    const networkingNav = component.getByRole('button', {
      name: w.stepLabels.networking,
      exact: true,
    });
    await expect(networkingNav).toBeEnabled();

    await selectVpc(component, page, fixtureVpc2.name, fixtureVpc1.name);

    await expect(networkingNav).toBeDisabled();
  });

  test('should show max less than min validation when max is decremented with the minus button', async ({
    mount,
  }) => {
    const component = await mount(<MachinePoolsMount />);
    const maxReplicasError = defaultRosaHcpWizardValidatorStrings.replicas.maxLessThanMin;

    await component.getByRole('checkbox', { name: a.enableLabel, exact: true }).click();

    const maxInput = component.getByRole('spinbutton', { name: a.maxLabel, exact: true });
    await expect(maxInput).toHaveValue(defaultMaxReplicas);

    for (let click = 0; click < 3; click += 1) {
      await component.getByRole('button', { name: 'Minus' }).nth(1).click();
    }

    await expect(maxInput).toHaveValue('1');
    await expect(component.getByText(maxReplicasError, { exact: true })).toBeVisible();
  });

  test('should clear replica validation when autoscaling is toggled off and back on', async ({
    mount,
  }) => {
    const component = await mount(<MachinePoolsMount />);
    const maxReplicasError = defaultRosaHcpWizardValidatorStrings.replicas.maxLessThanMin;
    const autoscalingCheckbox = component.getByRole('checkbox', {
      name: a.enableLabel,
      exact: true,
    });

    await autoscalingCheckbox.click();

    for (let click = 0; click < 3; click += 1) {
      await component.getByRole('button', { name: 'Minus' }).nth(1).click();
    }

    await expect(component.getByText(maxReplicasError, { exact: true })).toBeVisible();

    await autoscalingCheckbox.click();
    await autoscalingCheckbox.click();

    await expect(component.getByRole('spinbutton', { name: a.minLabel, exact: true })).toHaveValue(
      defaultMinReplicas
    );
    await expect(component.getByRole('spinbutton', { name: a.maxLabel, exact: true })).toHaveValue(
      defaultMaxReplicas
    );
    await expect(component.getByText(maxReplicasError, { exact: true })).not.toBeVisible();
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
