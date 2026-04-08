import type { Meta, StoryObj } from '@storybook/react';
import { UpdateStatus } from './UpdateStatus';

const meta: Meta<typeof UpdateStatus> = {
  title: 'Components/Dashboard/UpdateStatus',
  component: UpdateStatus,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UpdateStatus>;

export const Default: Story = {
  args: {
    data: {
      upToDate: 118,
      updateAvailable: 32,
    },
  },
};

export const WithCurrentlyUpdating: Story = {
  args: {
    data: {
      upToDate: 105,
      updateAvailable: 27,
      currentlyUpdating: 18,
    },
  },
};

export const AllUpToDate: Story = {
  args: {
    data: {
      upToDate: 150,
      updateAvailable: 0,
    },
  },
};

export const AllNeedUpdate: Story = {
  args: {
    data: {
      upToDate: 0,
      updateAvailable: 45,
    },
  },
};

export const HighCounts: Story = {
  args: {
    data: {
      upToDate: 3842,
      updateAvailable: 957,
      currentlyUpdating: 201,
    },
  },
};

export const ZeroClusters: Story = {
  args: {
    data: {
      upToDate: 0,
      updateAvailable: 0,
    },
  },
};
