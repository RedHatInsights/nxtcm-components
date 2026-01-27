import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { StorageCard, StorageCardProps } from './StorageCard';

const mockStorageData: StorageCardProps['storageData'] = {
  rosaClusters: 63.02,
  aroClusters: 2.17,
  osdClusters: 2.17,
  available: 21.89,
};

test.describe('StorageCard', () => {
  test('should display the total storage used', async ({ mount }) => {
    const component = await mount(<StorageCard storageData={mockStorageData} />);

    const totalUsed = (
      mockStorageData.rosaClusters +
      mockStorageData.aroClusters +
      mockStorageData.osdClusters
    ).toFixed(2);
    // Find the label, then navigate to its parent container that has both the value and label
    const totalStorageContainer = component
      .getByText('Total storage used', { exact: true })
      .locator('..');

    await expect(totalStorageContainer).toContainText('Total storage used');
    await expect(totalStorageContainer).toContainText(`${totalUsed} TiB`);
  });

  test('should display the correct usage percentage', async ({ mount }) => {
    const component = await mount(<StorageCard storageData={mockStorageData} />);
    const totalUsed =
      mockStorageData.rosaClusters + mockStorageData.aroClusters + mockStorageData.osdClusters;
    const totalStorage = totalUsed + mockStorageData.available;
    const percentage = Math.round((totalUsed / totalStorage) * 100);

    await expect(component.getByText(`${percentage}%`)).toBeVisible();
  });

  test('should display ROSA clusters storage', async ({ mount }) => {
    const component = await mount(<StorageCard storageData={mockStorageData} />);

    const rosaClustersContainer = component.getByText('ROSA clusters').locator('..');
    await expect(rosaClustersContainer).toContainText(`${mockStorageData.rosaClusters} TiB`);
  });

  test('should display ARO clusters storage', async ({ mount }) => {
    const component = await mount(<StorageCard storageData={mockStorageData} />);

    const aroClustersContainer = component.getByText('ARO Clusters').locator('..');
    await expect(aroClustersContainer).toContainText(`${mockStorageData.aroClusters} TiB`);
  });

  test('should display OSD clusters storage', async ({ mount }) => {
    const component = await mount(<StorageCard storageData={mockStorageData} />);

    const osdClustersContainer = component.getByText('OSD Clusters').locator('..');
    await expect(osdClustersContainer).toContainText(`${mockStorageData.osdClusters} TiB`);
  });

  test('should display available storage', async ({ mount }) => {
    const component = await mount(<StorageCard storageData={mockStorageData} />);
    const availableContainer = component.getByText('Available').locator('..');
    await expect(availableContainer).toContainText(`${mockStorageData.available} TiB`);
  });

  test('should not show "View more" button when onViewMore is not provided', async ({ mount }) => {
    const component = await mount(<StorageCard storageData={mockStorageData} />);
    await expect(component.getByText('View more')).not.toBeVisible();
  });

  test('should show "View more" button when onViewMore callback is provided', async ({ mount }) => {
    let handleViewMoreCalled = false;
    const handleViewMore = () => {
      handleViewMoreCalled = true;
    };
    const component = await mount(
      <StorageCard storageData={mockStorageData} onViewMore={handleViewMore} />
    );
    const viewMoreButton = component.getByText('View more');
    await expect(viewMoreButton).toBeVisible();
    await viewMoreButton.click();
    expect(handleViewMoreCalled).toBe(true);
  });

  test('should calculate percentage correctly for high usage', async ({ mount }) => {
    const highUsageData = {
      rosaClusters: 80.5,
      aroClusters: 10.2,
      osdClusters: 5.3,
      available: 4.0,
    };
    const component = await mount(<StorageCard storageData={highUsageData} />);

    const totalUsed =
      highUsageData.rosaClusters + highUsageData.aroClusters + highUsageData.osdClusters;
    const totalStorage = totalUsed + highUsageData.available;
    const percentage = Math.round((totalUsed / totalStorage) * 100);

    await expect(component.getByText(`${percentage}%`)).toBeVisible();
  });

  test('should calculate percentage correctly for low usage', async ({ mount }) => {
    const lowUsageData = {
      rosaClusters: 10.5,
      aroClusters: 5.2,
      osdClusters: 3.3,
      available: 81.0,
    };
    const component = await mount(<StorageCard storageData={lowUsageData} />);

    const totalUsed =
      lowUsageData.rosaClusters + lowUsageData.aroClusters + lowUsageData.osdClusters;
    const totalStorage = totalUsed + lowUsageData.available;
    const percentage = Math.round((totalUsed / totalStorage) * 100);

    await expect(component.getByText(`${percentage}%`)).toBeVisible();
  });

  test('should display formatted numbers with two decimal places', async ({ mount }) => {
    const preciseData = {
      rosaClusters: 123.456,
      aroClusters: 45.678,
      osdClusters: 12.345,
      available: 67.89,
    };
    const component = await mount(<StorageCard storageData={preciseData} />);

    const rosaClustersContainer = component.getByText('ROSA clusters').locator('..');
    await expect(rosaClustersContainer).toContainText(`${preciseData.rosaClusters.toFixed(2)} TiB`);

    const aroClustersContainer = component.getByText('ARO Clusters').locator('..');
    await expect(aroClustersContainer).toContainText(`${preciseData.aroClusters.toFixed(2)} TiB`);

    const osdClustersContainer = component.getByText('OSD Clusters').locator('..');
    await expect(osdClustersContainer).toContainText(`${preciseData.osdClusters.toFixed(2)} TiB`);

    const availableContainer = component.getByText('Available').locator('..');
    await expect(availableContainer).toContainText(`${preciseData.available.toFixed(2)} TiB`);
  });

  test('should render SVG circular progress indicator', async ({ mount, page }) => {
    await mount(<StorageCard storageData={mockStorageData} />);
    const svgElement = page.locator('svg');
    await expect(svgElement).toBeVisible();
    await expect(svgElement).toHaveAttribute('width', '200');
    await expect(svgElement).toHaveAttribute('height', '200');
  });

  test('should display total storage label correctly', async ({ mount }) => {
    const component = await mount(<StorageCard storageData={mockStorageData} />);
    await expect(component.getByText('Total storage used')).toBeVisible();
  });
});
