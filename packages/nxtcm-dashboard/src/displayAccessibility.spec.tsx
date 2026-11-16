import { expect, test } from '@/playwright/ct-fixture';
import { setDarkTheme } from '@/playwright/display-a11y-helpers';
import { displayChecks, type DisplayView } from '@/playwright/display-a11y-matrix';
import { checkAccessibility } from '@/playwright/test-helpers';

import type { AdvisorSeverityStory } from './AdvisorRecommendations/AdvisorSeverity.story';
import type { ClustersWithIssuesStory } from './ClustersWithIssues/ClustersWithIssues.story';
import type { DashboardStory } from './Dashboard.story';
import type { ExpiredTrialsStory } from './ExpiredTrials/ExpiredTrials.story';
import type { ResourceUtilizationStory } from './ResourceUtilization/ResourceUtilization.story';
import type { StorageCardStory } from './StorageCard/StorageCard.story';
import type { ClusterProvidersStory } from './TotalClusters/ClusterProviders.story';
import type { UpdateStatusStory } from './UpdateStatus/UpdateStatus.story';

const views: DisplayView[] = [
  {
    name: 'Dashboard',
    mount: (mount) => mount<typeof DashboardStory>('nxtcm-dashboard/Dashboard/DashboardStory'),
    textEquivalents: ['ROSA: 32', 'clusters up-to-date', 'Critical'],
    control: (component) => component.getByRole('button', { name: 'Add widgets' }),
  },
  {
    name: 'ResourceUtilization',
    mount: (mount) =>
      mount<typeof ResourceUtilizationStory>(
        'nxtcm-dashboard/ResourceUtilization/ResourceUtilization/ResourceUtilizationStory',
        {
          data: {
            vCPU: { used: 32, total: 128, unit: 'Cores' },
            memory: { used: 48, total: 256, unit: 'GiB' },
            storage: { used: 500, total: 2048, unit: 'GiB' },
          },
          onViewMore: true,
        }
      ),
    textEquivalents: ['25%', 'of 128 Cores', '19%', 'of 256 GiB'],
    control: (component) => component.getByRole('button', { name: 'View more' }),
  },
  {
    name: 'ResourceUtilization loading',
    mount: (mount) =>
      mount<typeof ResourceUtilizationStory>(
        'nxtcm-dashboard/ResourceUtilization/ResourceUtilization/ResourceUtilizationStory',
        { isLoading: true }
      ),
    textEquivalents: ['Loading resource utilization'],
  },
  {
    name: 'StorageCard',
    mount: (mount) =>
      mount<typeof StorageCardStory>('nxtcm-dashboard/StorageCard/StorageCard/StorageCardStory', {
        storageData: {
          rosaClusters: 63.02,
          aroClusters: 2.17,
          osdClusters: 2.17,
          available: 21.89,
        },
        onViewMore: true,
      }),
    textEquivalents: ['ROSA clusters:', '63.02 TiB', 'Available:', '21.89 TiB'],
    control: (component) => component.getByRole('button', { name: 'View more' }),
  },
  {
    name: 'ClusterProviders',
    mount: (mount) =>
      mount<typeof ClusterProvidersStory>(
        'nxtcm-dashboard/TotalClusters/ClusterProviders/ClusterProvidersStory',
        {
          providers: [
            { label: 'ROSA', count: 42 },
            { label: 'ARO', count: 15 },
            { label: 'OSD', count: 10 },
          ],
        }
      ),
    textEquivalents: ['ROSA: 42', 'ARO: 15', 'OSD: 10'],
  },
  {
    name: 'UpdateStatus',
    mount: (mount) =>
      mount<typeof UpdateStatusStory>(
        'nxtcm-dashboard/UpdateStatus/UpdateStatus/UpdateStatusStory',
        {
          data: { upToDate: 105, updateAvailable: 27, currentlyUpdating: 18 },
        }
      ),
    textEquivalents: [
      'clusters up-to-date',
      'clusters with update available',
      'currently updating',
    ],
  },
  {
    name: 'AdvisorSeverity',
    mount: (mount) =>
      mount<typeof AdvisorSeverityStory>(
        'nxtcm-dashboard/AdvisorRecommendations/AdvisorSeverity/AdvisorSeverityStory',
        { severity: { critical: 3, important: 7, moderate: 15, low: 2 }, onViewMore: true }
      ),
    textEquivalents: ['Critical', 'Important', 'Moderate', 'Low'],
    control: (component) => component.getByRole('button', { name: /View more/ }),
  },
  {
    name: 'ClustersWithIssues',
    mount: (mount) =>
      mount<typeof ClustersWithIssuesStory>(
        'nxtcm-dashboard/ClustersWithIssues/ClustersWithIssues/ClustersWithIssuesStory',
        {
          data: {
            totalUnhealthy: 2,
            clusters: [
              { id: 'c1', name: 'cluster1', issues: 1 },
              { id: 'c2', name: 'cluster2', issues: 12 },
            ],
          },
          onClusterClick: true,
        }
      ),
    textEquivalents: ['cluster1', 'cluster2'],
    control: (component) => component.getByRole('button', { name: 'cluster1' }),
  },
  {
    name: 'ExpiredTrials',
    mount: (mount) =>
      mount<typeof ExpiredTrialsStory>(
        'nxtcm-dashboard/ExpiredTrials/ExpiredTrials/ExpiredTrialsStory',
        {
          data: {
            trials: [
              { id: 's1', name: 'trial-cluster-abc-123' },
              { id: 's2', name: 'demo-osd-east' },
            ],
            totalCount: 2,
            currentPage: 1,
            pageSize: 10,
          },
          onTrialClick: true,
        }
      ),
    textEquivalents: ['trial-cluster-abc-123', 'demo-osd-east'],
    control: (component) => component.getByTestId('trial-link-s1'),
  },
];

