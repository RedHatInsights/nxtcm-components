# @redhat-cloud-services/nxtcm-dashboard

PatternFly dashboard widget components for ACM and OCM console home views.

## Installation

```bash
npm install @redhat-cloud-services/nxtcm-dashboard
```

## Peer dependencies

This package expects these dependencies to be provided by the consuming application:

- `react`
- `react-dom`
- `@patternfly/react-core`
- `@patternfly/react-icons`
- `@patternfly/react-table`
- `@patternfly/react-charts`
- `@patternfly/widgetized-dashboard`

## Usage

```tsx
import '@redhat-cloud-services/nxtcm-dashboard/dist/nxtcm-dashboard.css';
import { TotalClusters, AdvisorSeverity } from '@redhat-cloud-services/nxtcm-dashboard';

export const DashboardSummary = () => (
  <>
    <TotalClusters data={{ total: 67 }} />
    <AdvisorSeverity severity={{ critical: 3, important: 8, moderate: 12, low: 20 }} />
  </>
);
```

## Component catalog

- `Dashboard` - configurable widgetized dashboard layout wrapper
- `TotalClusters` - total managed cluster count card
- `ClusterProviders` - provider distribution donut card
- `ClustersWithIssues` - clusters with issues table card
- `ResourceUtilization` - utilization donut card
- `ExpiredTrials` - expired trials table card
- `Telemetry` - connected vs disconnected status card
- `UpdateStatus` - up to date vs update available card
- `AdvisorSeverity` - advisor counts by severity card
- `AdvisorCategories` - advisor counts by category donut card
- `CostManagement` - total and per-cluster cost card
- `CVECard` - CVE counts by severity card
- `ClusterRecommendations` - recommendation summary card
- `Subscriptions` - subscription status and counts card
- `UpgradeRisks` - upgrade risk severity card
- `LoadingPanel` - generic loading state panel
- `NotificationsPanel` - notifications table card

## Publishing

This package is published when a GitHub Release is created on `main` with tag `nxtcm-dashboard-v{version}` matching `package.json`. See the [repository publishing guide](../../README.md#publishing-packages).
