import { test, expect } from '@/ct-fixture';
import React from 'react';
import { Subscriptions, SubscriptionsProps } from './Subscriptions';

const defaultProps: SubscriptionsProps = {
  subscriptionCount: 3,
  instanceCount: 11,
};

test.describe('Subscriptions', () => {
  test('should display subscription and instance summaries', async ({ mount }) => {
    const component = await mount(<Subscriptions {...defaultProps} />);

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
    const component = await mount(<Subscriptions subscriptionCount={0} instanceCount={0} />);

    await expect(component.getByText('0').first()).toBeVisible();
  });

  test('should render with high counts', async ({ mount }) => {
    const component = await mount(<Subscriptions subscriptionCount={150} instanceCount={999} />);

    await expect(component.getByText('150')).toBeVisible();
    await expect(component.getByText('999')).toBeVisible();
  });

  test('should not show View subscriptions button when onViewSubscriptions is not provided', async ({
    mount,
  }) => {
    const component = await mount(<Subscriptions {...defaultProps} />);

    await expect(component.getByRole('button', { name: /View subscriptions/i })).not.toBeVisible();
  });

  test('should call onViewSubscriptions when button is clicked', async ({ mount }) => {
    let onViewSubscriptionsCalled = false;
    const handleViewSubscriptions = () => {
      onViewSubscriptionsCalled = true;
    };

    const component = await mount(
      <Subscriptions {...defaultProps} onViewSubscriptions={handleViewSubscriptions} />
    );

    await component.getByRole('button', { name: /View subscriptions/i }).click();

    expect(onViewSubscriptionsCalled).toBe(true);
  });

  test('should display 3 without a count action when its callback is omitted', async ({
    mount,
  }) => {
    const component = await mount(<Subscriptions {...defaultProps} />);
    await expect(component.getByText('3', { exact: true })).toBeVisible();
    await expect(component.getByRole('button', { name: '3', exact: true })).toHaveCount(0);
  });

  test('should call onSubscriptionsClick when subscription count is clicked', async ({ mount }) => {
    let onSubscriptionsClickCalled = false;
    const handleSubscriptionsClick = () => {
      onSubscriptionsClickCalled = true;
    };

    const component = await mount(
      <Subscriptions {...defaultProps} onSubscriptionsClick={handleSubscriptionsClick} />
    );

    await component.getByRole('button', { name: '3' }).click();

    expect(onSubscriptionsClickCalled).toBe(true);
  });

  test('should display 11 without a count action when its callback is omitted', async ({
    mount,
  }) => {
    const component = await mount(<Subscriptions {...defaultProps} />);
    await expect(component.getByText('11', { exact: true })).toBeVisible();
    await expect(component.getByRole('button', { name: '11', exact: true })).toHaveCount(0);
  });

  test('should call onInstancesClick when instance count is clicked', async ({ mount }) => {
    let onInstancesClickCalled = false;
    const handleInstancesClick = () => {
      onInstancesClickCalled = true;
    };

    const component = await mount(
      <Subscriptions {...defaultProps} onInstancesClick={handleInstancesClick} />
    );

    await component.getByRole('button', { name: '11' }).click();

    expect(onInstancesClickCalled).toBe(true);
  });

  test('should call correct callback when multiple clickable counts are clicked', async ({
    mount,
  }) => {
    let subscriptionsClicked = false;
    let instancesClicked = false;

    const component = await mount(
      <Subscriptions
        {...defaultProps}
        onSubscriptionsClick={() => {
          subscriptionsClicked = true;
        }}
        onInstancesClick={() => {
          instancesClicked = true;
        }}
      />
    );

    await component.getByRole('button', { name: '3' }).click();
    expect(subscriptionsClicked).toBe(true);
    expect(instancesClicked).toBe(false);

    await component.getByRole('button', { name: '11' }).click();
    expect(instancesClicked).toBe(true);
  });

  test('should handle all callbacks together', async ({ mount }) => {
    let viewSubscriptionsCalled = false;
    let subscriptionsClickCalled = false;
    let instancesClickCalled = false;

    const component = await mount(
      <Subscriptions
        {...defaultProps}
        onViewSubscriptions={() => {
          viewSubscriptionsCalled = true;
        }}
        onSubscriptionsClick={() => {
          subscriptionsClickCalled = true;
        }}
        onInstancesClick={() => {
          instancesClickCalled = true;
        }}
      />
    );

    await component.getByRole('button', { name: '3' }).click();
    expect(subscriptionsClickCalled).toBe(true);

    await component.getByRole('button', { name: '11' }).click();
    expect(instancesClickCalled).toBe(true);

    await component.getByRole('button', { name: /View subscriptions/i }).click();
    expect(viewSubscriptionsCalled).toBe(true);
  });

  test('should render only subscription count as clickable', async ({ mount }) => {
    const component = await mount(
      <Subscriptions {...defaultProps} onSubscriptionsClick={() => {}} />
    );

    await expect(component.getByRole('button', { name: '3' })).toBeVisible();

    await expect(component.getByText('11', { exact: true })).toBeVisible();
    await expect(component.getByRole('button', { name: '11', exact: true })).toHaveCount(0);
  });

  test('should render only instance count as clickable', async ({ mount }) => {
    const component = await mount(<Subscriptions {...defaultProps} onInstancesClick={() => {}} />);

    await expect(component.getByRole('button', { name: '11' })).toBeVisible();

    await expect(component.getByText('3', { exact: true })).toBeVisible();
    await expect(component.getByRole('button', { name: '3', exact: true })).toHaveCount(0);
  });

  test('should render with single digit counts', async ({ mount }) => {
    const component = await mount(<Subscriptions subscriptionCount={1} instanceCount={2} />);

    await expect(component.getByText('1')).toBeVisible();
    await expect(component.getByText('2')).toBeVisible();
  });

  test('should render skeleton when isLoading is true', async ({ mount }) => {
    const component = await mount(<Subscriptions isLoading {...defaultProps} />);
    await expect(component.getByText('Loading subscriptions')).toBeVisible();
    await expect(
      component.getByText(
        'Monitor your OpenShift usage for both Annual and On-Demand subscriptions.'
      )
    ).not.toBeVisible();
  });

  test('should render skeleton when isLoading is true without data', async ({ mount }) => {
    const component = await mount(<Subscriptions isLoading />);
    await expect(component.getByText('Loading subscriptions')).toBeVisible();
  });
});
