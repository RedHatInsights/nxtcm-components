import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { AdvisorCategories, CategoryCounts } from './AdvisorCategories';
import { checkAccessibility } from '../../../test-helpers';

const defaultCategories: CategoryCounts = {
  serviceAvailability: 25,
  performance: 8,
  security: 12,
  faultTolerance: 4,
};

test.describe('AdvisorCategories', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<AdvisorCategories categories={defaultCategories} />);
    await checkAccessibility({ component });
  });

  test('should render the default title', async ({ mount }) => {
    const component = await mount(<AdvisorCategories categories={defaultCategories} />);
    const title = component.getByTestId('category-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText('Advisor recommendations by category');
  });

  test('should render a custom title', async ({ mount }) => {
    const component = await mount(
      <AdvisorCategories categories={defaultCategories} title="Issue categories" />
    );
    await expect(component.getByTestId('category-title')).toHaveText('Issue categories');
  });

  test('should render the category chart', async ({ mount }) => {
    const component = await mount(<AdvisorCategories categories={defaultCategories} />);
    await expect(component.getByTestId('category-chart')).toBeVisible();
  });

  test('should render all category legend items with counts', async ({ mount }) => {
    const component = await mount(<AdvisorCategories categories={defaultCategories} />);
    await expect(component.getByText('Service availability: 25')).toBeVisible();
    await expect(component.getByText('Performance: 8')).toBeVisible();
    await expect(component.getByText('Security: 12')).toBeVisible();
    await expect(component.getByText('Fault tolerance: 4')).toBeVisible();
  });

  test('should handle all-zero category counts', async ({ mount }) => {
    const component = await mount(
      <AdvisorCategories
        categories={{ serviceAvailability: 0, performance: 0, security: 0, faultTolerance: 0 }}
      />
    );
    await expect(component.getByText('Service availability: 0')).toBeVisible();
    await expect(component.getByText('Performance: 0')).toBeVisible();
    await expect(component.getByText('Security: 0')).toBeVisible();
    await expect(component.getByText('Fault tolerance: 0')).toBeVisible();
  });

  test('should handle large counts', async ({ mount }) => {
    const component = await mount(
      <AdvisorCategories
        categories={{
          serviceAvailability: 5000,
          performance: 3000,
          security: 2500,
          faultTolerance: 1500,
        }}
      />
    );
    await expect(component.getByText('Service availability: 5000')).toBeVisible();
    await expect(component.getByText('Performance: 3000')).toBeVisible();
  });
});
