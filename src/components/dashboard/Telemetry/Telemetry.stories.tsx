import type { Meta, StoryObj } from '@storybook/react';
import { Telemetry } from './Telemetry';

const meta: Meta<typeof Telemetry> = {
  title: 'Components/Dashboard/Telemetry',
  component: Telemetry,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Telemetry>;

export const Default: Story = {
  args: {
    data: {
      connected: 142,
      disconnected: 8,
    },
  },
};

export const AllConnected: Story = {
  args: {
    data: {
      connected: 150,
      disconnected: 0,
    },
  },
};

export const AllDisconnected: Story = {
  args: {
    data: {
      connected: 0,
      disconnected: 23,
    },
  },
};

export const HighCounts: Story = {
  args: {
    data: {
      connected: 4821,
      disconnected: 379,
    },
  },
};

export const SingleCluster: Story = {
  args: {
    data: {
      connected: 1,
      disconnected: 0,
    },
  },
};

export const ZeroClusters: Story = {
  args: {
    data: {
      connected: 0,
      disconnected: 0,
    },
  },
};
