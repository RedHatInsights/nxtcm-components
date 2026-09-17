import { test, expect } from '@/ct-fixture';
import { SubscriptionsProps } from './Subscriptions';

const defaultProps: SubscriptionsProps = {
  subscriptionCount: 3,
  instanceCount: 11,
};

test.describe('Subscriptions', () => {
  test('should render the component with correct counts', async ({ mount }) => {
    const component = await mount(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { ...defaultProps }
    );

    await expect(component.getByText('3')).toBeVisible();
    await expect(component.getByText('11')).toBeVisible();
  });

  test('should display subscription count', async ({ mount }) => {
    const component = await mount(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { ...defaultProps }
    );

    await expect(component.getByText('3')).toBeVisible();
  });

  test('should display instance count', async ({ mount }) => {
    const component = await mount(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { ...defaultProps }
    );

    await expect(component.getByText('11')).toBeVisible();
  });

  test('should display description text', async ({ mount }) => {
    const component = await mount(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { ...defaultProps }
    );

    await expect(
      component.getByText(
        'Monitor your OpenShift usage for both Annual and On-Demand subscriptions.'
      )
    ).toBeVisible();
  });

  test('should display "Subscriptions" label', async ({ mount }) => {
    const component = await mount(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { ...defaultProps }
    );

    await expect(component.getByText('Subscriptions', { exact: true }).last()).toBeVisible();
  });

  test('should display "Instances" label', async ({ mount }) => {
    const component = await mount(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { ...defaultProps }
    );

    await expect(component.getByText('Instances')).toBeVisible();
  });

  test('should render with zero counts', async ({ mount }) => {
    const component = await mount(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { subscriptionCount: 0, instanceCount: 0 }
    );

    await expect(component.getByText('0').first()).toBeVisible();
  });

  test('should render with high counts', async ({ mount }) => {
    const component = await mount(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { subscriptionCount: 150, instanceCount: 999 }
    );

    await expect(component.getByText('150')).toBeVisible();
    await expect(component.getByText('999')).toBeVisible();
  });

  test('should not show View subscriptions button when onViewSubscriptions is not provided', async ({
    mount,
  }) => {
    const component = await mount(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { ...defaultProps }
    );

    await expect(component.getByRole('button', { name: /View subscriptions/i })).not.toBeVisible();
  });

  test('should show View subscriptions button when onViewSubscriptions is provided', async ({
    mount,
  }) => {
    const component = await mount(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { ...defaultProps, onViewSubscriptions: () => {} }
    );

    const viewButton = component.getByRole('button', { name: /View subscriptions/i });
    await expect(viewButton).toBeVisible();
  });

  test('should call onViewSubscriptions when button is clicked', async ({ mount }) => {
    let onViewSubscriptionsCalled = false;
    const handleViewSubscriptions = () => {
      onViewSubscriptionsCalled = true;
    };

    const component = await mount(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { ...defaultProps, onViewSubscriptions: handleViewSubscriptions }
    );

    await component.getByRole('button', { name: /View subscriptions/i }).click();

    await expect.poll(() => onViewSubscriptionsCalled).toBe(true);
  });

  test('should render subscription count as span when onSubscriptionsClick is not provided', async ({
    mount,
    page,
  }) => {
    await mount('nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory', {
      ...defaultProps,
    });

    const subscriptionCount = page.getByText('3').first();
    await expect(subscriptionCount).toBeVisible();

    const tagName = await subscriptionCount.evaluate((el) => el.tagName.toLowerCase());
    await expect.poll(() => tagName).toBe('span');
  });

  test('should render subscription count as button when onSubscriptionsClick is provided', async ({
    mount,
  }) => {
    const component = await mount(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { ...defaultProps, onSubscriptionsClick: () => {} }
    );

    await expect(component.getByRole('button', { name: '3' })).toBeVisible();
  });

  test('should call onSubscriptionsClick when subscription count is clicked', async ({ mount }) => {
    let onSubscriptionsClickCalled = false;
    const handleSubscriptionsClick = () => {
      onSubscriptionsClickCalled = true;
    };

    const component = await mount(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { ...defaultProps, onSubscriptionsClick: handleSubscriptionsClick }
    );

    await component.getByRole('button', { name: '3' }).click();

    await expect.poll(() => onSubscriptionsClickCalled).toBe(true);
  });

  test('should render instance count as span when onInstancesClick is not provided', async ({
    mount,
    page,
  }) => {
    await mount('nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory', {
      ...defaultProps,
    });

    const instanceCount = page.getByText('11').first();
    await expect(instanceCount).toBeVisible();

    const tagName = await instanceCount.evaluate((el) => el.tagName.toLowerCase());
    await expect.poll(() => tagName).toBe('span');
  });

  test('should render instance count as button when onInstancesClick is provided', async ({
    mount,
  }) => {
    const component = await mount(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { ...defaultProps, onInstancesClick: () => {} }
    );

    await expect(component.getByRole('button', { name: '11' })).toBeVisible();
  });

  test('should call onInstancesClick when instance count is clicked', async ({ mount }) => {
    let onInstancesClickCalled = false;
    const handleInstancesClick = () => {
      onInstancesClickCalled = true;
    };

    const component = await mount(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { ...defaultProps, onInstancesClick: handleInstancesClick }
    );

    await component.getByRole('button', { name: '11' }).click();

    await expect.poll(() => onInstancesClickCalled).toBe(true);
  });

  test('should render both counts as clickable when both callbacks are provided', async ({
    mount,
  }) => {
    const component = await mount(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { ...defaultProps, onSubscriptionsClick: () => {}, onInstancesClick: () => {} }
    );

    await expect(component.getByRole('button', { name: '3' })).toBeVisible();
    await expect(component.getByRole('button', { name: '11' })).toBeVisible();
  });

  test('should call correct callback when multiple clickable counts are clicked', async ({
    mount,
  }) => {
    let subscriptionsClicked = false;
    let instancesClicked = false;

    const component = await mount(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      {
        ...defaultProps,
        onSubscriptionsClick: () => {
          subscriptionsClicked = true;
        },
        onInstancesClick: () => {
          instancesClicked = true;
        },
      }
    );

    await component.getByRole('button', { name: '3' }).click();
    await expect.poll(() => subscriptionsClicked).toBe(true);
    await expect.poll(() => instancesClicked).toBe(false);

    await component.getByRole('button', { name: '11' }).click();
    await expect.poll(() => instancesClicked).toBe(true);
  });

  test('should render icons correctly', async ({ mount, page }) => {
    await mount('nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory', {
      ...defaultProps,
    });

    const icons = page.locator('svg');
    expect(await icons.count()).toBeGreaterThan(0);
  });

  test('should handle all callbacks together', async ({ mount }) => {
    let viewSubscriptionsCalled = false;
    let subscriptionsClickCalled = false;
    let instancesClickCalled = false;

    const component = await mount(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      {
        ...defaultProps,
        onViewSubscriptions: () => {
          viewSubscriptionsCalled = true;
        },
        onSubscriptionsClick: () => {
          subscriptionsClickCalled = true;
        },
        onInstancesClick: () => {
          instancesClickCalled = true;
        },
      }
    );

    await component.getByRole('button', { name: '3' }).click();
    await expect.poll(() => subscriptionsClickCalled).toBe(true);

    await component.getByRole('button', { name: '11' }).click();
    await expect.poll(() => instancesClickCalled).toBe(true);

    await component.getByRole('button', { name: /View subscriptions/i }).click();
    await expect.poll(() => viewSubscriptionsCalled).toBe(true);
  });

  test('should render only subscription count as clickable', async ({ mount, page }) => {
    const component = await mount(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { ...defaultProps, onSubscriptionsClick: () => {} }
    );

    await expect(component.getByRole('button', { name: '3' })).toBeVisible();

    const instanceCount = page.getByText('11').first();
    const instTagName = await instanceCount.evaluate((el) => el.tagName.toLowerCase());
    await expect.poll(() => instTagName).toBe('span');
  });

  test('should render only instance count as clickable', async ({ mount, page }) => {
    const component = await mount(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { ...defaultProps, onInstancesClick: () => {} }
    );

    await expect(component.getByRole('button', { name: '11' })).toBeVisible();

    const subscriptionCount = page.getByText('3').first();
    const subTagName = await subscriptionCount.evaluate((el) => el.tagName.toLowerCase());
    await expect.poll(() => subTagName).toBe('span');
  });

  test('should render with single digit counts', async ({ mount }) => {
    const component = await mount(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { subscriptionCount: 1, instanceCount: 2 }
    );

    await expect(component.getByText('1')).toBeVisible();
    await expect(component.getByText('2')).toBeVisible();
  });

  test('should render skeleton when isLoading is true', async ({ mount }) => {
    const component = await mount(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { isLoading: true, ...defaultProps }
    );
    await expect(component.getByText('Loading subscriptions')).toBeVisible();
    await expect(
      component.getByText(
        'Monitor your OpenShift usage for both Annual and On-Demand subscriptions.'
      )
    ).not.toBeVisible();
  });

  test('should render skeleton when isLoading is true without data', async ({ mount }) => {
    const component = await mount(
      'nxtcm-dashboard/Subscriptions/Subscriptions/SubscriptionsStory',
      { isLoading: true }
    );
    await expect(component.getByText('Loading subscriptions')).toBeVisible();
  });
});
