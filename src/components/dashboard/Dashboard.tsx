/* eslint-disable react/display-name */
import {
  ClusterIcon,
  ExclamationTriangleIcon,
  UploadIcon,
  FolderIcon,
  StorageDomainIcon,
  BellIcon,
} from '@patternfly/react-icons';
import {
  ExtendedTemplateConfig,
  WidgetLayout,
  WidgetMapping,
} from '@patternfly/widgetized-dashboard';
import { CVECard, CVEData } from './CVECard';
import { ClusterRecommendationProps, ClusterRecommendations } from './ClusterRecommendations';
import { LoadingPanel } from './LoadingPanel';
import { Subscriptions, SubscriptionsProps } from './Subscriptions';
import { UpgradeRisks, UpgradeRisksProps } from './UpgradeRisks';
import { ErrorState } from '@patternfly/react-component-groups';
import { StorageCard, StorageData } from './StorageCard';
import { NotificationItem, NotificationsPanel } from './NotificationsPanel';
import { useLocalStorageWithObject } from './useLocalStorage';

type ClusterRecommendationsData = Omit<
  ClusterRecommendationProps,
  'onViewRecommendations' | 'onCategoryClick'
>;

type UpdateRisksData = Omit<UpgradeRisksProps, 'onViewRisks'>;

type SubscriptionsData = Omit<
  SubscriptionsProps,
  'onViewSubscriptions' | 'onSubscriptionsClick' | 'onInstancesClick'
>;

type DashboardProps = {
  clusterRecommendations: {
    load: () => Promise<ClusterRecommendationsData>;
    onViewRecommendations: () => void;
    onCategoryClick: () => void;
  };
  cveCard: {
    load: () => Promise<CVEData[]>;
  };
  subscriptions: {
    load: () => Promise<SubscriptionsData>;
    onViewSubscriptions: () => void;
    onSubscriptionsClick?: () => void;
    onInstancesClick?: () => void;
  };
  updateRisks: {
    load: () => Promise<UpdateRisksData>;
    onViewRisks: () => void;
  };
  storage: {
    load: () => Promise<StorageData>;
    onViewMore: () => void;
  };
  notifications: {
    load: () => Promise<NotificationItem[]>;
    onNotificationClick: (notification: NotificationItem) => void;
  };
};

const widgetMapping: (props: DashboardProps) => WidgetMapping = ({
  cveCard,
  clusterRecommendations,
  subscriptions,
  updateRisks,
  storage,
  notifications,
}) => ({
  'cve-card': {
    defaults: { w: 2, h: 5, maxH: 6, minH: 3 },
    config: {
      title: 'CVE Card',
      icon: <ExclamationTriangleIcon />,
    },
    renderWidget: () => (
      <LoadingPanel<CVEData[]> callback={cveCard.load}>
        {({ data, error }) => {
          if (error || !data) {
            return <ErrorState bodyText={error?.message || 'Unknown error'} />;
          }
          return <CVECard cveData={data} />;
        }}
      </LoadingPanel>
    ),
  },
  'cluster-recommendations': {
    defaults: { w: 2, h: 8, maxH: 6, minH: 5 },
    config: {
      title: 'Cluster Recommendations',
      icon: <ClusterIcon />,
    },
    renderWidget: () => (
      <LoadingPanel<ClusterRecommendationsData> callback={clusterRecommendations.load}>
        {({ data, error }) => {
          if (error || !data) {
            return <ErrorState bodyText={error?.message || 'Unknown error'} />;
          }
          return (
            <ClusterRecommendations
              {...data}
              onViewRecommendations={clusterRecommendations.onViewRecommendations}
              onCategoryClick={clusterRecommendations.onCategoryClick}
            />
          );
        }}
      </LoadingPanel>
    ),
  },
  subscriptions: {
    defaults: { w: 2, h: 4, maxH: 5, minH: 3 },
    config: {
      title: 'Subscriptions',
      icon: <FolderIcon />,
    },
    renderWidget: () => (
      <LoadingPanel<SubscriptionsData> callback={subscriptions.load}>
        {({ data, error }) => {
          if (error || !data) {
            return <ErrorState bodyText={error?.message || 'Unknown error'} />;
          }
          return (
            <Subscriptions
              {...data}
              onViewSubscriptions={subscriptions.onViewSubscriptions}
              onSubscriptionsClick={subscriptions.onSubscriptionsClick}
              onInstancesClick={subscriptions.onInstancesClick}
            />
          );
        }}
      </LoadingPanel>
    ),
  },
  'update-risks': {
    defaults: { w: 1, h: 3, maxH: 3, minH: 2 },
    config: {
      title: 'Update Risks',
      icon: <UploadIcon />,
    },
    renderWidget: () => (
      <LoadingPanel<UpgradeRisksProps> callback={updateRisks.load}>
        {({ data, error }) => {
          if (error || !data) {
            return <ErrorState bodyText={error?.message || 'Unknown error'} />;
          }
          return <UpgradeRisks {...data} onViewRisks={updateRisks.onViewRisks} />;
        }}
      </LoadingPanel>
    ),
  },
  storage: {
    defaults: { w: 1, h: 3, maxH: 3, minH: 2 },
    config: {
      title: 'Storage',
      icon: <StorageDomainIcon />,
    },
    renderWidget: () => (
      <LoadingPanel<StorageData> callback={storage.load}>
        {({ data, error }) => {
          if (error || !data) {
            return <ErrorState bodyText={error?.message || 'Unknown error'} />;
          }
          return <StorageCard storageData={data} onViewMore={storage.onViewMore} />;
        }}
      </LoadingPanel>
    ),
  },
  notifications: {
    defaults: { w: 2, h: 7, maxH: 7, minH: 7 },
    config: {
      title: 'Notifications',
      icon: <BellIcon />,
    },
    renderWidget: () => (
      <LoadingPanel<NotificationItem[]> callback={notifications.load}>
        {({ data, error }) => {
          if (error || !data) {
            return <ErrorState bodyText={error?.message || 'Unknown error'} />;
          }
          return (
            <NotificationsPanel
              notifications={data}
              onNotificationClick={notifications.onNotificationClick}
            />
          );
        }}
      </LoadingPanel>
    ),
  },
});

