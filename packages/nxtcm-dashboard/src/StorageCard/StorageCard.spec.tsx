import { expect, test } from '@/playwright/ct-fixture';
import { checkAccessibility } from '@/playwright/test-helpers';

import { StorageCardProps } from './StorageCard';
import type { StorageCardStory } from './StorageCard.story';

const mockStorageData: StorageCardProps['storageData'] = {
  rosaClusters: 63.02,
  aroClusters: 2.17,
  osdClusters: 2.17,
  available: 21.89,
};

test.describe('StorageCard', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount<typeof StorageCardStory>(
      'nxtcm-dashboard/StorageCard/StorageCard/StorageCardStory',
      {
        storageData: mockStorageData,
      }
    );
    await checkAccessibility({ component });
  });

  test('should display total storage, utilization and the cluster breakdown', async ({ mount }) => {
    const component = await mount<typeof StorageCardStory>(
      'nxtcm-dashboard/StorageCard/StorageCard/StorageCardStory',
      {
        storageData: mockStorageData,
      }
    );
    await expect(component.getByText('Total storage used', { exact: true })).toBeVisible();
    await expect(component.getByTestId('total-used')).toHaveText('67.36 TiB');
    await expect(component.getByText('75%', { exact: true })).toBeVisible();
    await expect(component.getByText('ROSA clusters:', { exact: true })).toBeVisible();
    await expect(component.getByTestId('rosaClusters')).toHaveText('63.02 TiB');
    await expect(component.getByText('ARO Clusters:', { exact: true })).toBeVisible();
    await expect(component.getByTestId('aroClusters')).toHaveText('2.17 TiB');
    await expect(component.getByText('OSD Clusters:', { exact: true })).toBeVisible();
    await expect(component.getByTestId('osdClusters')).toHaveText('2.17 TiB');
    await expect(component.getByText('Available:', { exact: true })).toBeVisible();
    await expect(component.getByTestId('available')).toHaveText('21.89 TiB');
  });

  test('should not show "View more" button when onViewMore is not provided', async ({ mount }) => {
    const component = await mount<typeof StorageCardStory>(
      'nxtcm-dashboard/StorageCard/StorageCard/StorageCardStory',
      {
        storageData: mockStorageData,
      }
    );
    await expect(component.getByText('View more')).toBeHidden();
  });

  test('should show "View more" button when onViewMore callback is provided', async ({ mount }) => {
    const component = await mount<typeof StorageCardStory>(
      'nxtcm-dashboard/StorageCard/StorageCard/StorageCardStory',
      {
        storageData: mockStorageData,
        onViewMore: true,
      }
    );
    const viewMoreButton = component.getByText('View more');
    await expect(viewMoreButton).toBeVisible();
    await viewMoreButton.click();
    await expect
      .poll(() =>
        component
          .getByTestId('onViewMore-calls')
          .evaluate((input: HTMLInputElement) => JSON.parse(input.value) as unknown[][])
      )
      .toHaveLength(1);
  });

  test('should calculate percentage correctly for high usage', async ({ mount }) => {
    const highUsageData = {
      rosaClusters: 80.5,
      aroClusters: 10.2,
      osdClusters: 5.3,
      available: 4.0,
    };
    const component = await mount<typeof StorageCardStory>(
      'nxtcm-dashboard/StorageCard/StorageCard/StorageCardStory',
      {
        storageData: highUsageData,
      }
    );

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
    const component = await mount<typeof StorageCardStory>(
      'nxtcm-dashboard/StorageCard/StorageCard/StorageCardStory',
      {
        storageData: lowUsageData,
      }
    );

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
    const component = await mount<typeof StorageCardStory>(
      'nxtcm-dashboard/StorageCard/StorageCard/StorageCardStory',
      {
        storageData: preciseData,
      }
    );

    const rosaClustersContainer = component.getByTestId('rosaClusters');
    await expect(rosaClustersContainer).toContainText(`${preciseData.rosaClusters.toFixed(2)} TiB`);

    const aroClustersContainer = component.getByTestId('aroClusters');
    await expect(aroClustersContainer).toContainText(`${preciseData.aroClusters.toFixed(2)} TiB`);

    const osdClustersContainer = component.getByTestId('osdClusters');
    await expect(osdClustersContainer).toContainText(`${preciseData.osdClusters.toFixed(2)} TiB`);

    const availableContainer = component.getByTestId('available');
    await expect(availableContainer).toContainText(`${preciseData.available.toFixed(2)} TiB`);
  });

  test('should render utilization chart', async ({ mount, page }) => {
    await mount<typeof StorageCardStory>(
      'nxtcm-dashboard/StorageCard/StorageCard/StorageCardStory',
      {
        storageData: mockStorageData,
      }
    );
    const chart = page.getByRole('img', { name: 'Storage utilization chart' });
    await expect(chart).toBeVisible();
  });

  test('should render skeleton when isLoading is true', async ({ mount }) => {
    const component = await mount<typeof StorageCardStory>(
      'nxtcm-dashboard/StorageCard/StorageCard/StorageCardStory',
      {
        isLoading: true,
        storageData: mockStorageData,
      }
    );
    await expect(component.getByText('Loading storage data')).toBeVisible();
    await expect(component.getByTestId('percentage')).toBeHidden();
  });

  test('should render skeleton when isLoading is true without data', async ({ mount }) => {
    const component = await mount<typeof StorageCardStory>(
      'nxtcm-dashboard/StorageCard/StorageCard/StorageCardStory',
      {
        isLoading: true,
      }
    );
    await expect(component.getByText('Loading storage data')).toBeVisible();
  });
});
