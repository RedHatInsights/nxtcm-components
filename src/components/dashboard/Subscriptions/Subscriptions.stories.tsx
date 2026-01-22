import type { Meta, StoryObj } from '@storybook/react';
import { Subscriptions } from './Subscriptions';

const meta: Meta<typeof Subscriptions> = {
  title: 'Components/Dashboard/Subscriptions',
  component: Subscriptions,
  tags: ['autodocs'],
  argTypes: {
    onViewSubscriptions: { action: 'view subscriptions clicked' },
    onSubscriptionsClick: { action: 'subscriptions count clicked' },
    onInstancesClick: { action: 'instances count clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    subscriptionCount: 3,
    instanceCount: 11,
  },
};

export const WithViewLink: Story = {
  args: {
    subscriptionCount: 3,
    instanceCount: 11,
    onViewSubscriptions: () => console.log('View subscriptions clicked'),
  },
};

export const HighCounts: Story = {
  args: {
    subscriptionCount: 25,
    instanceCount: 150,
    onViewSubscriptions: () => console.log('View subscriptions clicked'),
  },
};

export const LowCounts: Story = {
  args: {
    subscriptionCount: 1,
    instanceCount: 2,
    onViewSubscriptions: () => console.log('View subscriptions clicked'),
  },
};

export const ZeroCounts: Story = {
  args: {
    subscriptionCount: 0,
    instanceCount: 0,
    onViewSubscriptions: () => console.log('View subscriptions clicked'),
  },
};

export const WithClickableCounts: Story = {
  args: {
    subscriptionCount: 3,
    instanceCount: 11,
    onViewSubscriptions: () => console.log('View subscriptions clicked'),
    onSubscriptionsClick: () => console.log('Subscriptions count clicked'),
    onInstancesClick: () => console.log('Instances count clicked'),
  },
};

export const OnlySubscriptionsClickable: Story = {
  args: {
    subscriptionCount: 5,
    instanceCount: 20,
    onSubscriptionsClick: () => console.log('Subscriptions count clicked'),
  },
};

export const OnlyInstancesClickable: Story = {
  args: {
    subscriptionCount: 5,
    instanceCount: 20,
    onInstancesClick: () => console.log('Instances count clicked'),
  },
};
