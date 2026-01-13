import type { Meta, StoryObj } from '@storybook/react';
import { Subscriptions } from './Subscriptions';

const meta: Meta<typeof Subscriptions> = {
  title: 'Components/Dashboard/Subscriptions',
  component: Subscriptions,
  tags: ['autodocs'],
  argTypes: {
    onViewSubscriptions: { action: 'view subscriptions clicked' },
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
