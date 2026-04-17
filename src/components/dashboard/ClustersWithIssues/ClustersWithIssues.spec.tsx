import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { ClustersWithIssues, ClustersWithIssuesProps } from './ClustersWithIssues';
import { ClustersWithIssuesWithConsoleLink } from './ClustersWithIssues.spec-helpers';
import { checkAccessibility } from '../../../test-helpers';

const defaultData: ClustersWithIssuesProps['data'] = {
  totalUnhealthy: 4,
  clusters: [
    { id: 'c1', name: 'cluster1', issues: 1, consoleUrl: 'https://console.example.com/c1' },
    { id: 'c2', name: 'cluster2', issues: 12, consoleUrl: 'https://console.example.com/c2' },
    { id: 'c3', name: 'cluster3', issues: 7, consoleUrl: 'https://console.example.com/c3' },
    { id: 'c4', name: 'cluster4', issues: 5, consoleUrl: 'https://console.example.com/c4' },
  ],
};

const paginatedData: ClustersWithIssuesProps['data'] = {
  totalUnhealthy: 12,
  clusters: Array.from({ length: 12 }, (_, i) => ({
    id: `c${i + 1}`,
    name: `cluster-${i + 1}`,
    issues: 12 - i,
  })),
};

test.describe('ClustersWithIssues', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<ClustersWithIssues data={defaultData} />);
    await checkAccessibility({ component });
  });

  test('should display the total unhealthy count', async ({ mount }) => {
    const component = await mount(<ClustersWithIssues data={defaultData} />);
    await expect(component.getByTestId('unhealthy-count')).toContainText('4');
  });

  test('should display the danger icon', async ({ mount }) => {
    const component = await mount(<ClustersWithIssues data={defaultData} />);
    await expect(component.getByTestId('unhealthy-icon')).toBeVisible();
  });

  test('should render cluster names in the table', async ({ mount }) => {
    const component = await mount(<ClustersWithIssues data={defaultData} />);

    await expect(component.getByText('cluster1')).toBeVisible();
    await expect(component.getByText('cluster2')).toBeVisible();
    await expect(component.getByText('cluster3')).toBeVisible();
    await expect(component.getByText('cluster4')).toBeVisible();
  });

  test('should render issue counts in the table', async ({ mount }) => {
    const component = await mount(<ClustersWithIssues data={defaultData} />);

    await expect(component.getByTestId('issues-c1')).toContainText('1');
    await expect(component.getByTestId('issues-c2')).toContainText('12');
    await expect(component.getByTestId('issues-c3')).toContainText('7');
    await expect(component.getByTestId('issues-c4')).toContainText('5');
  });

  test('should render the card title', async ({ mount }) => {
    const component = await mount(<ClustersWithIssues data={defaultData} />);
    await expect(component.getByRole('heading', { name: 'Clusters with issues' })).toBeVisible();
  });

  test('should render a divider after the cluster count', async ({ mount }) => {
    const component = await mount(<ClustersWithIssues data={defaultData} />);
    const countSection = component.getByTestId('unhealthy-count').locator('..');
    await expect(countSection).toBeVisible();
  });

  test('should render table headers', async ({ mount }) => {
    const component = await mount(<ClustersWithIssues data={defaultData} />);

    await expect(component.getByRole('columnheader', { name: 'Cluster name' })).toBeVisible();
    await expect(component.getByRole('columnheader', { name: 'Issues' })).toBeVisible();
  });

  test('should render cluster names as links when onClusterClick is provided', async ({
    mount,
  }) => {
    const component = await mount(
      <ClustersWithIssues data={defaultData} onClusterClick={() => {}} />
    );

    await expect(component.getByTestId('cluster-link-c1')).toBeVisible();
    await expect(component.getByTestId('cluster-link-c2')).toBeVisible();
  });

  test('should call onClusterClick when a cluster name is clicked', async ({ mount }) => {
    let clickedCluster: { id: string; name: string } | null = null;
    const handleClick = (cluster: { id: string; name: string }) => {
      clickedCluster = cluster;
    };

    const component = await mount(
      <ClustersWithIssues data={defaultData} onClusterClick={handleClick} />
    );

    await component.getByTestId('cluster-link-c1').click();
    expect(clickedCluster).not.toBeNull();
    expect(clickedCluster!.id).toBe('c1');
    expect(clickedCluster!.name).toBe('cluster1');
  });

  test('should render cluster names as plain text when onClusterClick is not provided', async ({
    mount,
  }) => {
    const component = await mount(<ClustersWithIssues data={defaultData} />);

    await expect(component.getByText('cluster1')).toBeVisible();
    await expect(component.locator('a')).toHaveCount(0);
  });

  test('should show empty state when no clusters', async ({ mount }) => {
    const component = await mount(
      <ClustersWithIssues data={{ totalUnhealthy: 0, clusters: [] }} />
    );

    await expect(component.getByTestId('unhealthy-count')).toContainText('0');
    await expect(component.getByText('No clusters with issues')).toBeVisible();
  });

  test('should not show pagination when no clusters', async ({ mount }) => {
    const component = await mount(
      <ClustersWithIssues data={{ totalUnhealthy: 0, clusters: [] }} />
    );

    await expect(component.locator('.pf-v6-c-pagination')).toHaveCount(0);
  });

  test('should handle single cluster', async ({ mount }) => {
    const data: ClustersWithIssuesProps['data'] = {
      totalUnhealthy: 1,
      clusters: [{ id: 'c1', name: 'prod-east', issues: 3 }],
    };
    const component = await mount(<ClustersWithIssues data={data} />);

    await expect(component.getByTestId('unhealthy-count')).toContainText('1');
    await expect(component.getByText('prod-east')).toBeVisible();
    await expect(component.getByTestId('issues-c1')).toContainText('3');
  });

  test('should handle high issue counts', async ({ mount }) => {
    const data: ClustersWithIssuesProps['data'] = {
      totalUnhealthy: 999,
      clusters: [{ id: 'c1', name: 'big-cluster', issues: 500 }],
    };
    const component = await mount(<ClustersWithIssues data={data} />);

    await expect(component.getByTestId('unhealthy-count')).toContainText('999');
    await expect(component.getByTestId('issues-c1')).toContainText('500');
  });
});

