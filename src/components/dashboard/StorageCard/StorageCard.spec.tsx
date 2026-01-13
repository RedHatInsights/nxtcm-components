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
  test('should render the component with correct title', async ({ mount }) => {
    const component = await mount(<StorageCard storageData={mockStorageData} />);
    await expect(component.getByTestId('total-used')).toBeVisible();
  });

  test('should display the total storage used', async ({ mount }) => {
    const component = await mount(<StorageCard storageData={mockStorageData} />);
    const totalUsed = (63.02 + 2.17 + 2.17).toFixed(2);
    await expect(component.getByTestId('total-used')).toContainText(`${totalUsed} TiB`);
  });

  test('should display the correct usage percentage', async ({ mount }) => {
    const component = await mount(<StorageCard storageData={mockStorageData} />);
    const totalUsed = 63.02 + 2.17 + 2.17;
    const totalStorage = totalUsed + 21.89;
    const percentage = Math.round((totalUsed / totalStorage) * 100);
    await expect(component.getByTestId('percentage')).toContainText(`${percentage}%`);
  });

  test('should display ROSA clusters storage', async ({ mount }) => {
    const component = await mount(<StorageCard storageData={mockStorageData} />);
    await expect(component.getByTestId('rosa-clusters')).toContainText('63.02 TiB');
  });

  test('should display ARO clusters storage', async ({ mount }) => {
    const component = await mount(<StorageCard storageData={mockStorageData} />);
    await expect(component.getByTestId('aro-clusters')).toContainText('2.17 TiB');
  });

  test('should display OSD clusters storage', async ({ mount }) => {
    const component = await mount(<StorageCard storageData={mockStorageData} />);
    await expect(component.getByTestId('osd-clusters')).toContainText('2.17 TiB');
  });

  test('should display available storage', async ({ mount }) => {
    const component = await mount(<StorageCard storageData={mockStorageData} />);
    await expect(component.getByTestId('available')).toContainText('21.89 TiB');
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

    const totalUsed = 80.5 + 10.2 + 5.3;
    const totalStorage = totalUsed + 4.0;
    const percentage = Math.round((totalUsed / totalStorage) * 100);

    await expect(component.getByTestId('percentage')).toContainText(`${percentage}%`);
  });

  test('should calculate percentage correctly for low usage', async ({ mount }) => {
    const lowUsageData = {
      rosaClusters: 10.5,
      aroClusters: 5.2,
      osdClusters: 3.3,
      available: 81.0,
    };
    const component = await mount(<StorageCard storageData={lowUsageData} />);

    const totalUsed = 10.5 + 5.2 + 3.3;
    const totalStorage = totalUsed + 81.0;
    const percentage = Math.round((totalUsed / totalStorage) * 100);

    await expect(component.getByTestId('percentage')).toContainText(`${percentage}%`);
  });

  test('should display formatted numbers with two decimal places', async ({ mount }) => {
    const preciseData = {
      rosaClusters: 123.456,
      aroClusters: 45.678,
      osdClusters: 12.345,
      available: 67.89,
    };
    const component = await mount(<StorageCard storageData={preciseData} />);

    await expect(component.getByTestId('rosa-clusters')).toContainText('123.46 TiB');
    await expect(component.getByTestId('aro-clusters')).toContainText('45.68 TiB');
    await expect(component.getByTestId('osd-clusters')).toContainText('12.35 TiB');
    await expect(component.getByTestId('available')).toContainText('67.89 TiB');
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
