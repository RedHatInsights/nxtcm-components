import { expect, test } from '@/playwright/ct-fixture';

import type { SubscriptionsStory } from './Subscriptions.story';

const defaultProps: NonNullable<React.ComponentProps<typeof SubscriptionsStory>> = {
  subscriptionCount: 3,
  instanceCount: 11,
};

test.describe('Subscriptions', () => {
  test('should display subscription and instance summaries', async ({ mount }) => {
    const component = await mount<typeof SubscriptionsStory>(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { ...defaultProps }
    );

    await expect(component.getByText('3')).toBeVisible();
    await expect(component.getByText('11')).toBeVisible();
    await expect(
      component.getByText(
        'Monitor your OpenShift usage for both Annual and On-Demand subscriptions.'
      )
    ).toBeVisible();
    await expect(component.getByText('Subscriptions', { exact: true }).last()).toBeVisible();
    await expect(component.getByText('Instances')).toBeVisible();
  });

  test('should render with zero counts', async ({ mount }) => {
    const component = await mount<typeof SubscriptionsStory>(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { subscriptionCount: 0, instanceCount: 0 }
    );

    await expect(component.getByText('0').first()).toBeVisible();
  });

  test('should render with high counts', async ({ mount }) => {
    const component = await mount<typeof SubscriptionsStory>(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { subscriptionCount: 150, instanceCount: 999 }
    );

    await expect(component.getByText('150')).toBeVisible();
    await expect(component.getByText('999')).toBeVisible();
  });

  test('should not show View subscriptions button when onViewSubscriptions is not provided', async ({
    mount,
  }) => {
    const component = await mount<typeof SubscriptionsStory>(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { ...defaultProps }
    );

    await expect(component.getByRole('button', { name: /View subscriptions/i })).toBeHidden();
  });

  test('should call onViewSubscriptions when button is clicked', async ({ mount }) => {
    const component = await mount<typeof SubscriptionsStory>(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      {
        ...defaultProps,
        onViewSubscriptions: true,
      }
    );

    await component.getByRole('button', { name: /View subscriptions/i }).click();

    await expect
      .poll(() =>
        component
          .getByTestId('onViewSubscriptions-calls')
          .evaluate((input: HTMLInputElement) => JSON.parse(input.value) as unknown[][])
      )
      .toHaveLength(1);
  });

  test('should display 3 without a count action when its callback is omitted', async ({
    mount,
  }) => {
    const component = await mount<typeof SubscriptionsStory>(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { ...defaultProps }
    );
    await expect(component.getByText('3', { exact: true })).toBeVisible();
    await expect(component.getByRole('button', { name: '3', exact: true })).toHaveCount(0);
  });

  test('should call onSubscriptionsClick when subscription count is clicked', async ({ mount }) => {
    const component = await mount<typeof SubscriptionsStory>(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      {
        ...defaultProps,
        onSubscriptionsClick: true,
      }
    );

    await component.getByRole('button', { name: '3' }).click();

    await expect
      .poll(() =>
        component
          .getByTestId('onSubscriptionsClick-calls')
          .evaluate((input: HTMLInputElement) => JSON.parse(input.value) as unknown[][])
      )
      .toHaveLength(1);
  });

  test('should display 11 without a count action when its callback is omitted', async ({
    mount,
  }) => {
    const component = await mount<typeof SubscriptionsStory>(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { ...defaultProps }
    );
    await expect(component.getByText('11', { exact: true })).toBeVisible();
    await expect(component.getByRole('button', { name: '11', exact: true })).toHaveCount(0);
  });

  test('should call onInstancesClick when instance count is clicked', async ({ mount }) => {
    const component = await mount<typeof SubscriptionsStory>(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      {
        ...defaultProps,
        onInstancesClick: true,
      }
    );

    await component.getByRole('button', { name: '11' }).click();

    await expect
      .poll(() =>
        component
          .getByTestId('onInstancesClick-calls')
          .evaluate((input: HTMLInputElement) => JSON.parse(input.value) as unknown[][])
      )
      .toHaveLength(1);
  });

  test('should call correct callback when multiple clickable counts are clicked', async ({
    mount,
  }) => {
    const component = await mount<typeof SubscriptionsStory>(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      {
        ...defaultProps,
        onSubscriptionsClick: true,
        onInstancesClick: true,
      }
    );

    await component.getByRole('button', { name: '3' }).click();
    await expect
      .poll(() =>
        component
          .getByTestId('onSubscriptionsClick-calls')
          .evaluate((input: HTMLInputElement) => JSON.parse(input.value) as unknown[][])
      )
      .toHaveLength(1);
    await expect
      .poll(() =>
        component
          .getByTestId('onInstancesClick-calls')
          .evaluate((input: HTMLInputElement) => JSON.parse(input.value) as unknown[][])
      )
      .toHaveLength(0);

    await component.getByRole('button', { name: '11' }).click();
    await expect
      .poll(() =>
        component
          .getByTestId('onInstancesClick-calls')
          .evaluate((input: HTMLInputElement) => JSON.parse(input.value) as unknown[][])
      )
      .toHaveLength(1);
  });

  test('should handle all callbacks together', async ({ mount }) => {
    const component = await mount<typeof SubscriptionsStory>(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      {
        ...defaultProps,
        onViewSubscriptions: true,
        onSubscriptionsClick: true,
        onInstancesClick: true,
      }
    );

    await component.getByRole('button', { name: '3' }).click();
    await expect
      .poll(() =>
        component
          .getByTestId('onSubscriptionsClick-calls')
          .evaluate((input: HTMLInputElement) => JSON.parse(input.value) as unknown[][])
      )
      .toHaveLength(1);

    await component.getByRole('button', { name: '11' }).click();
    await expect
      .poll(() =>
        component
          .getByTestId('onInstancesClick-calls')
          .evaluate((input: HTMLInputElement) => JSON.parse(input.value) as unknown[][])
      )
      .toHaveLength(1);

    await component.getByRole('button', { name: /View subscriptions/i }).click();
    await expect
      .poll(() =>
        component
          .getByTestId('onViewSubscriptions-calls')
          .evaluate((input: HTMLInputElement) => JSON.parse(input.value) as unknown[][])
      )
      .toHaveLength(1);
  });

  test('should render only subscription count as clickable', async ({ mount }) => {
    const component = await mount<typeof SubscriptionsStory>(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      {
        ...defaultProps,
        onSubscriptionsClick: true,
      }
    );

    await expect(component.getByRole('button', { name: '3' })).toBeVisible();

    await expect(component.getByText('11', { exact: true })).toBeVisible();
    await expect(component.getByRole('button', { name: '11', exact: true })).toHaveCount(0);
  });

  test('should render only instance count as clickable', async ({ mount }) => {
    const component = await mount<typeof SubscriptionsStory>(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      {
        ...defaultProps,
        onInstancesClick: true,
      }
    );

    await expect(component.getByRole('button', { name: '11' })).toBeVisible();

    await expect(component.getByText('3', { exact: true })).toBeVisible();
    await expect(component.getByRole('button', { name: '3', exact: true })).toHaveCount(0);
  });

  test('should render with single digit counts', async ({ mount }) => {
    const component = await mount<typeof SubscriptionsStory>(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { subscriptionCount: 1, instanceCount: 2 }
    );

    await expect(component.getByText('1')).toBeVisible();
    await expect(component.getByText('2')).toBeVisible();
  });

  test('should render skeleton when isLoading is true', async ({ mount }) => {
    const component = await mount<typeof SubscriptionsStory>(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { isLoading: true, ...defaultProps }
    );
    await expect(component.getByText('Loading subscriptions')).toBeVisible();
    await expect(
      component.getByText(
        'Monitor your OpenShift usage for both Annual and On-Demand subscriptions.'
      )
    ).toBeHidden();
  });

  test('should render skeleton when isLoading is true without data', async ({ mount }) => {
    const component = await mount<typeof SubscriptionsStory>(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { isLoading: true }
    );
    await expect(component.getByText('Loading subscriptions')).toBeVisible();
  });
});