test.describe('ClustersWithIssues — open console link', () => {
  test('should render "Open console" links when onOpenConsole is provided', async ({ mount }) => {
    const component = await mount(<ClustersWithIssuesWithConsoleLink data={defaultData} />);

    await expect(component.getByTestId('open-console-c1')).toBeVisible();
    await expect(component.getByTestId('open-console-c1').getByText('Open console')).toBeVisible();
  });

  test('should render external link icon in each console link', async ({ mount }) => {
    const component = await mount(<ClustersWithIssuesWithConsoleLink data={defaultData} />);

    const consoleCell = component.getByTestId('open-console-c1');
    await expect(consoleCell.locator('svg')).toBeVisible();
  });

  test('should not render console column when onOpenConsole is not provided', async ({ mount }) => {
    const component = await mount(<ClustersWithIssues data={defaultData} />);

    await expect(component.getByTestId('open-console-c1')).toHaveCount(0);
  });

  test('should render console links for all visible rows', async ({ mount }) => {
    const component = await mount(<ClustersWithIssuesWithConsoleLink data={defaultData} />);

    for (const cluster of defaultData.clusters) {
      await expect(component.getByTestId(`open-console-${cluster.id}`)).toBeVisible();
    }
  });
});

test.describe('ClustersWithIssues — title tooltip', () => {
  test('should render the tooltip icon by default', async ({ mount }) => {
    const component = await mount(<ClustersWithIssues data={defaultData} />);
    await expect(component.getByTestId('title-tooltip-icon')).toBeVisible();
  });

  test('should hide the tooltip icon when titleTooltip is empty', async ({ mount }) => {
    const component = await mount(<ClustersWithIssues data={defaultData} titleTooltip="" />);
    await expect(component.getByTestId('title-tooltip-icon')).toHaveCount(0);
  });

  test('should have an accessible label on the tooltip icon', async ({ mount }) => {
    const component = await mount(<ClustersWithIssues data={defaultData} />);
    await expect(
      component.locator('[aria-label="More info about clusters with issues"]')
    ).toBeVisible();
  });
});

test.describe('ClustersWithIssues — pagination', () => {
  test('should show only first page of clusters by default', async ({ mount }) => {
    const component = await mount(<ClustersWithIssues data={paginatedData} perPage={5} />);

    const rows = component.locator('tbody tr');
    expect(await rows.count()).toBe(5);
    await expect(component.getByText('cluster-1')).toBeVisible();
    await expect(component.getByText('cluster-5')).toBeVisible();
    await expect(component.getByText('cluster-6')).not.toBeVisible();
  });

  test('should show pagination controls', async ({ mount }) => {
    const component = await mount(<ClustersWithIssues data={paginatedData} perPage={5} />);

    await expect(component.locator('.pf-v6-c-pagination')).toBeVisible();
  });

  test('should navigate to next page', async ({ mount }) => {
    const component = await mount(<ClustersWithIssues data={paginatedData} perPage={5} />);

    await component.getByLabel('Go to next page').click();

    await expect(component.getByText('cluster-6', { exact: true })).toBeVisible();
    await expect(component.getByText('cluster-10', { exact: true })).toBeVisible();
    await expect(component.getByText('cluster-1', { exact: true })).not.toBeVisible();
  });

  test('should navigate to last page', async ({ mount }) => {
    const component = await mount(<ClustersWithIssues data={paginatedData} perPage={5} />);

    await component.getByLabel('Go to last page').click();

    await expect(component.getByText('cluster-11')).toBeVisible();
    await expect(component.getByText('cluster-12')).toBeVisible();
    const rows = component.locator('tbody tr');
    expect(await rows.count()).toBe(2);
  });

  test('should show all items on one page when fewer items than perPage', async ({ mount }) => {
    const smallData: ClustersWithIssuesProps['data'] = {
      totalUnhealthy: 3,
      clusters: [
        { id: 'c1', name: 'a', issues: 1 },
        { id: 'c2', name: 'b', issues: 2 },
        { id: 'c3', name: 'c', issues: 3 },
      ],
    };
    const component = await mount(<ClustersWithIssues data={smallData} perPage={5} />);

    const rows = component.locator('tbody tr');
    expect(await rows.count()).toBe(3);
    await expect(component.locator('.pf-v6-c-pagination')).toBeVisible();
  });
});
