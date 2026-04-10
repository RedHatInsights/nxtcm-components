import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { ClustersWithIssues, ClustersWithIssuesProps } from './ClustersWithIssues';
import { checkAccessibility } from '../../../test-helpers';

const defaultData: ClustersWithIssuesProps['data'] = {
  totalUnhealthy: 4,
  clusters: [
    { id: 'c1', name: 'cluster1', issues: 1 },
    { id: 'c2', name: 'cluster2', issues: 12 },
    { id: 'c3', name: 'cluster3', issues: 7 },
    { id: 'c4', name: 'cluster4', issues: 5 },
  ],
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
    const icon = component.locator('svg');
    expect(await icon.count()).toBeGreaterThanOrEqual(1);
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

    await expect(component.getByRole('cell', { name: '1' })).toBeVisible();
    await expect(component.getByRole('cell', { name: '12' })).toBeVisible();
    await expect(component.getByRole('cell', { name: '7' })).toBeVisible();
    await expect(component.getByRole('cell', { name: '5' })).toBeVisible();
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

  test('should render kebab actions when rowActions is provided', async ({ mount }) => {
    const component = await mount(
      <ClustersWithIssues data={defaultData} rowActions={() => [{ title: 'Open console' }]} />
    );

    const kebabs = component.getByRole('button', { name: 'Kebab toggle' });
    expect(await kebabs.count()).toBe(defaultData.clusters.length);
  });

  test('should not render kebab column when rowActions is not provided', async ({ mount }) => {
    const component = await mount(<ClustersWithIssues data={defaultData} />);

    const kebabs = component.getByRole('button', { name: 'Kebab toggle' });
    expect(await kebabs.count()).toBe(0);
  });

  test('should handle single cluster', async ({ mount }) => {
    const data: ClustersWithIssuesProps['data'] = {
      totalUnhealthy: 1,
      clusters: [{ id: 'c1', name: 'prod-east', issues: 3 }],
    };
    const component = await mount(<ClustersWithIssues data={data} />);

    await expect(component.getByTestId('unhealthy-count')).toContainText('1');
    await expect(component.getByText('prod-east')).toBeVisible();
    await expect(component.getByRole('cell', { name: '3' })).toBeVisible();
  });

  test('should handle high issue counts', async ({ mount }) => {
    const data: ClustersWithIssuesProps['data'] = {
      totalUnhealthy: 999,
      clusters: [{ id: 'c1', name: 'big-cluster', issues: 500 }],
    };
    const component = await mount(<ClustersWithIssues data={data} />);

    await expect(component.getByTestId('unhealthy-count')).toContainText('999');
    await expect(component.getByRole('cell', { name: '500' })).toBeVisible();
  });
});
