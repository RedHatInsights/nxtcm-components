import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { ClusterProviders, ProviderBreakdown } from './ClusterProviders';
import { checkAccessibility } from '../../../test-helpers';

const defaultProviders: ProviderBreakdown[] = [
  { label: 'ROSA', count: 42 },
  { label: 'ARO', count: 15 },
  { label: 'OSD', count: 10 },
];

test.describe('ClusterProviders', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<ClusterProviders providers={defaultProviders} />);
    await checkAccessibility({ component });
  });

  test('should render the default title', async ({ mount }) => {
    const component = await mount(<ClusterProviders providers={defaultProviders} />);
    const title = component.getByTestId('providers-title');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('Clusters by provider');
  });

  test('should render a custom title', async ({ mount }) => {
    const component = await mount(
      <ClusterProviders providers={defaultProviders} title="Provider breakdown" />
    );
    await expect(component.getByTestId('providers-title')).toHaveText('Provider breakdown');
  });

  test('should render the donut chart', async ({ mount }) => {
    const component = await mount(<ClusterProviders providers={defaultProviders} />);
    await expect(component.getByTestId('providers-chart')).toBeVisible();
  });

  test('should render legend items with counts', async ({ mount }) => {
    const component = await mount(<ClusterProviders providers={defaultProviders} />);
    const legend = component.getByTestId('providers-legend');
    await expect(legend.getByText('ROSA: 42')).toBeVisible();
    await expect(legend.getByText('ARO: 15')).toBeVisible();
    await expect(legend.getByText('OSD: 10')).toBeVisible();
  });

  test('should handle a single provider', async ({ mount }) => {
    const component = await mount(<ClusterProviders providers={[{ label: 'ROSA', count: 25 }]} />);
    await expect(component.getByText('ROSA: 25')).toBeVisible();
  });

  test('should handle four or more providers', async ({ mount }) => {
    const providers: ProviderBreakdown[] = [
      { label: 'ROSA', count: 40 },
      { label: 'ARO', count: 30 },
      { label: 'OSD', count: 20 },
      { label: 'Other', count: 10 },
    ];
    const component = await mount(<ClusterProviders providers={providers} />);
    const legend = component.getByTestId('providers-legend');
    await expect(legend.getByText('ROSA: 40')).toBeVisible();
    await expect(legend.getByText('ARO: 30')).toBeVisible();
    await expect(legend.getByText('OSD: 20')).toBeVisible();
    await expect(legend.getByText('Other: 10')).toBeVisible();
  });

  test('should handle zero counts', async ({ mount }) => {
    const providers: ProviderBreakdown[] = [
      { label: 'ROSA', count: 0 },
      { label: 'ARO', count: 0 },
    ];
    const component = await mount(<ClusterProviders providers={providers} />);
    await expect(component.getByText('ROSA: 0')).toBeVisible();
    await expect(component.getByText('ARO: 0')).toBeVisible();
  });
});
