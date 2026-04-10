import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { ClustersWithIssues } from './ClustersWithIssues';

const meta: Meta<typeof ClustersWithIssues> = {
  title: 'Components/Dashboard/ClustersWithIssues',
  component: ClustersWithIssues,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ClustersWithIssues>;

const sampleClusters = [
  { id: 'c1', name: 'cluster1', issues: 1 },
  { id: 'c2', name: 'cluster2', issues: 12 },
  { id: 'c3', name: 'cluster3', issues: 7 },
  { id: 'c4', name: 'cluster4', issues: 5 },
];

export const Default: Story = {
  args: {
    data: {
      totalUnhealthy: 4,
      clusters: sampleClusters,
    },
  },
};

export const WithClusterClick: Story = {
  args: {
    data: {
      totalUnhealthy: 4,
      clusters: sampleClusters,
    },
    onClusterClick: fn(),
  },
};

export const WithRowActions: Story = {
  args: {
    data: {
      totalUnhealthy: 4,
      clusters: sampleClusters,
    },
    onClusterClick: fn(),
    rowActions: () => [{ title: 'Open console', onClick: fn() }],
  },
};

export const NoClusters: Story = {
  args: {
    data: {
      totalUnhealthy: 0,
      clusters: [],
    },
  },
};

export const SingleCluster: Story = {
  args: {
    data: {
      totalUnhealthy: 1,
      clusters: [{ id: 'c1', name: 'prod-east-1', issues: 3 }],
    },
    onClusterClick: fn(),
    rowActions: () => [{ title: 'Open console', onClick: fn() }],
  },
};

export const HighIssueCounts: Story = {
  args: {
    data: {
      totalUnhealthy: 50,
      clusters: [
        { id: 'c1', name: 'staging-us-east', issues: 42 },
        { id: 'c2', name: 'prod-eu-west', issues: 31 },
        { id: 'c3', name: 'dev-ap-south', issues: 18 },
        { id: 'c4', name: 'test-us-central', issues: 9 },
        { id: 'c5', name: 'perf-eu-north', issues: 5 },
      ],
    },
    onClusterClick: fn(),
  },
};
