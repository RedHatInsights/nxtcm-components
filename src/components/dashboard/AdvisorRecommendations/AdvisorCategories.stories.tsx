import type { Meta, StoryObj } from '@storybook/react';
import { AdvisorCategories, CategoryCounts } from './AdvisorCategories';

const meta: Meta<typeof AdvisorCategories> = {
  title: 'Components/Dashboard/AdvisorCategories',
  component: AdvisorCategories,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AdvisorCategories>;

const defaultCategories: CategoryCounts = {
  serviceAvailability: 25,
  performance: 8,
  security: 12,
  faultTolerance: 4,
};

export const Default: Story = {
  args: {
    categories: defaultCategories,
  },
};

export const AllZeros: Story = {
  args: {
    categories: { serviceAvailability: 0, performance: 0, security: 0, faultTolerance: 0 },
  },
};

export const HighCounts: Story = {
  args: {
    categories: {
      serviceAvailability: 120,
      performance: 85,
      security: 95,
      faultTolerance: 75,
    },
  },
};

export const SingleCategory: Story = {
  args: {
    categories: { serviceAvailability: 4, performance: 0, security: 6, faultTolerance: 0 },
  },
};

export const CustomTitle: Story = {
  args: {
    categories: defaultCategories,
    title: 'Issue categories',
  },
};

export const MockupValues: Story = {
  args: {
    categories: { serviceAvailability: 25, performance: 0, security: 12, faultTolerance: 4 },
  },
};
