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
    data: { total: 67 },
  },
};

export const WithViewMore: Story = {
  args: {
    data: { total: 67 },
    onViewMore: fn(),
  },
};

export const ZeroClusters: Story = {
  args: {
    data: { total: 0 },
  },
};

export const HighCount: Story = {
  args: {
    data: { total: 1247 },
    onViewMore: fn(),
  },
};
