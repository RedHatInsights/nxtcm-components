import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { AdvisorRecommendations, AdvisorRecommendationsData } from './AdvisorRecommendations';
import { checkAccessibility } from '../../../test-helpers';

const defaultData: AdvisorRecommendationsData = {
  severity: {
    critical: 3,
    important: 7,
    moderate: 15,
    low: 2,
  },
  categories: {
    serviceAvailability: 25,
    performance: 8,
    security: 12,
    faultTolerance: 4,
  },
};

test.describe('AdvisorRecommendations', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(
      <AdvisorRecommendations data={defaultData} onViewMore={() => {}} />
    );
    await checkAccessibility({ component });
  });

  test('should render all four severity counts', async ({ mount }) => {
    const component = await mount(<AdvisorRecommendations data={defaultData} />);
    await expect(component.getByTestId('severity-count-critical')).toHaveText('3');
    await expect(component.getByTestId('severity-count-important')).toHaveText('7');
    await expect(component.getByTestId('severity-count-moderate')).toHaveText('15');
    await expect(component.getByTestId('severity-count-low')).toHaveText('2');
  });

  test('should render severity labels', async ({ mount }) => {
    const component = await mount(<AdvisorRecommendations data={defaultData} />);
    await expect(component.getByText('Critical')).toBeVisible();
    await expect(component.getByText('Important')).toBeVisible();
    await expect(component.getByText('Moderate')).toBeVisible();
    await expect(component.getByText('Low')).toBeVisible();
  });

  test('should render severity icons', async ({ mount }) => {
    const component = await mount(<AdvisorRecommendations data={defaultData} />);
    await expect(component.getByTestId('severity-icon-critical')).toBeVisible();
    await expect(component.getByTestId('severity-icon-important')).toBeVisible();
    await expect(component.getByTestId('severity-icon-moderate')).toBeVisible();
    await expect(component.getByTestId('severity-icon-low')).toBeVisible();
  });

  test('should render the category section title', async ({ mount }) => {
    const component = await mount(<AdvisorRecommendations data={defaultData} />);
    const title = component.getByTestId('category-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText('Recommendations by category');
  });

  test('should render the category chart', async ({ mount }) => {
    const component = await mount(<AdvisorRecommendations data={defaultData} />);
    await expect(component.getByTestId('category-chart')).toBeVisible();
  });

  test('should render all category legend items with counts', async ({ mount }) => {
    const component = await mount(<AdvisorRecommendations data={defaultData} />);
    await expect(component.getByText('Service availability: 25')).toBeVisible();
    await expect(component.getByText('Performance: 8')).toBeVisible();
    await expect(component.getByText('Security: 12')).toBeVisible();
    await expect(component.getByText('Fault tolerance: 4')).toBeVisible();
  });

  test('should render a divider between severity and categories', async ({ mount }) => {
    const component = await mount(<AdvisorRecommendations data={defaultData} />);
    const divider = component.locator('hr');
    await expect(divider).toBeVisible();
  });

  test('should render the view more link when onViewMore is provided', async ({ mount }) => {
    let clicked = false;
    const component = await mount(
      <AdvisorRecommendations
        data={defaultData}
        onViewMore={() => {
          clicked = true;
        }}
      />
    );
    const link = component.getByTestId('view-more-link');
    await expect(link).toBeVisible();
    await expect(link).toHaveText('View more in Red Hat Advisor');
    await link.click();
    expect(clicked).toBe(true);
  });

  test('should not render the view more link when onViewMore is omitted', async ({ mount }) => {
    const component = await mount(<AdvisorRecommendations data={defaultData} />);
    await expect(component.getByTestId('view-more-link')).toHaveCount(0);
  });

  test('should handle all-zero severity counts', async ({ mount }) => {
    const zeroData: AdvisorRecommendationsData = {
      ...defaultData,
      severity: { critical: 0, important: 0, moderate: 0, low: 0 },
    };
    const component = await mount(<AdvisorRecommendations data={zeroData} />);
    await expect(component.getByTestId('severity-count-critical')).toHaveText('0');
    await expect(component.getByTestId('severity-count-important')).toHaveText('0');
    await expect(component.getByTestId('severity-count-moderate')).toHaveText('0');
    await expect(component.getByTestId('severity-count-low')).toHaveText('0');
  });

  test('should handle all-zero category counts', async ({ mount }) => {
    const zeroData: AdvisorRecommendationsData = {
      ...defaultData,
      categories: { serviceAvailability: 0, performance: 0, security: 0, faultTolerance: 0 },
    };
    const component = await mount(<AdvisorRecommendations data={zeroData} />);
    await expect(component.getByText('Service availability: 0')).toBeVisible();
    await expect(component.getByText('Performance: 0')).toBeVisible();
    await expect(component.getByText('Security: 0')).toBeVisible();
    await expect(component.getByText('Fault tolerance: 0')).toBeVisible();
  });

  test('should handle large counts', async ({ mount }) => {
    const largeData: AdvisorRecommendationsData = {
      severity: { critical: 500, important: 2000, moderate: 9999, low: 123 },
      categories: {
        serviceAvailability: 5000,
        performance: 3000,
        security: 2500,
        faultTolerance: 1500,
      },
    };
    const component = await mount(<AdvisorRecommendations data={largeData} />);
    await expect(component.getByTestId('severity-count-critical')).toHaveText('500');
    await expect(component.getByTestId('severity-count-important')).toHaveText('2000');
    await expect(component.getByText('Service availability: 5000')).toBeVisible();
  });

  test('should render the default card title', async ({ mount }) => {
    const component = await mount(<AdvisorRecommendations data={defaultData} />);
    const title = component.getByTestId('card-title');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('Advisor recommendations by severity');
  });

  test('should render a custom card title', async ({ mount }) => {
    const component = await mount(
      <AdvisorRecommendations data={defaultData} title="Custom title" />
    );
    await expect(component.getByTestId('card-title')).toHaveText('Custom title');
  });

  test('should hide the card title when title is empty', async ({ mount }) => {
    const component = await mount(<AdvisorRecommendations data={defaultData} title="" />);
    await expect(component.getByTestId('card-title')).toHaveCount(0);
  });

  test('should render the lightspeed badge inline with the title by default', async ({ mount }) => {
    const component = await mount(<AdvisorRecommendations data={defaultData} />);
    const badge = component.getByTestId('lightspeed-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('Powered by Red Hat Lightspeed');
  });

  test('should hide the lightspeed badge when showLightspeedBadge is false', async ({ mount }) => {
    const component = await mount(
      <AdvisorRecommendations data={defaultData} showLightspeedBadge={false} />
    );
    await expect(component.getByTestId('lightspeed-badge')).toHaveCount(0);
  });
});
