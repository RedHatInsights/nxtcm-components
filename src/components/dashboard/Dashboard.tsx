/* eslint-disable react/display-name */
import {
  ClusterIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
  OutlinedClockIcon,
  ConnectedIcon,
  SyncAltIcon,
  LightbulbIcon,
  TachometerAltIcon,
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
});

const initialDashboardData: ExtendedTemplateConfig = {
  sm: [
    { i: 'total-clusters#1', x: 0, y: 0, w: 2, h: 3, widgetType: 'total-clusters' },
    { i: 'clusters-with-issues#1', x: 0, y: 3, w: 2, h: 7, widgetType: 'clusters-with-issues' },
    { i: 'resource-utilization#1', x: 0, y: 10, w: 2, h: 5, widgetType: 'resource-utilization' },
    { i: 'update-status#1', x: 0, y: 15, w: 2, h: 3, widgetType: 'update-status' },
    { i: 'telemetry#1', x: 0, y: 18, w: 2, h: 3, widgetType: 'telemetry' },
    { i: 'advisor-severity#1', x: 0, y: 21, w: 2, h: 4, widgetType: 'advisor-severity' },
    { i: 'advisor-categories#1', x: 0, y: 25, w: 2, h: 4, widgetType: 'advisor-categories' },
    { i: 'expired-trials#1', x: 0, y: 29, w: 2, h: 5, widgetType: 'expired-trials' },
  ],
  md: [
    { i: 'total-clusters#1', x: 0, y: 0, w: 1, h: 3, widgetType: 'total-clusters' },
    { i: 'telemetry#1', x: 1, y: 0, w: 1, h: 3, widgetType: 'telemetry' },
    { i: 'clusters-with-issues#1', x: 0, y: 3, w: 1, h: 7, widgetType: 'clusters-with-issues' },
    { i: 'resource-utilization#1', x: 1, y: 3, w: 1, h: 5, widgetType: 'resource-utilization' },
    { i: 'update-status#1', x: 0, y: 10, w: 2, h: 3, widgetType: 'update-status' },
    { i: 'advisor-severity#1', x: 0, y: 13, w: 1, h: 4, widgetType: 'advisor-severity' },
    { i: 'advisor-categories#1', x: 1, y: 13, w: 1, h: 4, widgetType: 'advisor-categories' },
    { i: 'expired-trials#1', x: 0, y: 17, w: 2, h: 5, widgetType: 'expired-trials' },
  ],
  lg: [
    { i: 'total-clusters#1', x: 0, y: 0, w: 1, h: 3, widgetType: 'total-clusters' },
    { i: 'telemetry#1', x: 1, y: 0, w: 1, h: 3, widgetType: 'telemetry' },
    { i: 'update-status#1', x: 2, y: 0, w: 1, h: 3, widgetType: 'update-status' },
    { i: 'clusters-with-issues#1', x: 0, y: 3, w: 1, h: 7, widgetType: 'clusters-with-issues' },
    { i: 'resource-utilization#1', x: 1, y: 3, w: 2, h: 5, widgetType: 'resource-utilization' },
    { i: 'advisor-severity#1', x: 0, y: 10, w: 2, h: 4, widgetType: 'advisor-severity' },
    { i: 'advisor-categories#1', x: 2, y: 10, w: 1, h: 4, widgetType: 'advisor-categories' },
    { i: 'expired-trials#1', x: 0, y: 14, w: 3, h: 5, widgetType: 'expired-trials' },
  ],
  xl: [
    { i: 'total-clusters#1', x: 0, y: 0, w: 1, h: 3, widgetType: 'total-clusters' },
    { i: 'telemetry#1', x: 1, y: 0, w: 1, h: 3, widgetType: 'telemetry' },
    { i: 'update-status#1', x: 2, y: 0, w: 2, h: 3, widgetType: 'update-status' },
    { i: 'clusters-with-issues#1', x: 0, y: 3, w: 2, h: 7, widgetType: 'clusters-with-issues' },
    { i: 'resource-utilization#1', x: 2, y: 3, w: 2, h: 5, widgetType: 'resource-utilization' },
    { i: 'advisor-severity#1', x: 0, y: 10, w: 2, h: 4, widgetType: 'advisor-severity' },
    { i: 'advisor-categories#1', x: 2, y: 10, w: 2, h: 4, widgetType: 'advisor-categories' },
    { i: 'expired-trials#1', x: 0, y: 14, w: 4, h: 5, widgetType: 'expired-trials' },
  ],
};

function filterTemplate(template: ExtendedTemplateConfig): ExtendedTemplateConfig {
  const allowedKeys = ['i', 'x', 'y', 'w', 'h', 'widgetType'] as const;
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
    'dashboard-template-v2',
    initialDashboardData
  );

  return (
    <WidgetLayout
      widgetMapping={widgetMapping(props)}
      initialTemplate={template}
      onTemplateChange={(template) => setTemplate(filterTemplate(template))}
      showDrawer={false}
    />
  );
};
