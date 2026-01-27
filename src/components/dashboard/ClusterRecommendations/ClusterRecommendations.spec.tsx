import { test, expect, MountResult } from '@playwright/experimental-ct-react';
import React from 'react';
import { ClusterRecommendations } from './ClusterRecommendations';
import { Category } from './RecommendationByCategory';

const defaultProps = {
  count: 25,
  serviceAvailability: 10,
  performance: 20,
  security: 15,
  faultTolerance: 5,
  onViewRecommendations: () => {},
  onCategoryClick: () => {},
};

const getCriticalCount = (component: MountResult, value: string) => {
  return component
    .locator('text="Critical recommendations"')
    .locator('..') // go up one level
    .locator('..') // go to parent div
    .getByText(value);
};

test.describe('ClusterRecommendations', () => {
  test('should render both Critical and RecommendationByCategory components', async ({ mount }) => {
    const component = await mount(<ClusterRecommendations {...defaultProps} />);

    // Check for Critical component
    await expect(
      component.getByRole('heading', { name: 'Critical recommendations' })
    ).toBeVisible();

    const criticalCount = getCriticalCount(component, '25');
    await expect(criticalCount).toBeVisible();

    // Check for RecommendationByCategory component
    await expect(
      component.getByRole('heading', { name: 'Recommendation by Category' })
    ).toBeVisible();
  });

  test('should display View recommendations button', async ({ mount }) => {
    const component = await mount(<ClusterRecommendations {...defaultProps} />);

    const viewButton = component.getByRole('button', { name: /View recommendations/i });
    await expect(viewButton).toBeVisible();
  });

  test('should call onViewRecommendations when View recommendations button is clicked', async ({
    mount,
  }) => {
    let onViewRecommendationsCalled = false;
    const handleViewRecommendations = () => {
      onViewRecommendationsCalled = true;
    };

    const component = await mount(
      <ClusterRecommendations {...defaultProps} onViewRecommendations={handleViewRecommendations} />
    );

    await component.getByRole('button', { name: /View recommendations/i }).click();

    expect(onViewRecommendationsCalled).toBe(true);
  });

  test('should display all category counts in RecommendationByCategory section', async ({
    mount,
  }) => {
    const component = await mount(<ClusterRecommendations {...defaultProps} />);

    await expect(component.getByText(/Service availability/)).toContainText('10');
    await expect(component.getByText(/Performance/)).toContainText('20');
    await expect(component.getByText(/Security/)).toContainText('15');
    await expect(component.getByText(/Fault tolerance/)).toContainText('5');
  });

  test('should call onCategoryClick when a category is clicked', async ({ mount }) => {
    let clickedCategory: Category | undefined;
    const handleCategoryClick = (category: Category) => {
      clickedCategory = category;
    };

    const component = await mount(
      <ClusterRecommendations {...defaultProps} onCategoryClick={handleCategoryClick} />
    );
    //  Performance
    await component.getByRole('button', { name: /Performance/ }).click();

    expect(clickedCategory).toBe('performance');
  });

  test('should render with different critical count', async ({ mount }) => {
    const component = await mount(<ClusterRecommendations {...defaultProps} count={100} />);
    const criticalCount = getCriticalCount(component, '100');

    await expect(criticalCount).toBeVisible();
  });

  test('should render with zero critical recommendations', async ({ mount }) => {
    const component = await mount(<ClusterRecommendations {...defaultProps} count={0} />);
    const criticalCount = getCriticalCount(component, '0');
    await expect(criticalCount).toBeVisible();

    await expect(
      component.getByRole('heading', { name: 'Critical recommendations' })
    ).toBeVisible();
  });

  test('should render with different category values', async ({ mount }) => {
    const customProps = {
      ...defaultProps,
      serviceAvailability: 50,
      performance: 30,
      security: 15,
      faultTolerance: 5,
    };

    const component = await mount(<ClusterRecommendations {...customProps} />);
    await expect(component.getByText(/Service availability/)).toContainText('50');
    await expect(component.getByText(/Performance/)).toContainText('30');
    await expect(component.getByText(/Security/)).toContainText('15');
    await expect(component.getByText(/Fault tolerance/)).toContainText('5');
  });

  test('should render critical icons', async ({ mount, page }) => {
    await mount(<ClusterRecommendations {...defaultProps} />);

    // NOTE svgs are hidden so won't be picked up by .getByRole('img')
    // I'm not sure this test is providing any value
    const icons = page.locator('svg[role="img"]');
    expect(await icons.count()).toBe(5);
  });

  test('should have proper component structure with both sections', async ({ mount }) => {
    const component = await mount(<ClusterRecommendations {...defaultProps} />);

    // Verify both main sections exist
    await expect(
      component.getByRole('heading', { name: 'Critical recommendations' })
    ).toBeVisible();
    await expect(
      component.getByRole('heading', { name: 'Recommendation by Category' })
    ).toBeVisible();

    // Verify the button exists
    await expect(component.getByRole('button', { name: /View recommendations/i })).toBeVisible();
  });

  test('should handle multiple category clicks', async ({ mount }) => {
    let clickCount = 0;
    const categories: Category[] = [];
    const handleCategoryClick = (category: Category) => {
      clickCount++;
      categories.push(category);
    };

    const component = await mount(
      <ClusterRecommendations {...defaultProps} onCategoryClick={handleCategoryClick} />
    );

    await component.getByRole('button', { name: /Service availability/ }).click();
    await component.getByRole('button', { name: /Security/ }).click();

    expect(clickCount).toBe(2);
    expect(categories).toEqual(['serviceAvailability', 'security']);
  });
});
