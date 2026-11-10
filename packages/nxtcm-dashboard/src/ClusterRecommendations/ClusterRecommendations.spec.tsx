import type { Locator } from '@playwright/test';

import { expect, MountResult, test } from '@/playwright/ct-fixture';
import { checkAccessibility } from '@/playwright/test-helpers';

import type { ClusterRecommendationsStory } from './ClusterRecommendations.story';

const defaultProps = {
  count: 25,
  serviceAvailability: 10,
  performance: 20,
  security: 15,
  faultTolerance: 5,
  onViewRecommendations: true,
  onCategoryClick: true,
};

const getCriticalCount = (component: MountResult, value: string): Locator => {
  return component.getByText(value, { exact: true });
};

test.describe('ClusterRecommendations', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount<typeof ClusterRecommendationsStory>(
      'nxtcm-dashboard/ClusterRecommendations/ClusterRecommendations/ClusterRecommendationsStory',
      { ...defaultProps }
    );
    await checkAccessibility({ component });
  });

  test('should render both Critical and RecommendationByCategory components', async ({ mount }) => {
    const component = await mount<typeof ClusterRecommendationsStory>(
      'nxtcm-dashboard/ClusterRecommendations/ClusterRecommendations/ClusterRecommendationsStory',
      { ...defaultProps }
    );

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
    const component = await mount<typeof ClusterRecommendationsStory>(
      'nxtcm-dashboard/ClusterRecommendations/ClusterRecommendations/ClusterRecommendationsStory',
      { ...defaultProps }
    );

    const viewButton = component.getByRole('button', { name: /View recommendations/i });
    await expect(viewButton).toBeVisible();
  });

  test('should call onViewRecommendations when View recommendations button is clicked', async ({
    mount,
  }) => {
    const component = await mount<typeof ClusterRecommendationsStory>(
      'nxtcm-dashboard/ClusterRecommendations/ClusterRecommendations/ClusterRecommendationsStory',
      {
        ...defaultProps,
        onViewRecommendations: true,
      }
    );

    await component.getByRole('button', { name: /View recommendations/i }).click();

    await expect
      .poll(() =>
        component
          .getByTestId('onViewRecommendations-calls')
          .evaluate((input: HTMLInputElement) => JSON.parse(input.value) as unknown[][])
      )
      .toHaveLength(1);
  });

  test('should display all category counts in RecommendationByCategory section', async ({
    mount,
  }) => {
    const component = await mount<typeof ClusterRecommendationsStory>(
      'nxtcm-dashboard/ClusterRecommendations/ClusterRecommendations/ClusterRecommendationsStory',
      { ...defaultProps }
    );

    await expect(component.getByText(/Service availability/)).toContainText('10');
    await expect(component.getByText(/Performance/)).toContainText('20');
    await expect(component.getByText(/Security/)).toContainText('15');
    await expect(component.getByText(/Fault tolerance/)).toContainText('5');
  });

  test('should call onCategoryClick when a category is clicked', async ({ mount }) => {
    const component = await mount<typeof ClusterRecommendationsStory>(
      'nxtcm-dashboard/ClusterRecommendations/ClusterRecommendations/ClusterRecommendationsStory',
      {
        ...defaultProps,
        onCategoryClick: true,
      }
    );
    //  Performance
    await component.getByRole('button', { name: /Performance/ }).click();

    await expect
      .poll(
        async () =>
          (
            await component
              .getByTestId('onCategoryClick-calls')
              .evaluate((input: HTMLInputElement) => JSON.parse(input.value) as unknown[][])
          )[0]?.[0]
      )
      .toBe('performance');
  });

  test('should render with different critical count', async ({ mount }) => {
    const component = await mount<typeof ClusterRecommendationsStory>(
      'nxtcm-dashboard/ClusterRecommendations/ClusterRecommendations/ClusterRecommendationsStory',
      { ...defaultProps, count: 100 }
    );
    const criticalCount = getCriticalCount(component, '100');

    await expect(criticalCount).toBeVisible();
  });

  test('should render with zero critical recommendations', async ({ mount }) => {
    const component = await mount<typeof ClusterRecommendationsStory>(
      'nxtcm-dashboard/ClusterRecommendations/ClusterRecommendations/ClusterRecommendationsStory',
      { ...defaultProps, count: 0 }
    );
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

    const component = await mount<typeof ClusterRecommendationsStory>(
      'nxtcm-dashboard/ClusterRecommendations/ClusterRecommendations/ClusterRecommendationsStory',
      { ...customProps }
    );
    await expect(component.getByText(/Service availability/)).toContainText('50');
    await expect(component.getByText(/Performance/)).toContainText('30');
    await expect(component.getByText(/Security/)).toContainText('15');
    await expect(component.getByText(/Fault tolerance/)).toContainText('5');
  });

  test('should render critical icons', async ({ mount, page }) => {
    await mount<typeof ClusterRecommendationsStory>(
      'nxtcm-dashboard/ClusterRecommendations/ClusterRecommendations/ClusterRecommendationsStory',
      { ...defaultProps }
    );

    // Decorative icons are intentionally hidden from the accessibility tree.
    const icons = page.locator('svg[role="img"]');
    await expect(icons).toHaveCount(5);
  });

  test('should have proper component structure with both sections', async ({ mount }) => {
    const component = await mount<typeof ClusterRecommendationsStory>(
      'nxtcm-dashboard/ClusterRecommendations/ClusterRecommendations/ClusterRecommendationsStory',
      { ...defaultProps }
    );

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
    const component = await mount<typeof ClusterRecommendationsStory>(
      'nxtcm-dashboard/ClusterRecommendations/ClusterRecommendations/ClusterRecommendationsStory',
      {
        ...defaultProps,
        onCategoryClick: true,
      }
    );

    await component.getByRole('button', { name: /Service availability/ }).click();
    await component.getByRole('button', { name: /Security/ }).click();

    await expect
      .poll(() =>
        component
          .getByTestId('onCategoryClick-calls')
          .evaluate((input: HTMLInputElement) => JSON.parse(input.value) as unknown[][])
      )
      .toEqual([['serviceAvailability'], ['security']]);
  });

  test('should render skeleton when isLoading is true', async ({ mount }) => {
    const component = await mount<typeof ClusterRecommendationsStory>(
      'nxtcm-dashboard/ClusterRecommendations/ClusterRecommendations/ClusterRecommendationsStory',
      { isLoading: true, ...defaultProps }
    );
    await expect(component.getByText('Loading cluster recommendations')).toBeVisible();
    await expect(component.getByRole('heading', { name: 'Critical recommendations' })).toBeHidden();
  });

  test('should render skeleton when isLoading is true without data', async ({ mount }) => {
    const component = await mount<typeof ClusterRecommendationsStory>(
      'nxtcm-dashboard/ClusterRecommendations/ClusterRecommendations/ClusterRecommendationsStory',
      {
        isLoading: true,
        onViewRecommendations: true,
        serviceAvailability: 0,
        performance: 0,
        security: 0,
        faultTolerance: 0,
        onCategoryClick: true,
      }
    );
    await expect(component.getByText('Loading cluster recommendations')).toBeVisible();
  });
});
