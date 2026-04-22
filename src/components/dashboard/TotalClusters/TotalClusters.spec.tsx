import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { TotalClusters } from './TotalClusters';
import { checkAccessibility } from '../../../test-helpers';

test.describe('TotalClusters', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<TotalClusters data={{ total: 67 }} />);
    await checkAccessibility({ component });
  });

  test('should display the total cluster count', async ({ mount }) => {
    const component = await mount(<TotalClusters data={{ total: 67 }} />);
    await expect(component.getByTestId('total-clusters')).toContainText('67');
  });

  test('should render the default title', async ({ mount }) => {
    const component = await mount(<TotalClusters data={{ total: 67 }} />);
    const title = component.getByTestId('total-clusters-title');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('Total clusters');
  });

  test('should display the total label', async ({ mount }) => {
    const component = await mount(<TotalClusters data={{ total: 67 }} />);
    await expect(component.getByText('managed clusters')).toBeVisible();
  });

  test('should render with zero total', async ({ mount }) => {
    const component = await mount(<TotalClusters data={{ total: 0 }} />);
    await expect(component.getByTestId('total-clusters')).toContainText('0');
  });

  test('should render with high counts', async ({ mount }) => {
    const component = await mount(<TotalClusters data={{ total: 9999 }} />);
    await expect(component.getByTestId('total-clusters')).toContainText('9999');
  });

  test('should not show "View all clusters" button when onViewMore is not provided', async ({
    mount,
  }) => {
    const component = await mount(<TotalClusters data={{ total: 67 }} />);
    await expect(component.getByRole('button', { name: /View all clusters/i })).not.toBeVisible();
  });

  test('should show "View all clusters" button when onViewMore is provided', async ({ mount }) => {
    const component = await mount(<TotalClusters data={{ total: 67 }} onViewMore={() => {}} />);
    const viewButton = component.getByRole('button', { name: /View all clusters/i });
    await expect(viewButton).toBeVisible();
  });

  test('should call onViewMore when button is clicked', async ({ mount }) => {
    let viewMoreCalled = false;
    const component = await mount(
      <TotalClusters
        data={{ total: 67 }}
        onViewMore={() => {
          viewMoreCalled = true;
        }}
      />
    );
    await component.getByRole('button', { name: /View all clusters/i }).click();
    expect(viewMoreCalled).toBe(true);
  });
});
