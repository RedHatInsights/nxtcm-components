import type { Meta, StoryObj } from '@storybook/react';
import { ResourceUtilization } from './ResourceUtilization';

const meta: Meta<typeof ResourceUtilization> = {
  title: 'Components/Dashboard/ResourceUtilization',
  component: ResourceUtilization,
};

export default meta;
type Story = StoryObj<typeof ResourceUtilization>;

export const Default: Story = {
  args: {
    data: {
      vCPU: { used: 32, total: 128, unit: 'Cores' },
      memory: { used: 48, total: 256, unit: 'GiB' },
    },
    onViewMore: () => alert('View more clicked'),
  },
};

export const WithStorage: Story = {
  args: {
    data: {
      vCPU: { used: 32, total: 128, unit: 'Cores' },
      memory: { used: 48, total: 256, unit: 'GiB' },
      storage: { used: 500, total: 2048, unit: 'GiB' },
    },
    onViewMore: () => alert('View more clicked'),
  },
};

export const WithoutViewMore: Story = {
  args: {
    data: {
      vCPU: { used: 64, total: 128, unit: 'Cores' },
      memory: { used: 200, total: 256, unit: 'GiB' },
    },
  },
};

export const HighUtilization: Story = {
  args: {
    data: {
      vCPU: { used: 120, total: 128, unit: 'Cores' },
      memory: { used: 240, total: 256, unit: 'GiB' },
    },
    onViewMore: () => alert('View more clicked'),
  },
};

export const LowUtilization: Story = {
  args: {
    data: {
      vCPU: { used: 2, total: 128, unit: 'Cores' },
      memory: { used: 4, total: 256, unit: 'GiB' },
    },
    onViewMore: () => alert('View more clicked'),
  },
};

export const ZeroUsage: Story = {
  args: {
    data: {
      vCPU: { used: 0, total: 128, unit: 'Cores' },
      memory: { used: 0, total: 256, unit: 'GiB' },
    },
  },
};

export const MockupValues: Story = {
  args: {
    data: {
      vCPU: { used: 32, total: 128, unit: 'Cores' },
      memory: { used: 64, total: 256, unit: 'GiB' },
    },
    onViewMore: () => alert('View more clicked'),
  },
};
