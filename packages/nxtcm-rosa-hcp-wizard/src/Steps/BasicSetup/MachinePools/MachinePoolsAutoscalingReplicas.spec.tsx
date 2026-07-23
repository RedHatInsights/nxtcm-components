import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../test-helpers';
import { MachinePoolsAutoscalingReplicasMount } from './MachinePoolsAutoscalingReplicas.spec-helpers';

test.describe('MachinePoolsAutoscalingReplicas', () => {
  test('should render min and max replica number inputs', async ({ mount }) => {
    const component = await mount(<MachinePoolsAutoscalingReplicasMount />);
    await expect(component.getByRole('spinbutton', { name: /minimum replicas/i })).toBeVisible();
    await expect(component.getByRole('spinbutton', { name: /maximum replicas/i })).toBeVisible();
  });

  test('should have default values for min and max replicas', async ({ mount }) => {
    const component = await mount(<MachinePoolsAutoscalingReplicasMount />);
    const minInput = component.getByRole('spinbutton', { name: /minimum replicas/i });
    const maxInput = component.getByRole('spinbutton', { name: /maximum replicas/i });

    await expect(minInput).toHaveValue('2');
    await expect(maxInput).toHaveValue('4');
  });

  test('should allow changing min replicas', async ({ mount }) => {
    const component = await mount(<MachinePoolsAutoscalingReplicasMount />);
    const minInput = component.getByRole('spinbutton', { name: /minimum replicas/i });

    await minInput.fill('3');
    await expect(minInput).toHaveValue('3');
  });

  test('should allow changing max replicas', async ({ mount }) => {
    const component = await mount(<MachinePoolsAutoscalingReplicasMount />);
    const maxInput = component.getByRole('spinbutton', { name: /maximum replicas/i });

    await maxInput.fill('10');
    await expect(maxInput).toHaveValue('10');
  });

  test('should constrain min replicas max to current max replicas value', async ({ mount }) => {
    const component = await mount(
      <MachinePoolsAutoscalingReplicasMount defaultValues={{ max_replicas: 5 }} />
    );
    const minInput = component.getByRole('spinbutton', { name: /minimum replicas/i });

    // Min should be constrained to max value of 5
    await expect(minInput).toHaveAttribute('max', '5');
  });

  test('should constrain min replicas max to maxAutoscalingNodes when max_replicas is higher', async ({
    mount,
  }) => {
    const component = await mount(
      <MachinePoolsAutoscalingReplicasMount
        maxAutoscalingNodes={50}
        defaultValues={{ max_replicas: 100 }}
      />
    );
    const minInput = component.getByRole('spinbutton', { name: /minimum replicas/i });

    // Min should be constrained to maxAutoscalingNodes of 50, not max_replicas of 100
    await expect(minInput).toHaveAttribute('max', '50');
  });

  test('should constrain max replicas min to current min replicas value', async ({ mount }) => {
    const component = await mount(
      <MachinePoolsAutoscalingReplicasMount defaultValues={{ min_replicas: 3 }} />
    );
    const maxInput = component.getByRole('spinbutton', { name: /maximum replicas/i });

    // Max should be constrained to min value of 3
    await expect(maxInput).toHaveAttribute('min', '3');
  });

  test('should apply maxAutoscalingNodes constraint', async ({ mount }) => {
    const component = await mount(
      <MachinePoolsAutoscalingReplicasMount maxAutoscalingNodes={20} />
    );
    const maxInput = component.getByRole('spinbutton', { name: /maximum replicas/i });

    await expect(maxInput).toHaveAttribute('max', '20');
  });

  test('should show help text with external link for min replicas', async ({ mount }) => {
    const component = await mount(<MachinePoolsAutoscalingReplicasMount />);
    const learnMoreLink = component.getByRole('link', { name: /learn more/i }).first();
    await expect(learnMoreLink).toBeVisible();
    await expect(learnMoreLink).toHaveAttribute('target', '_blank');
  });

  test('should show help text with external link for max replicas', async ({ mount }) => {
    const component = await mount(<MachinePoolsAutoscalingReplicasMount />);
    const learnMoreLinks = component.getByRole('link', { name: /learn more/i });
    await expect(learnMoreLinks).toHaveCount(2); // One for min, one for max
  });

  test('should accept custom default values', async ({ mount }) => {
    const component = await mount(
      <MachinePoolsAutoscalingReplicasMount defaultValues={{ min_replicas: 5, max_replicas: 15 }} />
    );
    const minInput = component.getByRole('spinbutton', { name: /minimum replicas/i });
    const maxInput = component.getByRole('spinbutton', { name: /maximum replicas/i });

    await expect(minInput).toHaveValue('5');
    await expect(maxInput).toHaveValue('15');
  });

  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<MachinePoolsAutoscalingReplicasMount />);
    await checkAccessibility({ component });
  });
});
