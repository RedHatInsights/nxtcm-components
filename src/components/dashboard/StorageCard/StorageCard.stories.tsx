import type { Meta, StoryObj } from '@storybook/react';
import { StorageCard } from './StorageCard';

const meta: Meta<typeof StorageCard> = {
  title: 'Dashboard/StorageCard',
  component: StorageCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    // default to undefined - stories must explicitly provide onViewMore callback
    onViewMore: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof StorageCard>;

// real data from the screenshot
export const Default: Story = {
  args: {
    storageData: {
      rosaClusters: 63.02,
      aroClusters: 2.17,
      osdClusters: 2.17,
      available: 21.89,
    },
  },
};

export const WithViewMore: Story = {
  args: {
    storageData: {
      rosaClusters: 63.02,
      aroClusters: 2.17,
      osdClusters: 2.17,
      available: 21.89,
    },
    onViewMore: () => alert('View more clicked!'),
  },
};

export const HighUsage: Story = {
  args: {
    storageData: {
      rosaClusters: 80.5,
      aroClusters: 10.2,
      osdClusters: 5.3,
      available: 4.0,
    },
  },
};

export const LowUsage: Story = {
  args: {
    storageData: {
      rosaClusters: 10.5,
      aroClusters: 5.2,
      osdClusters: 3.3,
      available: 81.0,
    },
  },
};

export const EvenDistribution: Story = {
  args: {
    storageData: {
      rosaClusters: 25.0,
      aroClusters: 25.0,
      osdClusters: 25.0,
      available: 25.0,
    },
  },
};

export const RosaHeavy: Story = {
  args: {
    storageData: {
      rosaClusters: 70.0,
      aroClusters: 5.0,
      osdClusters: 5.0,
      available: 20.0,
    },
  },
};
