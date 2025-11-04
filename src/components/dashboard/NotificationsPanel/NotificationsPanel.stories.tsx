import type { Meta, StoryObj } from '@storybook/react';
import { NotificationsPanel, NotificationItem } from './NotificationsPanel';

const mockNotifications: NotificationItem[] = [
  {
    id: 1,
    title: 'New CVE: CVE-2023-0091',
    type: 'Security',
    time: 'Nov. 28 12:09 UTC',
  },
  {
    id: 2,
    title: 'New recommendation: Reorganize namespaces',
    type: 'Advisor',
    time: 'Nov. 28 12:09 UTC',
  },
  {
    id: 3,
    title: 'Cluster X has 7 update risks',
    type: 'Update risks',
    time: 'Nov. 28 12:09 UTC',
  },
  {
    id: 4,
    title: 'CVE-2023-0045 newly reported',
    type: 'Security',
    time: 'Nov. 28 12:09 UTC',
  },
  {
    id: 5,
    title: 'CVE-2023-0022 newly reported',
    type: 'Security',
    time: 'Nov. 28 12:09 UTC',
  },
  {
    id: 6,
    title: '3 New stale clusters',
    type: 'Status',
    time: 'Nov. 28 12:09 UTC',
  },
];

const manyNotifications: NotificationItem[] = Array.from({ length: 36 }, (_, i) => ({
  id: i + 1,
  title: `Notification ${i + 1}: Important Update`,
  type:
    i % 4 === 0 ? 'Security' : i % 4 === 1 ? 'Advisor' : i % 4 === 2 ? 'Update risks' : 'Status',
  time: 'Nov. 28 12:09 UTC',
}));

const meta: Meta<typeof NotificationsPanel> = {
  title: 'Components/NotificationsPanel',
  component: NotificationsPanel,
  tags: ['autodocs'],
  argTypes: {
    onNotificationClick: { action: 'notification clicked' },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    notifications: mockNotifications,
  },
};

export const WithPagination: Story = {
  args: {
    notifications: manyNotifications,
    enablePagination: true,
    itemsPerPage: 6,
  },
};

export const NoPagination: Story = {
  args: {
    notifications: mockNotifications,
    enablePagination: false,
  },
};

export const Empty: Story = {
  args: {
    notifications: [],
  },
};

export const SingleNotification: Story = {
  args: {
    notifications: [
      {
        id: 1,
        title: 'New CVE: CVE-2023-0091',
        type: 'Security',
        time: 'Nov. 28 12:09 UTC',
      },
    ],
  },
};

export const InteractiveNotifications: Story = {
  args: {
    notifications: mockNotifications.map((notification) => ({
      ...notification,
      onClick: () => alert(`Clicked: ${notification.title}`),
    })),
  },
};
