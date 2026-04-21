import type { Meta, StoryObj } from '@storybook/react';
import { AdvisorSeverity, SeverityCounts } from './AdvisorSeverity';

const meta: Meta<typeof AdvisorSeverity> = {
  title: 'Components/Dashboard/AdvisorSeverity',
  component: AdvisorSeverity,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AdvisorSeverity>;

const defaultSeverity: SeverityCounts = {
  critical: 3,
  important: 7,
  moderate: 15,
  low: 2,
};

export const Default: Story = {
  args: {
    severity: defaultSeverity,
    onViewMore: () => {},
  },
};

export const WithoutViewMore: Story = {
  args: {
    severity: { critical: 1, important: 3, moderate: 8, low: 0 },
  },
};

export const AllZeros: Story = {
  args: {
    severity: { critical: 0, important: 0, moderate: 0, low: 0 },
    onViewMore: () => {},
  },
};

export const HighCounts: Story = {
  args: {
    severity: { critical: 42, important: 88, moderate: 230, low: 15 },
    onViewMore: () => {},
  },
};

export const CriticalOnly: Story = {
  args: {
    severity: { critical: 10, important: 0, moderate: 0, low: 0 },
    onViewMore: () => {},
  },
};

export const MockupValues: Story = {
  args: {
    severity: { critical: 0, important: 4, moderate: 5, low: 0 },
    onViewMore: () => {},
  },
};

export const WithoutLightspeedBadge: Story = {
  args: {
    severity: defaultSeverity,
    showLightspeedBadge: false,
    onViewMore: () => {},
  },
};

export const CustomTitle: Story = {
  args: {
    severity: defaultSeverity,
    title: 'Cluster recommendations',
    onViewMore: () => {},
  },
};

export const NoTitle: Story = {
  args: {
    severity: defaultSeverity,
    title: '',
    onViewMore: () => {},
  },
};
