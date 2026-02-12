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
    await expect(component.getByRole('button', { name: 'Add machine pool' })).toBeVisible();
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

  test('should click Add machine pool button', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepStory />);

    const addButton = component.getByRole('button', { name: 'Add machine pool' });
    await expect(addButton).toBeVisible();
    await addButton.click();
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

  test('should display Root disk size field', async ({ mount }) => {
    const component = await mount(<MachinePoolsSubstepStory />);

    await expect(component.getByText('Root disk size', { exact: true })).toBeVisible();
  });

  test('should display Root disk size with default value', async ({ mount }) => {
    const component = await mount(
      <MachinePoolsSubstepStory
        clusterOverrides={{ compute_root_volume: { aws: { size: 128 } } }}
      />
    );

    const rootDiskFormGroup = component.locator('#cluster-compute_root_volume-aws-size-form-group');
    const rootDiskInput = rootDiskFormGroup.locator('input[type="number"]');
    await expect(rootDiskInput).toBeVisible();
    await expect(rootDiskInput).toHaveValue('128');
  });

  test('should show validation error when Root disk size is below 75', async ({ mount }) => {
    const component = await mount(
      <MachinePoolsSubstepStory
        clusterOverrides={{ compute_root_volume: { aws: { size: 50 } } }}
        showValidation={true}
      />
    );

    await expect(component.getByText('Root disk size must be at least 75 GiB.')).toBeVisible();
  });

  test('should show validation error when Root disk size is above 16384', async ({ mount }) => {
    const component = await mount(
      <MachinePoolsSubstepStory
        clusterOverrides={{ compute_root_volume: { aws: { size: 20000 } } }}
        showValidation={true}
      />
    );

    await expect(component.getByText('Root disk size must not exceed 16384 GiB.')).toBeVisible();
  });

  test('should not show validation error when Root disk size is valid', async ({ mount }) => {
    const component = await mount(
      <MachinePoolsSubstepStory
        clusterOverrides={{ compute_root_volume: { aws: { size: 128 } } }}
        showValidation={true}
      />
    );

    await expect(component.getByText('Root disk size must be at least 75 GiB.')).not.toBeVisible();
    await expect(
      component.getByText('Root disk size must not exceed 16384 GiB.')
    ).not.toBeVisible();
  });

  test('should accept boundary value of 75 for Root disk size', async ({ mount }) => {
    const component = await mount(
      <MachinePoolsSubstepStory
        clusterOverrides={{ compute_root_volume: { aws: { size: 75 } } }}
        showValidation={true}
      />
    );

    await expect(component.getByText('Root disk size must be at least 75 GiB.')).not.toBeVisible();
    await expect(
      component.getByText('Root disk size must not exceed 16384 GiB.')
    ).not.toBeVisible();
  });

  test('should accept boundary value of 16384 for Root disk size', async ({ mount }) => {
    const component = await mount(
      <MachinePoolsSubstepStory
        clusterOverrides={{ compute_root_volume: { aws: { size: 16384 } } }}
        showValidation={true}
      />
    );

    await expect(component.getByText('Root disk size must be at least 75 GiB.')).not.toBeVisible();
    await expect(
      component.getByText('Root disk size must not exceed 16384 GiB.')
    ).not.toBeVisible();
  });
});
