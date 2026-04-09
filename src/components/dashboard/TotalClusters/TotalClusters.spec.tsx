import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { TotalClusters, TotalClustersProps } from './TotalClusters';
import { checkAccessibility } from '../../../test-helpers';

const defaultData: TotalClustersProps['data'] = {
  total: 67,
  breakdown: [
    { label: 'ROSA', count: 42 },
    { label: 'ARO', count: 15 },
    { label: 'OSD', count: 10 },
  ],
};

test.describe('TotalClusters', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<TotalClusters data={defaultData} />);
    await checkAccessibility({ component });
  });

  test('should display the total cluster count', async ({ mount }) => {
    const component = await mount(<TotalClusters data={defaultData} />);
    await expect(component.getByTestId('total-clusters')).toContainText('67');
  });

  test('should display the total label', async ({ mount }) => {
    const component = await mount(<TotalClusters data={defaultData} />);
    await expect(component.getByText('total managed clusters')).toBeVisible();
  });

  test('should display breakdown counts per cluster type', async ({ mount }) => {
    const component = await mount(<TotalClusters data={defaultData} />);

    await expect(component.getByTestId('count-ROSA')).toContainText('42');
    await expect(component.getByTestId('count-ARO')).toContainText('15');
    await expect(component.getByTestId('count-OSD')).toContainText('10');
  });

  test('should display breakdown labels', async ({ mount }) => {
    const component = await mount(<TotalClusters data={defaultData} />);

    await expect(component.getByText('ROSA')).toBeVisible();
    await expect(component.getByText('ARO')).toBeVisible();
    await expect(component.getByText('OSD')).toBeVisible();
  });

  test('should not render breakdown section when breakdown is not provided', async ({ mount }) => {
    const component = await mount(<TotalClusters data={{ total: 50 }} />);

    await expect(component.getByTestId('total-clusters')).toContainText('50');
    await expect(component.getByText('ROSA')).not.toBeVisible();
  });

  test('should not render breakdown section when breakdown is empty', async ({ mount }) => {
    const component = await mount(<TotalClusters data={{ total: 50, breakdown: [] }} />);

    await expect(component.getByTestId('total-clusters')).toContainText('50');
    await expect(component.getByText('total managed clusters')).toBeVisible();
  });

  test('should render with zero total', async ({ mount }) => {
    const data: TotalClustersProps['data'] = {
      total: 0,
      breakdown: [
        { label: 'ROSA', count: 0 },
        { label: 'ARO', count: 0 },
      ],
    };
    const component = await mount(<TotalClusters data={data} />);

    await expect(component.getByTestId('total-clusters')).toContainText('0');
    await expect(component.getByTestId('count-ROSA')).toContainText('0');
    await expect(component.getByTestId('count-ARO')).toContainText('0');
  });

  test('should render with high counts', async ({ mount }) => {
    const component = await mount(
      <TotalClusters data={{ total: 9999, breakdown: [{ label: 'ROSA', count: 9999 }] }} />
    );

    await expect(component.getByTestId('total-clusters')).toContainText('9999');
    await expect(component.getByTestId('count-ROSA')).toContainText('9999');
  });

  test('should not show "View all clusters" button when onViewMore is not provided', async ({
    mount,
  }) => {
    const component = await mount(<TotalClusters data={defaultData} />);
    await expect(component.getByRole('button', { name: /View all clusters/i })).not.toBeVisible();
  });

  test('should show "View all clusters" button when onViewMore is provided', async ({ mount }) => {
    const component = await mount(<TotalClusters data={defaultData} onViewMore={() => {}} />);

    const viewButton = component.getByRole('button', { name: /View all clusters/i });
    await expect(viewButton).toBeVisible();
  });

  test('should call onViewMore when button is clicked', async ({ mount }) => {
    let viewMoreCalled = false;
    const handleViewMore = () => {
      viewMoreCalled = true;
    };

    const component = await mount(<TotalClusters data={defaultData} onViewMore={handleViewMore} />);

    await component.getByRole('button', { name: /View all clusters/i }).click();
    expect(viewMoreCalled).toBe(true);
  });

  test('should render icons for each breakdown item', async ({ mount }) => {
    const component = await mount(<TotalClusters data={defaultData} />);

    const icons = component.locator('svg');
    expect(await icons.count()).toBeGreaterThanOrEqual(defaultData.breakdown!.length);
  });

  test('should handle single cluster type in breakdown', async ({ mount }) => {
    const data: TotalClustersProps['data'] = {
      total: 25,
      breakdown: [{ label: 'ROSA', count: 25 }],
    };
    const component = await mount(<TotalClusters data={data} />);

    await expect(component.getByTestId('total-clusters')).toContainText('25');
    await expect(component.getByTestId('count-ROSA')).toContainText('25');
    await expect(component.getByText('ARO')).not.toBeVisible();
  });

  test('should handle four or more cluster types in breakdown', async ({ mount }) => {
    const data: TotalClustersProps['data'] = {
      total: 100,
      breakdown: [
        { label: 'ROSA', count: 40 },
        { label: 'ARO', count: 30 },
        { label: 'OSD', count: 20 },
        { label: 'Other', count: 10 },
      ],
    };
    const component = await mount(<TotalClusters data={data} />);

    await expect(component.getByTestId('count-ROSA')).toContainText('40');
    await expect(component.getByTestId('count-ARO')).toContainText('30');
    await expect(component.getByTestId('count-OSD')).toContainText('20');
    await expect(component.getByTestId('count-Other')).toContainText('10');
  });
});
