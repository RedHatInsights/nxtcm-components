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

export const Default: Story = {
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', overflow: 'auto' }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Dashboard
      totalClusters={{
        data: { total: 67 },
        onViewMore: () => {},
      }}
      clustersWithIssues={{
        data: {
          totalUnhealthy: 4,
          clusters: [
            {
              id: 'c1',
              name: 'prod-east-1',
              issues: 3,
              consoleUrl: 'https://console.example.com/c1',
            },
            { id: 'c2', name: 'staging-west-2', issues: 2 },
            { id: 'c3', name: 'dev-central-1', issues: 1 },
            {
              id: 'c4',
              name: 'prod-eu-west-1',
              issues: 5,
              consoleUrl: 'https://console.example.com/c4',
            },
          ],
        },
        onClusterClick: () => {},
        onOpenConsole: () => {},
      }}
      resourceUtilization={{
        data: {
          vCPU: { used: 284, total: 512, unit: 'Cores' },
          memory: { used: 1.8, total: 4.0, unit: 'TiB' },
          storage: { used: 12.3, total: 20.0, unit: 'TiB' },
        },
        onViewMore: () => {},
      }}
      expiredTrials={{
        data: {
          trials: [
            { id: 's1', name: 'trial-cluster-abc-123' },
            { id: 's2', name: 'demo-osd-east' },
            { id: 's3', name: 'poc-rosa-west' },
          ],
          totalCount: 3,
          currentPage: 1,
          pageSize: 10,
        },
        onTrialClick: () => {},
      }}
      telemetry={{
        data: { connected: 142, disconnected: 8 },
      }}
      updateStatus={{
        data: { upToDate: 118, updateAvailable: 32, currentlyUpdating: 5 },
      }}
      advisorSeverity={{
        severity: { critical: 3, important: 7, moderate: 15, low: 2 },
        onViewMore: () => {},
      }}
      advisorCategories={{
        categories: { serviceAvailability: 25, performance: 8, security: 12, faultTolerance: 4 },
      }}
      clusterProviders={{
        providers: [
          { label: 'ROSA', count: 32 },
          { label: 'ARO', count: 18 },
          { label: 'OSD', count: 12 },
          { label: 'Self-managed', count: 5 },
        ],
      }}
      costManagement={{
        totalCost: 12450.75,
        clusters: [
          { id: 'c1', name: 'prod-east-1', cost: 4200.5 },
          { id: 'c2', name: 'prod-eu-west-1', cost: 3100.25 },
          { id: 'c3', name: 'staging-west-2', cost: 2800.0 },
          { id: 'c4', name: 'dev-central-1', cost: 1350.0 },
          { id: 'c5', name: 'rosa-sandbox', cost: 1000.0 },
        ],
        currency: 'USD',
        onClusterClick: () => {},
        onViewMore: () => {},
      }}
    />
  ),
};
