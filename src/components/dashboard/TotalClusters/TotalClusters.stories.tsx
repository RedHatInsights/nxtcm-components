import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { TotalClusters } from './TotalClusters';

const meta: Meta<typeof TotalClusters> = {
  title: 'Components/Dashboard/TotalClusters',
  component: TotalClusters,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TotalClusters>;

export const Default: Story = {
  args: {
    data: {
      total: 67,
      breakdown: [
        { label: 'ROSA', count: 42 },
        { label: 'ARO', count: 15 },
        { label: 'OSD', count: 10 },
      ],
    },
  },
};

export const WithViewMore: Story = {
  args: {
    data: {
      total: 67,
      breakdown: [
        { label: 'ROSA', count: 42 },
        { label: 'ARO', count: 15 },
        { label: 'OSD', count: 10 },
      ],
    },
    onViewMore: fn(),
  },
};

export const TotalOnly: Story = {
  args: {
    data: {
      total: 120,
    },
  },
};

export const SingleClusterType: Story = {
  args: {
    data: {
      total: 25,
      breakdown: [{ label: 'ROSA', count: 25 }],
    },
  },
};

export const ZeroClusters: Story = {
  args: {
    data: {
      total: 0,
      breakdown: [
        { label: 'ROSA', count: 0 },
        { label: 'ARO', count: 0 },
        { label: 'OSD', count: 0 },
      ],
    },
  },
};

export const HighCount: Story = {
  args: {
    data: {
      total: 1247,
      breakdown: [
        { label: 'ROSA', count: 800 },
        { label: 'ARO', count: 300 },
        { label: 'OSD', count: 100 },
        { label: 'Other', count: 47 },
      ],
    },
    onViewMore: fn(),
  },
};

export const EmptyBreakdown: Story = {
  args: {
    data: {
      total: 50,
      breakdown: [],
    },
  },
};
