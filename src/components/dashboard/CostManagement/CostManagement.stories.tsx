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
    costData: {
      description: 'Cost data for different cluster types',
    },
    currency: {
      control: 'text',
      description: 'Currency symbol to display',
      defaultValue: '$',
    },
    onViewMore: {
      description: 'Callback when "View more cost information" link is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CostManagement>;

export const Default: Story = {
  args: {
    costData: {
      rosaClusters: 12500.75,
      osdClusters: 8300.5,
      aroClusters: 4200.25,
    },
    onViewMore: () => console.log('View more cost information clicked'),
  },
};

export const HighCosts: Story = {
  args: {
    costData: {
      rosaClusters: 45000.0,
      osdClusters: 32000.0,
      aroClusters: 28000.0,
    },
  },
};

export const LowCosts: Story = {
  args: {
    costData: {
      rosaClusters: 1500.0,
      osdClusters: 800.0,
      aroClusters: 600.0,
    },
  },
};

export const RosaHeavy: Story = {
  args: {
    costData: {
      rosaClusters: 35000.0,
      osdClusters: 2000.0,
      aroClusters: 1500.0,
    },
  },
};

export const EvenDistribution: Story = {
  args: {
    costData: {
      rosaClusters: 10000.0,
      osdClusters: 10000.0,
      aroClusters: 10000.0,
    },
  },
};

export const WithCustomCurrency: Story = {
  args: {
    costData: {
      rosaClusters: 12500.75,
      osdClusters: 8300.5,
      aroClusters: 4200.25,
    },
    currency: '€',
  },
};

export const ZeroCosts: Story = {
  args: {
    costData: {
      rosaClusters: 0,
      osdClusters: 0,
      aroClusters: 0,
    },
  },
};

export const SingleClusterType: Story = {
  args: {
    costData: {
      rosaClusters: 15000.0,
      osdClusters: 0,
      aroClusters: 0,
    },
    onViewMore: () => console.log('View more cost information clicked'),
  },
};

export const WithoutLink: Story = {
  args: {
    costData: {
      rosaClusters: 12500.75,
      osdClusters: 8300.5,
      aroClusters: 4200.25,
    },
  },
};
