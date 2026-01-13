import type { Meta, StoryObj } from '@storybook/react';
import { Dashboard } from './Dashboard';

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

// Default story with the Dashboard component as-is
export const Default: Story = {
  render: () => (
    <Dashboard
      cveCard={{
        load: () =>
          Promise.resolve([
            {
              severity: 'critical',
              count: 1245,
              label: 'Critical severity CVEs',
              onViewClick: () => {},
              viewLinkText: 'View all critical',
            },
            {
              severity: 'important',
              count: 3789,
              label: 'Important severity CVEs',
              onViewClick: () => {},
              viewLinkText: 'View all important',
            },
          ]),
      }}
      clusterRecommendations={{
        load: () =>
          Promise.resolve({
            count: 5,
            serviceAvailability: 2,
            performance: 3,
            security: 1,
            faultTolerance: 2,
          }),
        onViewRecommendations: () => {},
        onCategoryClick: () => {},
      }}
      subscriptions={{
        load: () =>
          Promise.resolve({
            subscriptionCount: 3,
            instanceCount: 11,
          }),
        onViewSubscriptions: () => {},
      }}
      updateRisks={{
        load: () =>
          Promise.resolve({ totalRisks: 10, criticalCount: 5, warningCount: 3, infoCount: 2 }),
        onViewRisks: () => {},
      }}
      storage={{
        load: () =>
          Promise.resolve({
            rosaClusters: 100,
            aroClusters: 50,
            osdClusters: 20,
            available: 1000,
          }),
        onViewMore: () => {},
      }}
      notifications={{
        load: () =>
          Promise.resolve([
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
            {
              id: 7,
              title: '3 New stale clusters',
              type: 'Status',
              time: 'Nov. 28 12:09 UTC',
            },
          ]),
        onNotificationClick: () => {},
      }}
    />
  ),
};