for (const view of views) {
  test.describe(`${view.name} display settings`, () => {
    for (const [title, expectDisplay] of Object.entries(displayChecks)) {
      test(title, ({ mount, page }) => expectDisplay(view, mount, page));
    }
  });
}

test.describe('Dashboard tiles', () => {
  // widgetized-dashboard picks the sm / md / lg / xl template from the container width.
  for (const width of [900, 1200, 1450, 1650]) {
    test(`fit their content at ${width}px without clipping`, async ({ mount, page }) => {
      await page.setViewportSize({ width, height: 1200 });
      const component = await mount<typeof DashboardStory>(
        'nxtcm-dashboard/Dashboard/DashboardStory'
      );
      const tiles = component.locator('[data-ouia-component-id$="-widget"]');
      await expect(tiles).toHaveCount(10);
      const clipped = await tiles.evaluateAll((elements) =>
        elements
          .filter((tile) =>
            Array.from(tile.querySelectorAll<HTMLElement>('*')).some((el) => {
              const { overflowX, overflowY } = getComputedStyle(el);
              const scrolls = (value: string): boolean => value === 'auto' || value === 'scroll';
              return (
                (scrolls(overflowY) && el.scrollHeight > el.clientHeight + 1) ||
                (scrolls(overflowX) && el.scrollWidth > el.clientWidth + 1)
              );
            })
          )
          .map((tile) => tile.getAttribute('data-ouia-component-id'))
      );
      expect(clipped, 'tiles whose content scrolls').toEqual([]);
    });
  }

  test('has no axe violations in the dark theme with the widget drawer open', async ({
    mount,
    page,
  }) => {
    const component = await mount<typeof DashboardStory>(
      'nxtcm-dashboard/Dashboard/DashboardStory'
    );
    await setDarkTheme(page);
    await component.getByRole('button', { name: 'Add widgets' }).click();
    await checkAccessibility({ component });
  });
});
