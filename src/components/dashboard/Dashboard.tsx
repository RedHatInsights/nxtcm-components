/* eslint-disable react/display-name */
import { useMemo } from 'react';
import {
  ClusterIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
  OutlinedClockIcon,
  ConnectedIcon,
  SyncAltIcon,
  LightbulbIcon,
  TachometerAltIcon,
  CubesIcon,
  DollarSignIcon,
} from '@patternfly/react-icons';
import {
  ExtendedTemplateConfig,
  WidgetLayout,
  WidgetMapping,
} from '@patternfly/widgetized-dashboard';
import { TotalClusters, TotalClustersData } from './TotalClusters/TotalClusters';
import {
  ClustersWithIssues,
  ClustersWithIssuesData,
  ClusterIssue,
} from './ClustersWithIssues/ClustersWithIssues';
import {
  ResourceUtilization,
  ResourceUtilizationData,
} from './ResourceUtilization/ResourceUtilization';
import { ExpiredTrials, ExpiredTrialsData, ExpiredTrial } from './ExpiredTrials/ExpiredTrials';
import { Telemetry, TelemetryData } from './Telemetry/Telemetry';
import { UpdateStatus, UpdateStatusData } from './UpdateStatus/UpdateStatus';
import {
  AdvisorSeverity,
  SeverityCounts,
  AdvisorCategories,
  CategoryCounts,
} from './AdvisorRecommendations/AdvisorRecommendations';
import { ClusterProviders, ProviderBreakdown } from './TotalClusters/ClusterProviders';
import { CostManagement, ClusterCost } from './CostManagement/CostManagement';
import { useLocalStorageWithObject } from './useLocalStorage';

