import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../test-helpers';
import {
  MachinePoolsAdvancedSectionMount,
  mockVPCForAdvanced,
  mockVpcListResourceWithError,
} from './MachinePoolsAdvancedSection.spec-helpers';

test.describe('MachinePoolsAdvancedSection', () => {
  test('should render expandable section with toggle', async ({ mount }) => {
    const component = await mount(<MachinePoolsAdvancedSectionMount />);
    const toggle = component.getByRole('button', { name: /advanced/i });
    await expect(toggle).toBeVisible();
  });

  test('should expand to show IMDS radio group', async ({ mount }) => {
    const component = await mount(<MachinePoolsAdvancedSectionMount />);
    const toggle = component.getByRole('button', { name: /advanced/i });
    await toggle.click();

    await expect(component.getByRole('radio', { name: /imdsv1 and imdsv2/i })).toBeVisible();
    await expect(component.getByRole('radio', { name: /imdsv2 only/i })).toBeVisible();
  });

  test('should have IMDSv1+v2 radio selected by default', async ({ mount }) => {
    const component = await mount(<MachinePoolsAdvancedSectionMount />);
    const toggle = component.getByRole('button', { name: /advanced/i });
    await toggle.click();

    await expect(component.getByRole('radio', { name: /imdsv1 and imdsv2/i })).toBeChecked();
  });

  test('should allow selecting IMDSv2 only', async ({ mount }) => {
    const component = await mount(<MachinePoolsAdvancedSectionMount />);
    const toggle = component.getByRole('button', { name: /advanced/i });
    await toggle.click();

    const imdsv2Radio = component.getByRole('radio', { name: /imdsv2 only/i });
    await imdsv2Radio.click();
    await expect(imdsv2Radio).toBeChecked();
  });

  test('should disable IMDS options when wrongVersionForIMDS is true', async ({ mount }) => {
    const component = await mount(<MachinePoolsAdvancedSectionMount wrongVersionForIMDS={true} />);
    const toggle = component.getByRole('button', { name: /advanced/i });
    await toggle.click();

    await expect(component.getByRole('radio', { name: /imdsv1 and imdsv2/i })).toBeDisabled();
    await expect(component.getByRole('radio', { name: /imdsv2 only/i })).toBeDisabled();
  });

  test('should render root volume number input', async ({ mount }) => {
    const component = await mount(<MachinePoolsAdvancedSectionMount />);
    const toggle = component.getByRole('button', { name: /advanced/i });
    await toggle.click();

    const rootVolumeInput = component.getByRole('spinbutton', { name: /root disk size/i });
    await expect(rootVolumeInput).toBeVisible();
    await expect(rootVolumeInput).toHaveValue('300');
  });

  test('should allow changing root volume size', async ({ mount }) => {
    const component = await mount(<MachinePoolsAdvancedSectionMount />);
    const toggle = component.getByRole('button', { name: /advanced/i });
    await toggle.click();

    const rootVolumeInput = component.getByRole('spinbutton', { name: /root disk size/i });
    await rootVolumeInput.fill('500');
    await expect(rootVolumeInput).toHaveValue('500');
  });

  test('should apply maxRootDiskSize constraint', async ({ mount }) => {
    const component = await mount(<MachinePoolsAdvancedSectionMount maxRootDiskSize={1000} />);
    const toggle = component.getByRole('button', { name: /advanced/i });
    await toggle.click();

    const rootVolumeInput = component.getByRole('spinbutton', { name: /root disk size/i });
    // The max attribute should be set
    await expect(rootVolumeInput).toHaveAttribute('max', '1000');
  });

  test('should render EditSecurityGroups component', async ({ mount }) => {
    const component = await mount(<MachinePoolsAdvancedSectionMount />);
    const toggle = component.getByRole('button', { name: /advanced/i });
    await toggle.click();

    await expect(component.getByTestId('securitygroups-id')).toBeVisible();
  });

  test('should pass VPC error to security groups', async ({ mount }) => {
    const component = await mount(
      <MachinePoolsAdvancedSectionMount vpcList={mockVpcListResourceWithError} />
    );
    const toggle = component.getByRole('button', { name: /advanced/i });
    await toggle.click();

    await expect(component.getByText('VPC load error')).toBeVisible();
  });

  test('should pass VPC loading state to security groups', async ({ mount }) => {
    const vpcListLoading = {
      data: [],
      error: null,
      isFetching: true,
      fetch: async () => {},
    };
    const component = await mount(<MachinePoolsAdvancedSectionMount vpcList={vpcListLoading} />);
    const toggle = component.getByRole('button', { name: /advanced/i });
    await toggle.click();

    await expect(component.locator('.pf-v6-c-spinner')).toBeVisible();
  });

  test('should call refreshVPCs when security groups refresh button clicked', async ({ mount }) => {
    const calls: string[] = [];
    const refreshVPCs = () => calls.push('refresh');

    const component = await mount(
      <MachinePoolsAdvancedSectionMount
        selectedVPC={{ ...mockVPCForAdvanced, aws_security_groups: [] }}
        refreshVPCs={refreshVPCs}
      />
    );
    const toggle = component.getByRole('button', { name: /advanced/i });
    await toggle.click();

    // Should show empty alert with refresh button
    await component.getByTestId('security-groups-refresh').click();
    expect(calls).toEqual(['refresh']);
  });

  test('should pass cluster version to security groups', async ({ mount }) => {
    // For old cluster versions, security groups section should not show the multi-select
    const component = await mount(<MachinePoolsAdvancedSectionMount clusterVersion="4.11.0" />);
    const toggle = component.getByRole('button', { name: /advanced/i });
    await toggle.click();

    // Security groups multi-select should not be visible for incompatible versions
    await expect(component.getByTestId('securitygroups-id')).not.toBeVisible();
  });

  test('should pass accessibility tests when collapsed', async ({ mount }) => {
    const component = await mount(<MachinePoolsAdvancedSectionMount />);
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests when expanded', async ({ mount }) => {
    const component = await mount(<MachinePoolsAdvancedSectionMount />);
    const toggle = component.getByRole('button', { name: /advanced/i });
    await toggle.click();
    await checkAccessibility({ component });
  });
});
