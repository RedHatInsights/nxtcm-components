import { expect, test } from '@/playwright/ct-fixture';
import { checkAccessibility } from '@/playwright/test-helpers';

import type { TotalClustersStory } from './TotalClusters.story';

test.describe('TotalClusters', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount<typeof TotalClustersStory>(
      'nxtcm-dashboard/TotalClusters/TotalClusters/TotalClustersStory',
      { data: { total: 67 } }
    );
    await checkAccessibility({ component });
  });

  test('should display the default cluster summary without a count action', async ({ mount }) => {
    const component = await mount<typeof TotalClustersStory>(
      'nxtcm-dashboard/TotalClusters/TotalClusters/TotalClustersStory',
      { data: { total: 67 } }
    );
    await expect(component.getByTestId('total-clusters')).toContainText('67');
    const title = component.getByTestId('total-clusters-title');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('Total clusters');
    await expect(component.getByText('managed clusters')).toBeVisible();
    await expect(component.getByRole('button', { name: '67' })).toBeHidden();
  });

  test('should render with zero total', async ({ mount }) => {
    const component = await mount<typeof TotalClustersStory>(
      'nxtcm-dashboard/TotalClusters/TotalClusters/TotalClustersStory',
      { data: { total: 0 } }
    );
    await expect(component.getByTestId('total-clusters')).toContainText('0');
  });

  test('should render with high counts', async ({ mount }) => {
    const component = await mount<typeof TotalClustersStory>(
      'nxtcm-dashboard/TotalClusters/TotalClusters/TotalClustersStory',
      { data: { total: 9999 } }
    );
    await expect(component.getByTestId('total-clusters')).toContainText('9999');
  });

  test('should call onViewMore when count is clicked', async ({ mount }) => {
    const component = await mount<typeof TotalClustersStory>(
      'nxtcm-dashboard/TotalClusters/TotalClusters/TotalClustersStory',
      {
        data: { total: 67 },
        onViewMore: true,
      }
    );
    await component.getByRole('button', { name: '67' }).click();
    await expect
      .poll(() =>
        component
          .getByTestId('onViewMore-calls')
          .evaluate((input: HTMLInputElement) => JSON.parse(input.value) as unknown[][])
      )
      .toHaveLength(1);
  });

  test('should show loading status and title without the count', async ({ mount }) => {
    const component = await mount<typeof TotalClustersStory>(
      'nxtcm-dashboard/TotalClusters/TotalClusters/TotalClustersStory',
      { isLoading: true }
    );
    await expect(component.getByText('Loading cluster count')).toBeVisible();
    await expect(component.getByTestId('total-clusters')).toBeHidden();
    await expect(component.getByTestId('total-clusters-title')).toBeVisible();
  });
});