export type DashboardProps = {
  totalClusters: {
    data: TotalClustersData;
    onViewMore?: () => void;
  };
  clustersWithIssues: {
    data: ClustersWithIssuesData;
    onClusterClick?: (cluster: ClusterIssue) => void;
    onOpenConsole?: (cluster: ClusterIssue) => void;
  };
  resourceUtilization: {
    data: ResourceUtilizationData;
    onViewMore?: () => void;
  };
  expiredTrials: {
    data: ExpiredTrialsData;
    onTrialClick?: (trial: ExpiredTrial) => void;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
  telemetry: {
    data: TelemetryData;
  };
  updateStatus: {
    data: UpdateStatusData;
  };
  advisorSeverity: {
    severity: SeverityCounts;
    onViewMore?: () => void;
  };
  advisorCategories: {
    categories: CategoryCounts;
  };
  clusterProviders: {
    providers: ProviderBreakdown[];
  };
  costManagement: {
    totalCost: number;
    clusters: ClusterCost[];
    currency?: string;
    onClusterClick?: (cluster: ClusterCost) => void;
    onViewMore?: () => void;
  };
};

const widgetMapping: (props: DashboardProps) => WidgetMapping = ({
  totalClusters,
  clustersWithIssues,
  resourceUtilization,
  expiredTrials,
  telemetry,
  updateStatus,
  advisorSeverity,
  advisorCategories,
  clusterProviders,
  costManagement,
}) => ({
  'total-clusters': {
    defaults: { w: 1, h: 3, maxH: 4, minH: 2 },
    config: {
      title: 'Total clusters',
      icon: <ClusterIcon />,
    },
    renderWidget: () => (
      <TotalClusters data={totalClusters.data} onViewMore={totalClusters.onViewMore} />
    ),
  },
  'clusters-with-issues': {
    defaults: { w: 2, h: 7, maxH: 10, minH: 4 },
    config: {
      title: 'Clusters with issues',
      icon: <ExclamationCircleIcon />,
    },
    renderWidget: () => (
      <ClustersWithIssues
        data={clustersWithIssues.data}
        onClusterClick={clustersWithIssues.onClusterClick}
        onOpenConsole={clustersWithIssues.onOpenConsole}
      />
    ),
  },
  'resource-utilization': {
    defaults: { w: 2, h: 5, maxH: 6, minH: 4 },
    config: {
      title: 'Resource usage',
      icon: <ChartBarIcon />,
    },
    renderWidget: () => (
      <ResourceUtilization
        data={resourceUtilization.data}
        onViewMore={resourceUtilization.onViewMore}
      />
    ),
  },
  'expired-trials': {
    defaults: { w: 2, h: 5, maxH: 8, minH: 3 },
    config: {
      title: 'Expired trials',
      icon: <OutlinedClockIcon />,
    },
    renderWidget: () => (
      <ExpiredTrials
        data={expiredTrials.data}
        onTrialClick={expiredTrials.onTrialClick}
        onPageChange={expiredTrials.onPageChange}
        onPageSizeChange={expiredTrials.onPageSizeChange}
      />
    ),
  },
  telemetry: {
    defaults: { w: 1, h: 3, maxH: 4, minH: 2 },
    config: {
      title: 'Telemetry',
      icon: <ConnectedIcon />,
    },
    renderWidget: () => <Telemetry data={telemetry.data} />,
  },
  'update-status': {
    defaults: { w: 2, h: 3, maxH: 4, minH: 2 },
    config: {
      title: 'Update status',
      icon: <SyncAltIcon />,
    },
    renderWidget: () => <UpdateStatus data={updateStatus.data} />,
  },
  'advisor-severity': {
    defaults: { w: 2, h: 4, maxH: 5, minH: 3 },
    config: {
      title: 'Advisor by severity',
      icon: <LightbulbIcon />,
    },
    renderWidget: () => (
      <AdvisorSeverity
        severity={advisorSeverity.severity}
        onViewMore={advisorSeverity.onViewMore}
      />
    ),
  },
  'advisor-categories': {
    defaults: { w: 2, h: 4, maxH: 5, minH: 3 },
    config: {
      title: 'Advisor by category',
      icon: <TachometerAltIcon />,
    },
    renderWidget: () => <AdvisorCategories categories={advisorCategories.categories} />,
  },
  'cluster-providers': {
    defaults: { w: 2, h: 4, maxH: 5, minH: 3 },
    config: {
      title: 'Clusters by provider',
      icon: <CubesIcon />,
    },
    renderWidget: () => <ClusterProviders providers={clusterProviders.providers} />,
  },
  'cost-management': {
    defaults: { w: 2, h: 5, maxH: 7, minH: 4 },
    config: {
      title: 'Cost management',
      icon: <DollarSignIcon />,
    },
    renderWidget: () => (
      <CostManagement
        totalCost={costManagement.totalCost}
        clusters={costManagement.clusters}
        currency={costManagement.currency}
        onClusterClick={costManagement.onClusterClick}
        onViewMore={costManagement.onViewMore}
      />
    ),
  },
});

const initialDashboardData: ExtendedTemplateConfig = {
  sm: [
    {
      i: 'total-clusters#1',
      x: 0,
      y: 0,
      w: 2,
      h: 3,
      widgetType: 'total-clusters',
      title: 'Total clusters',
    },
    {
      i: 'cluster-providers#1',
      x: 0,
      y: 3,
      w: 2,
      h: 4,
      widgetType: 'cluster-providers',
      title: 'Clusters by provider',
    },
    {
      i: 'clusters-with-issues#1',
      x: 0,
      y: 7,
      w: 2,
      h: 7,
      widgetType: 'clusters-with-issues',
      title: 'Clusters with issues',
    },
    {
      i: 'resource-utilization#1',
      x: 0,
      y: 14,
      w: 2,
      h: 5,
      widgetType: 'resource-utilization',
      title: 'Resource usage',
    },
    {
      i: 'update-status#1',
      x: 0,
      y: 19,
      w: 2,
      h: 3,
      widgetType: 'update-status',
      title: 'Update status',
    },
    { i: 'telemetry#1', x: 0, y: 22, w: 2, h: 3, widgetType: 'telemetry', title: 'Telemetry' },
    {
      i: 'advisor-severity#1',
      x: 0,
      y: 25,
      w: 2,
      h: 4,
      widgetType: 'advisor-severity',
      title: 'Advisor by severity',
    },
    {
      i: 'advisor-categories#1',
      x: 0,
      y: 29,
      w: 2,
      h: 4,
      widgetType: 'advisor-categories',
      title: 'Advisor by category',
    },
    {
      i: 'cost-management#1',
      x: 0,
      y: 33,
      w: 2,
      h: 5,
      widgetType: 'cost-management',
      title: 'Cost management',
    },
    {
      i: 'expired-trials#1',
      x: 0,
      y: 38,
      w: 2,
      h: 5,
      widgetType: 'expired-trials',
      title: 'Expired trials',
    },
  ],
  md: [
    {
      i: 'total-clusters#1',
      x: 0,
      y: 0,
      w: 1,
      h: 3,
      widgetType: 'total-clusters',
      title: 'Total clusters',
    },
    {
      i: 'cluster-providers#1',
      x: 1,
      y: 0,
      w: 1,
      h: 4,
      widgetType: 'cluster-providers',
      title: 'Clusters by provider',
    },
    { i: 'telemetry#1', x: 0, y: 4, w: 1, h: 3, widgetType: 'telemetry', title: 'Telemetry' },
    {
      i: 'update-status#1',
      x: 1,
      y: 4,
      w: 1,
      h: 3,
      widgetType: 'update-status',
      title: 'Update status',
    },
    {
      i: 'clusters-with-issues#1',
      x: 0,
      y: 7,
      w: 1,
      h: 7,
      widgetType: 'clusters-with-issues',
      title: 'Clusters with issues',
    },
    {
      i: 'resource-utilization#1',
      x: 1,
      y: 7,
      w: 1,
      h: 5,
      widgetType: 'resource-utilization',
      title: 'Resource usage',
    },
    {
      i: 'advisor-severity#1',
      x: 0,
      y: 14,
      w: 1,
      h: 4,
      widgetType: 'advisor-severity',
      title: 'Advisor by severity',
    },
    {
      i: 'advisor-categories#1',
      x: 1,
      y: 14,
      w: 1,
      h: 4,
      widgetType: 'advisor-categories',
      title: 'Advisor by category',
    },
    {
      i: 'cost-management#1',
      x: 0,
      y: 18,
      w: 2,
      h: 5,
      widgetType: 'cost-management',
      title: 'Cost management',
    },
    {
      i: 'expired-trials#1',
      x: 0,
      y: 23,
      w: 2,
      h: 5,
      widgetType: 'expired-trials',
      title: 'Expired trials',
    },
  ],
  lg: [
    {
      i: 'total-clusters#1',
      x: 0,
      y: 0,
      w: 1,
      h: 3,
      widgetType: 'total-clusters',
      title: 'Total clusters',
    },
    {
      i: 'cluster-providers#1',
      x: 1,
      y: 0,
      w: 1,
      h: 4,
      widgetType: 'cluster-providers',
      title: 'Clusters by provider',
    },
    {
      i: 'resource-utilization#1',
      x: 2,
      y: 0,
      w: 1,
      h: 5,
      widgetType: 'resource-utilization',
      title: 'Resource usage',
    },
    {
      i: 'clusters-with-issues#1',
      x: 0,
      y: 5,
      w: 2,
      h: 7,
      widgetType: 'clusters-with-issues',
      title: 'Clusters with issues',
    },
    {
      i: 'advisor-severity#1',
      x: 2,
      y: 5,
      w: 1,
      h: 4,
      widgetType: 'advisor-severity',
      title: 'Advisor by severity',
    },
    {
      i: 'advisor-categories#1',
      x: 2,
      y: 9,
      w: 1,
      h: 4,
      widgetType: 'advisor-categories',
      title: 'Advisor by category',
    },
    { i: 'telemetry#1', x: 0, y: 12, w: 1, h: 3, widgetType: 'telemetry', title: 'Telemetry' },
    {
      i: 'update-status#1',
      x: 1,
      y: 12,
      w: 1,
      h: 3,
      widgetType: 'update-status',
      title: 'Update status',
    },
    {
      i: 'cost-management#1',
      x: 2,
      y: 13,
      w: 1,
      h: 5,
      widgetType: 'cost-management',
      title: 'Cost management',
    },
    {
      i: 'expired-trials#1',
      x: 0,
      y: 15,
      w: 2,
      h: 5,
      widgetType: 'expired-trials',
      title: 'Expired trials',
    },
  ],
  xl: [
    {
      i: 'total-clusters#1',
      x: 0,
      y: 0,
      w: 1,
      h: 3,
      widgetType: 'total-clusters',
      title: 'Total clusters',
    },
    {
      i: 'cluster-providers#1',
      x: 1,
      y: 0,
      w: 1,
      h: 4,
      widgetType: 'cluster-providers',
      title: 'Clusters by provider',
    },
    {
      i: 'resource-utilization#1',
      x: 2,
      y: 0,
      w: 2,
      h: 5,
      widgetType: 'resource-utilization',
      title: 'Resource usage',
    },
    {
      i: 'clusters-with-issues#1',
      x: 0,
      y: 5,
      w: 2,
      h: 7,
      widgetType: 'clusters-with-issues',
      title: 'Clusters with issues',
    },
    {
      i: 'advisor-severity#1',
      x: 2,
      y: 5,
      w: 1,
      h: 4,
      widgetType: 'advisor-severity',
      title: 'Advisor by severity',
    },
    {
      i: 'advisor-categories#1',
      x: 3,
      y: 5,
      w: 1,
      h: 4,
      widgetType: 'advisor-categories',
      title: 'Advisor by category',
    },
    { i: 'telemetry#1', x: 2, y: 9, w: 1, h: 3, widgetType: 'telemetry', title: 'Telemetry' },
    {
      i: 'update-status#1',
      x: 3,
      y: 9,
      w: 1,
      h: 3,
      widgetType: 'update-status',
      title: 'Update status',
    },
    {
      i: 'cost-management#1',
      x: 0,
      y: 12,
      w: 2,
      h: 5,
      widgetType: 'cost-management',
      title: 'Cost management',
    },
    {
      i: 'expired-trials#1',
      x: 2,
      y: 12,
      w: 2,
      h: 5,
      widgetType: 'expired-trials',
      title: 'Expired trials',
    },
  ],
};

function filterTemplate(template: ExtendedTemplateConfig): ExtendedTemplateConfig {
  const allowedKeys = ['i', 'x', 'y', 'w', 'h', 'widgetType', 'title'] as const;
  const filterLayoutItem = (item: any) => {
    const filtered: any = {};
    for (const key of allowedKeys) {
      if (key in item) {
        filtered[key] = item[key];
      }
    }
    return filtered;
  };

  const filtered = {} as ExtendedTemplateConfig;
  const breakpoints: Array<keyof ExtendedTemplateConfig> = ['sm', 'md', 'lg', 'xl'];

  for (const breakpoint of breakpoints) {
    if (template[breakpoint]) {
      filtered[breakpoint] = template[breakpoint].map(filterLayoutItem);
    }
  }

  return filtered;
}

export const Dashboard = (props: DashboardProps) => {
  const [template, setTemplate] = useLocalStorageWithObject<ExtendedTemplateConfig>(
    'dashboard-template-v5',
    initialDashboardData
  );

  const mapping = useMemo(() => widgetMapping(props), [props]);

  return (
    <WidgetLayout
      widgetMapping={mapping}
      initialTemplate={template}
      onTemplateChange={(template) => setTemplate(filterTemplate(template))}
      showDrawer
    />
  );
};
