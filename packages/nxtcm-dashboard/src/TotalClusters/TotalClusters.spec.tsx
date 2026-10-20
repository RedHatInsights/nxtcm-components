import { test, expect } from '@/ct-fixture';
import React from 'react';
import { TotalClusters } from './TotalClusters';
import { checkAccessibility } from '@/test-helpers';

test.describe('TotalClusters', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<TotalClusters data={{ total: 67 }} />);
    await checkAccessibility({ component });
  });

  test('should display the default cluster summary without a count action', async ({ mount }) => {
    const component = await mount(<TotalClusters data={{ total: 67 }} />);
    await expect(component.getByTestId('total-clusters')).toContainText('67');
    const title = component.getByTestId('total-clusters-title');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('Total clusters');
    await expect(component.getByText('managed clusters')).toBeVisible();
    await expect(component.getByRole('button', { name: '67' })).not.toBeVisible();
  });

  test('should render with zero total', async ({ mount }) => {
    const component = await mount(<TotalClusters data={{ total: 0 }} />);
    await expect(component.getByTestId('total-clusters')).toContainText('0');
  });

  test('should render with high counts', async ({ mount }) => {
    const component = await mount(<TotalClusters data={{ total: 9999 }} />);
    await expect(component.getByTestId('total-clusters')).toContainText('9999');
  });

  test('should call onViewMore when count is clicked', async ({ mount }) => {
    let viewMoreCalled = false;
    const component = await mount(
      <TotalClusters
        data={{ total: 67 }}
        onViewMore={() => {
          viewMoreCalled = true;
        }}
      />
    );
    await component.getByRole('button', { name: '67' }).click();
    expect(viewMoreCalled).toBe(true);
  });

  test('should show loading status and title without the count', async ({ mount }) => {
    const component = await mount(<TotalClusters isLoading />);
    await expect(component.getByText('Loading cluster count')).toBeVisible();
    await expect(component.getByTestId('total-clusters')).not.toBeVisible();
    await expect(component.getByTestId('total-clusters-title')).toBeVisible();
  });
});
