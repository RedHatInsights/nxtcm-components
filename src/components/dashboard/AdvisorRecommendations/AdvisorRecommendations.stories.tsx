import type { Meta, StoryObj } from '@storybook/react';
import { AdvisorRecommendations, AdvisorRecommendationsData } from './AdvisorRecommendations';

const meta: Meta<typeof AdvisorRecommendations> = {
  title: 'Components/Dashboard/AdvisorRecommendations',
  component: AdvisorRecommendations,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AdvisorRecommendations>;

const defaultData: AdvisorRecommendationsData = {
  severity: { critical: 3, important: 7, moderate: 15, low: 2 },
  categories: { serviceAvailability: 25, performance: 8, security: 12, faultTolerance: 4 },
};

export const Default: Story = {
  args: {
    data: defaultData,
    onViewMore: () => {},
  },
};

export const WithoutViewMore: Story = {
  args: {
    data: {
      severity: {
        critical: 1,
        important: 3,
        moderate: 8,
        low: 0,
      },
      categories: {
        serviceAvailability: 10,
        performance: 3,
        security: 5,
        faultTolerance: 2,
      },
    },
  },
};

export const AllZeros: Story = {
  args: {
    data: {
      severity: {
        critical: 0,
        important: 0,
        moderate: 0,
        low: 0,
      },
      categories: {
        serviceAvailability: 0,
        performance: 0,
        security: 0,
        faultTolerance: 0,
      },
    },
    onViewMore: () => {},
  },
};

export const HighCounts: Story = {
  args: {
    data: {
      severity: {
        critical: 42,
        important: 88,
        moderate: 230,
        low: 15,
      },
      categories: {
        serviceAvailability: 120,
        performance: 85,
        security: 95,
        faultTolerance: 75,
      },
    },
    onViewMore: () => {},
  },
};

export const CriticalOnly: Story = {
  args: {
    data: {
      severity: {
        critical: 10,
        important: 0,
        moderate: 0,
        low: 0,
      },
      categories: {
        serviceAvailability: 4,
        performance: 0,
        security: 6,
        faultTolerance: 0,
      },
    },
    onViewMore: () => {},
  },
};

export const MockupValues: Story = {
  args: {
    data: {
      severity: {
        critical: 0,
        important: 4,
        moderate: 5,
        low: 0,
      },
      categories: {
        serviceAvailability: 25,
        performance: 0,
        security: 12,
        faultTolerance: 4,
      },
    },
    onViewMore: () => {},
  },
};

export const WithoutLightspeedBadge: Story = {
  args: {
    data: defaultData,
    showLightspeedBadge: false,
    onViewMore: () => {},
  },
};

export const CustomTitle: Story = {
  args: {
    data: defaultData,
    title: 'Cluster recommendations',
    onViewMore: () => {},
  },
};

export const NoTitle: Story = {
  args: {
    data: defaultData,
    title: '',
    onViewMore: () => {},
  },
};

export const SeverityOnly: Story = {
  args: {
    data: {
      severity: { critical: 3, important: 7, moderate: 15, low: 2 },
    },
    onViewMore: () => {},
  },
};
