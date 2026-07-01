import { expect, type MountResult, test } from '@playwright/experimental-ct-react';

import rosaHcpWizardFixtures from '../../../ROSAHCPWizard.fixtures';
import { defaultRosaHcpWizardStrings } from '../../../stringsProvider/rosaHcpWizardStrings.defaults';
import { checkAccessibility } from '../../../test-helpers';
import { MachinePoolsAdvancedSectionMount } from './MachinePoolsAdvancedSection.spec-helpers';

const mp = defaultRosaHcpWizardStrings.machinePools;
const sg = defaultRosaHcpWizardStrings.securityGroups;

const [fixtureVpc1] = rosaHcpWizardFixtures.mockVPCs;

async function expandAdvancedSection(component: MountResult) {
  await component.getByRole('button', { name: mp.advancedToggle, exact: true }).click();
}

test.describe('MachinePoolsAdvancedSection (ROSA HCP)', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<MachinePoolsAdvancedSectionMount selectedVPC={fixtureVpc1} />);
    await expandAdvancedSection(component);
    await checkAccessibility({ component });
  });

  test('should render the advanced expandable toggle', async ({ mount }) => {
    const component = await mount(<MachinePoolsAdvancedSectionMount />);
    await expect(
      component.getByRole('button', { name: mp.advancedToggle, exact: true })
    ).toBeVisible();
  });

  test('should show IMDS options when cluster version supports IMDS selection', async ({
    mount,
  }) => {
    const component = await mount(<MachinePoolsAdvancedSectionMount wrongVersionForIMDS={false} />);
    await expandAdvancedSection(component);

    await expect(component.getByText(mp.imdsLabel, { exact: true })).toBeVisible();
    await expect(
      component.getByRole('radio', { name: new RegExp(`^${mp.imdsBothLabel}`) })
    ).toBeVisible();
    await expect(
      component.getByRole('radio', { name: new RegExp(`^${mp.imdsV2Label}`) })
    ).toBeVisible();
  });

  test('should hide IMDS options when cluster version does not support IMDS selection', async ({
    mount,
  }) => {
    const component = await mount(<MachinePoolsAdvancedSectionMount wrongVersionForIMDS />);
    await expandAdvancedSection(component);

    await expect(component.getByText(mp.imdsLabel, { exact: true })).not.toBeVisible();
    await expect(
      component.getByRole('radio', { name: new RegExp(`^${mp.imdsBothLabel}`) })
    ).not.toBeVisible();
    await expect(
      component.getByRole('radio', { name: new RegExp(`^${mp.imdsV2Label}`) })
    ).not.toBeVisible();
  });

  test('should always show root disk size input inside advanced section', async ({ mount }) => {
    const component = await mount(<MachinePoolsAdvancedSectionMount wrongVersionForIMDS />);
    await expandAdvancedSection(component);

    await expect(
      component.getByRole('spinbutton', { name: mp.rootDiskLabel, exact: true })
    ).toBeVisible();
  });

  test('should show security groups when a VPC is selected on a compatible cluster version', async ({
    mount,
  }) => {
    const component = await mount(
      <MachinePoolsAdvancedSectionMount selectedVPC={fixtureVpc1} clusterVersion="4.16.2" />
    );
    await expandAdvancedSection(component);

    await expect(component.getByText(sg.formLabel, { exact: true })).toBeVisible();
    await expect(
      component.getByRole('button', { name: sg.optionsMenuAria, exact: true })
    ).toBeVisible();
  });

  test('should show incompatible version message for security groups when cluster version is too old', async ({
    mount,
  }) => {
    const component = await mount(
      <MachinePoolsAdvancedSectionMount selectedVPC={fixtureVpc1} clusterVersion="4.13.0" />
    );
    await expandAdvancedSection(component);

    await expect(component.getByText(sg.incompatibleVersion, { exact: true })).toBeVisible();
  });

  test('should not show security groups when no VPC is selected', async ({ mount }) => {
    const component = await mount(<MachinePoolsAdvancedSectionMount selectedVPC={undefined} />);
    await expandAdvancedSection(component);

    await expect(component.getByText(sg.formLabel, { exact: true })).not.toBeVisible();
    await expect(
      component.getByRole('button', { name: sg.optionsMenuAria, exact: true })
    ).not.toBeVisible();
  });
});
