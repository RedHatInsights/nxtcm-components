import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { ClustersWithIssues, ClusterIssue } from './ClustersWithIssues';

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

const sampleClusters: ClusterIssue[] = [
  { id: 'c1', name: 'cluster1', issues: 1, consoleUrl: 'https://console.example.com/c1' },
  { id: 'c2', name: 'cluster2', issues: 12, consoleUrl: 'https://console.example.com/c2' },
  { id: 'c3', name: 'cluster3', issues: 7, consoleUrl: 'https://console.example.com/c3' },
  { id: 'c4', name: 'cluster4', issues: 5, consoleUrl: 'https://console.example.com/c4' },
];

function generateClusters(count: number): ClusterIssue[] {
  const regions = ['us-east', 'us-west', 'eu-west', 'eu-central', 'ap-south', 'ap-northeast'];
  const envs = ['prod', 'staging', 'dev', 'test', 'perf'];
  return Array.from({ length: count }, (_, i) => ({
    id: `c${i + 1}`,
    name: `${envs[i % envs.length]}-${regions[i % regions.length]}-${i + 1}`,
    issues: Math.max(1, Math.floor(50 / (i + 1))),
    consoleUrl: `https://console.example.com/c${i + 1}`,
  }));
}

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

export const WithOpenConsole: Story = {
  args: {
    data: {
      totalUnhealthy: 4,
      clusters: sampleClusters,
    },
    onClusterClick: fn(),
    onOpenConsole: fn(),
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
      clusters: [
        { id: 'c1', name: 'prod-east-1', issues: 3, consoleUrl: 'https://console.example.com/c1' },
      ],
    },
    onClusterClick: fn(),
    onOpenConsole: fn(),
  },
};

export const ManyClustersPaginated: Story = {
  args: {
    data: {
      totalUnhealthy: 442,
      clusters: generateClusters(30),
    },
    onClusterClick: fn(),
    onOpenConsole: fn(),
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

export const CustomTooltip: Story = {
  args: {
    data: {
      totalUnhealthy: 4,
      clusters: sampleClusters,
    },
    titleTooltip: 'Custom tooltip explaining issues criteria.',
    onOpenConsole: fn(),
  },
};

export const NoTooltip: Story = {
  args: {
    data: {
      totalUnhealthy: 4,
      clusters: sampleClusters,
    },
    titleTooltip: '',
  },
};
