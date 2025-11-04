import type { Meta, StoryObj } from '@storybook/react';
import { ClusterRecommendations } from './ClusterRecommendations';

const meta: Meta<typeof ClusterRecommendations> = {
  title: 'Components/Dashboard/ClusterRecommendations',
  component: ClusterRecommendations,
  tags: ['autodocs'],
  argTypes: {
    count: {
      control: { type: 'number', min: 0 },
      description: 'Number of critical cluster recommendations',
    },
    onViewRecommendations: {
      action: 'view recommendations clicked',
      description: 'Callback when View recommendations button is clicked',
    },
    serviceAvailability: {
      control: { type: 'number', min: 0 },
      description: 'Number of service availability recommendations',
    },
    performance: {
      control: { type: 'number', min: 0 },
      description: 'Number of performance recommendations',
    },
    security: {
      control: { type: 'number', min: 0 },
      description: 'Number of security recommendations',
    },
    faultTolerance: {
      control: { type: 'number', min: 0 },
      description: 'Number of fault tolerance recommendations',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    count: 5,
    serviceAvailability: 2,
    performance: 3,
    security: 1,
    faultTolerance: 2,
  },
};

export const NoRecommendations: Story = {
  args: {
    count: 0,
    serviceAvailability: 0,
    performance: 0,
    security: 0,
    faultTolerance: 0,
  },
};

export const SingleRecommendation: Story = {
  args: {
    count: 1,
    serviceAvailability: 1,
    performance: 0,
    security: 0,
    faultTolerance: 0,
  },
};

export const ManyRecommendations: Story = {
  args: {
    count: 42,
    serviceAvailability: 10,
    performance: 15,
    security: 12,
    faultTolerance: 8,
  },
};

export const HighCount: Story = {
  args: {
    count: 999,
    serviceAvailability: 250,
    performance: 300,
    security: 200,
    faultTolerance: 150,
  },
};
