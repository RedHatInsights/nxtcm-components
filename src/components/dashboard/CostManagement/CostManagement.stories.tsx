import type { Meta, StoryObj } from '@storybook/react';
import { CostManagement } from './CostManagement';

const meta: Meta<typeof CostManagement> = {
  title: 'Components/Dashboard/CostManagement',
  component: CostManagement,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    totalCost: {
      control: 'number',
      description: 'Total month-to-date cost',
    },
    clusters: {
      description: 'Top clusters sorted by cost descending',
    },
    currency: {
      control: 'text',
      description: 'Currency unit string (e.g. "USD", "EUR")',
    },
    onClusterClick: {
      description: 'Callback when a cluster name is clicked',
    },
    onViewMore: {
      description: 'Callback when "View more in Cost Management" link is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CostManagement>;

const sampleClusters = [
  { id: 'prod-east-1', name: 'prod-east-1', cost: 4850 },
  { id: 'prod-west-2', name: 'prod-west-2', cost: 3720 },
  { id: 'staging-central', name: 'staging-central', cost: 2100 },
  { id: 'dev-east-1', name: 'dev-east-1', cost: 1580 },
  { id: 'test-west-1', name: 'test-west-1', cost: 890 },
];

export const Default: Story = {
  args: {
    totalCost: 25001,
    clusters: sampleClusters,
    onViewMore: () => console.log('View more in Cost Management clicked'),
    onClusterClick: (cluster) => console.log('Cluster clicked:', cluster.name),
  },
};

export const TopThree: Story = {
  args: {
    totalCost: 10670,
    clusters: sampleClusters.slice(0, 3),
    onViewMore: () => console.log('View more clicked'),
    onClusterClick: (cluster) => console.log('Cluster clicked:', cluster.name),
  },
};

export const TopTen: Story = {
  args: {
    totalCost: 52300,
    clusters: [
      { id: 'prod-east-1', name: 'prod-east-1', cost: 8200 },
      { id: 'prod-west-2', name: 'prod-west-2', cost: 7150 },
      { id: 'staging-central', name: 'staging-central', cost: 6300 },
      { id: 'prod-eu-west', name: 'prod-eu-west', cost: 5800 },
      { id: 'prod-ap-south', name: 'prod-ap-south', cost: 5400 },
      { id: 'dev-east-1', name: 'dev-east-1', cost: 4900 },
      { id: 'qa-west-1', name: 'qa-west-1', cost: 4200 },
      { id: 'staging-eu', name: 'staging-eu', cost: 3800 },
      { id: 'dev-west-2', name: 'dev-west-2', cost: 3500 },
      { id: 'test-central', name: 'test-central', cost: 3050 },
    ],
    onClusterClick: (cluster) => console.log('Cluster clicked:', cluster.name),
  },
};

export const WithoutLinks: Story = {
  args: {
    totalCost: 25001,
    clusters: sampleClusters,
  },
};

export const NoClusters: Story = {
  args: {
    totalCost: 0,
    clusters: [],
  },
};

export const WithCustomCurrency: Story = {
  args: {
    totalCost: 25001,
    clusters: sampleClusters,
    currency: 'EUR',
    onViewMore: () => console.log('View more clicked'),
  },
};

export const MockupValues: Story = {
  args: {
    totalCost: 3000,
    clusters: [
      { id: 'cluster-a', name: 'some cluster name', cost: 700 },
      { id: 'cluster-b', name: 'another cluster name', cost: 2300 },
    ],
    onViewMore: () => console.log('View more clicked'),
  },
};