const initialDashboardData: ExtendedTemplateConfig = {
  sm: [
    { i: 'cve-card#1', x: 1, y: 0, w: 2, h: 3, widgetType: 'cve-card' },
    {
      i: 'cluster-recommendations#1',
      x: 0,
      y: 0,
      w: 2,
      h: 4,
      widgetType: 'cluster-recommendations',
    },
    { i: 'subscriptions#1', x: 0, y: 4, w: 2, h: 3, widgetType: 'subscriptions' },
    { i: 'update-risks#1', x: 0, y: 0, w: 1, h: 5, widgetType: 'update-risks' },
    { i: 'notifications#1', x: 0, y: 15, w: 2, h: 7, widgetType: 'notifications' },
  ],
  md: [
    { i: 'cve-card#1', x: 1, y: 0, w: 1, h: 5, widgetType: 'cve-card' },
    { i: 'storage#1', x: 1, y: 5, w: 1, h: 5, widgetType: 'storage' },
    {
      i: 'cluster-recommendations#1',
      x: 0,
      y: 0,
      w: 1,
      h: 7,
      widgetType: 'cluster-recommendations',
    },
    { i: 'subscriptions#1', x: 0, y: 12, w: 1, h: 4, widgetType: 'subscriptions' },
    { i: 'update-risks#1', x: 0, y: 7, w: 1, h: 5, widgetType: 'update-risks' },
    { i: 'notifications#1', x: 0, y: 19, w: 2, h: 7, widgetType: 'notifications' },
  ],
  lg: [
    { i: 'cve-card#1', x: 2, y: 0, w: 1, h: 5, widgetType: 'cve-card' },
    { i: 'storage#1', x: 2, y: 5, w: 1, h: 5, widgetType: 'storage' },
    {
      i: 'cluster-recommendations#1',
      x: 0,
      y: 0,
      w: 2,
      h: 7,
      widgetType: 'cluster-recommendations',
    },
    { i: 'subscriptions#1', x: 1, y: 7, w: 1, h: 5, widgetType: 'subscriptions' },
    { i: 'update-risks#1', x: 0, y: 7, w: 1, h: 5, widgetType: 'update-risks' },
    { i: 'notifications#1', x: 0, y: 12, w: 2, h: 7, widgetType: 'notifications' },
  ],
  xl: [
    { i: 'cve-card#1', x: 2, y: 0, w: 2, h: 5, widgetType: 'cve-card' },
    { i: 'storage#1', x: 2, y: 5, w: 2, h: 5, widgetType: 'storage' },
    {
      i: 'cluster-recommendations#1',
      x: 0,
      y: 0,
      w: 2,
      h: 7,
      widgetType: 'cluster-recommendations',
    },
    { i: 'subscriptions#1', x: 1, y: 7, w: 1, h: 5, widgetType: 'subscriptions' },
    { i: 'update-risks#1', x: 0, y: 7, w: 1, h: 5, widgetType: 'update-risks' },
    { i: 'notifications#1', x: 0, y: 12, w: 2, h: 7, widgetType: 'notifications' },
  ],
};

// Filter template to only include the properties we want to persist
// right now there is a cyclic dependency between the template and the widget mapping
// see https://github.com/patternfly/patternfly-widgetized-dashboard/issues/130
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

export const Dashboard = ({
  cveCard,
  clusterRecommendations,
  subscriptions,
  updateRisks,
  storage,
  notifications,
}: DashboardProps) => {
  const [template, setTemplate] = useLocalStorageWithObject<ExtendedTemplateConfig>(
    'dashboard-template',
    initialDashboardData
  );
  return (
    <WidgetLayout
      widgetMapping={widgetMapping({
        cveCard,
        clusterRecommendations,
        subscriptions,
        updateRisks,
        storage,
        notifications,
      })}
      initialTemplate={template}
      onTemplateChange={(template) => setTemplate(filterTemplate(template))}
    />
  );
};
