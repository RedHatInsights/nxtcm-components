import type { Meta, StoryObj } from '@storybook/react-vite';

import { Dashboard } from './Dashboard';
import { dashboardStoryProps } from './Dashboard.story-data';

const meta: Meta<typeof Dashboard> = {
  title: 'Components/Dashboard/Dashboard',
  component: Dashboard,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Dashboard {...dashboardStoryProps} />,
};
