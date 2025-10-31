import { test, expect } from '@playwright/experimental-ct-react';
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

test.describe('ClusterRecommendations', () => {
  test('should render both Critical and RecommendationByCategory components', async ({ mount }) => {
    const component = await mount(<ClusterRecommendations {...defaultProps} />);

    // Check for Critical component
    await expect(component.getByTestId('critical-title')).toContainText('Critical recommendations');
    await expect(component.getByTestId('critical-count')).toContainText('25');

    // Check for RecommendationByCategory component
    await expect(component.getByTestId('recommendation-title')).toContainText(
      'Recommendation by Category'
    );
  });

  test('should display critical recommendations section with correct count', async ({ mount }) => {
    const component = await mount(<ClusterRecommendations {...defaultProps} />);

    await expect(component.getByTestId('critical-title')).toContainText('Critical recommendations');
    await expect(component.getByTestId('critical-count')).toContainText('25');
    await expect(component.getByTestId('critical-description')).toContainText(
      'Conditions that cause issues have been detected actively detected on your systems.'
    );
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

    await expect(component.getByTestId('serviceAvailability')).toContainText(
      'Service availability: 10'
    );
    await expect(component.getByTestId('performance')).toContainText('Performance: 20');
    await expect(component.getByTestId('security')).toContainText('Security: 15');
    await expect(component.getByTestId('faultTolerance')).toContainText('Fault tolerance: 5');
  });

  test('should call onCategoryClick when a category is clicked', async ({ mount }) => {
    let clickedCategory: Category | undefined;
    const handleCategoryClick = (category: Category) => {
      clickedCategory = category;
    };

    const component = await mount(
      <ClusterRecommendations {...defaultProps} onCategoryClick={handleCategoryClick} />
    );

    await component.getByTestId('performance').click();

    expect(clickedCategory).toBe('performance');
  });

  test('should render with different critical count', async ({ mount }) => {
    const component = await mount(<ClusterRecommendations {...defaultProps} count={100} />);

    await expect(component.getByTestId('critical-count')).toContainText('100');
  });

  test('should render with zero critical recommendations', async ({ mount }) => {
    const component = await mount(<ClusterRecommendations {...defaultProps} count={0} />);

    await expect(component.getByTestId('critical-count')).toContainText('0');
    await expect(component.getByTestId('critical-title')).toContainText('Critical recommendations');
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

    await expect(component.getByTestId('serviceAvailability')).toContainText(
      'Service availability: 50'
    );
    await expect(component.getByTestId('performance')).toContainText('Performance: 30');
    await expect(component.getByTestId('security')).toContainText('Security: 15');
    await expect(component.getByTestId('faultTolerance')).toContainText('Fault tolerance: 5');
  });

  test('should render critical icon', async ({ mount, page }) => {
    await mount(<ClusterRecommendations {...defaultProps} />);

    // Check that SVG icons are present
    const icons = page.locator('svg');
    expect(await icons.count()).toBeGreaterThan(0);
  });

  test('should have proper component structure with both sections', async ({ mount }) => {
    const component = await mount(<ClusterRecommendations {...defaultProps} />);

    // Verify both main sections exist
    await expect(component.getByTestId('critical-title')).toContainText('Critical recommendations');
    await expect(component.getByTestId('recommendation-title')).toContainText(
      'Recommendation by Category'
    );

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

    await component.getByTestId('serviceAvailability').click();
    await component.getByTestId('security').click();

    expect(clickCount).toBe(2);
    expect(categories).toEqual(['serviceAvailability', 'security']);
  });
});
