import type { Meta, StoryObj } from '@storybook/react';
import { ClusterProviders } from './ClusterProviders';

const meta: Meta<typeof ClusterProviders> = {
  title: 'Components/Dashboard/ClusterProviders',
  component: ClusterProviders,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ClusterProviders>;

export const Default: Story = {
  args: {
    providers: [
      { label: 'ROSA', count: 42 },
      { label: 'ARO', count: 15 },
      { label: 'OSD', count: 10 },
    ],
  },
};

export const SingleProvider: Story = {
  args: {
    providers: [{ label: 'ROSA', count: 25 }],
  },
};

export const FourProviders: Story = {
  args: {
    providers: [
      { label: 'ROSA', count: 800 },
      { label: 'ARO', count: 300 },
      { label: 'OSD', count: 100 },
      { label: 'Other', count: 47 },
    ],
  },
};

export const AllZeros: Story = {
  args: {
    providers: [
      { label: 'ROSA', count: 0 },
      { label: 'ARO', count: 0 },
      { label: 'OSD', count: 0 },
    ],
  },
};

export const CustomTitle: Story = {
  args: {
    providers: [
      { label: 'ROSA', count: 42 },
      { label: 'ARO', count: 15 },
    ],
    title: 'Provider breakdown',
  },
};
