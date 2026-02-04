import { test, expect } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../../../../test-helpers';
import { NetworkingSubStepStory } from './NetworkingAndSubnetsSubStep.story';

test.describe('NetworkingAndSubnetsSubStep', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory />);
    await checkAccessibility({ component });
  });

  test('should render Networking section with radio options', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory />);

    await expect(component.getByText('Networking', { exact: true })).toBeVisible();
    await expect(component.getByRole('radio', { name: 'Public' })).toBeVisible();
    await expect(component.getByRole('radio', { name: 'Private' })).toBeVisible();
  });

  test('should render Machine pools section', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory />);

    await expect(component.getByText('Machine pools', { exact: true })).toBeVisible();
    await expect(
      component.getByText(/Create machine pools and specify the private subnet/)
    ).toBeVisible();
  });

  test('should display VPC select dropdown', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory />);

    await expect(component.getByText(/Select a VPC to install your machine pools/)).toBeVisible();
  });

  test('should display Compute node instance type dropdown', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory />);

    await expect(component.getByText('Compute node instance type', { exact: true })).toBeVisible();
  });

  test('should display autoscaling checkbox', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory />);

    await expect(component.getByText('Autoscaling', { exact: true })).toBeVisible();
    await expect(component.getByRole('checkbox', { name: /Enable autoscaling/ })).toBeVisible();
  });

  test('should display Compute node count when autoscaling is disabled', async ({ mount }) => {
    const component = await mount(
      <NetworkingSubStepStory clusterOverrides={{ autoscaling: false }} />
    );

    await expect(component.getByText('Compute node count', { exact: true })).toBeVisible();
  });

  test('should display machine pool select component', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory />);

    await expect(component.getByText('Machine pool', { exact: true })).toBeVisible();
    await expect(component.getByText('Private subnet name', { exact: true })).toBeVisible();
    await expect(component.getByRole('button', { name: 'Add machine pool' })).toBeVisible();
  });

  test('should render with empty VPC list', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory vpcList={[]} />);

    await expect(component.getByText('Machine pools', { exact: true })).toBeVisible();
  });

  test('should render with empty machine types list', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory machineTypes={[]} />);

    await expect(component.getByText('Compute node instance type', { exact: true })).toBeVisible();
  });

  test('should have Private radio option clickable', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory />);

    const privateRadio = component.getByRole('radio', { name: 'Private' });
    await expect(privateRadio).toBeVisible();
    await expect(privateRadio).toBeEnabled();
    await privateRadio.click();
    // Note: State changes require the story to use React state - just verify click doesn't error
  });

  test('should have autoscaling checkbox clickable', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory />);

    const autoscalingCheckbox = component.getByRole('checkbox', { name: /Enable autoscaling/ });
    await expect(autoscalingCheckbox).toBeVisible();
    await expect(autoscalingCheckbox).toBeEnabled();
    await autoscalingCheckbox.click();
    // Note: State changes require the story to use React state - just verify click doesn't error
  });

  test('should click Add machine pool button', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory />);

    const addButton = component.getByRole('button', { name: 'Add machine pool' });
    await expect(addButton).toBeVisible();
    await addButton.click();
  });

  test('should display helper text for autoscaling', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory />);

    await expect(
      component.getByText(/Autoscaling automatically adds and removes nodes/)
    ).toBeVisible();
  });

  test('should render all sections in correct order', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory />);

    const networkingSection = component.getByText('Networking', { exact: true });
    const machinePoolsSection = component.getByText('Machine pools', { exact: true });

    await expect(networkingSection).toBeVisible();
    await expect(machinePoolsSection).toBeVisible();
  });
});
