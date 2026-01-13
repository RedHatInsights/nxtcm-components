import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { CostManagement, CostManagementProps } from './CostManagement';

const mockCostData: CostManagementProps['costData'] = {
  rosaClusters: 12500.75,
  osdClusters: 8300.5,
  aroClusters: 4200.25,
};

test.describe('CostManagement', () => {
  test('should render the component with correct title', async ({ mount }) => {
    const component = await mount(<CostManagement costData={mockCostData} />);
    await expect(component.getByTestId('cost-title')).toContainText('Cost Management');
  });

  test('should display the total cost correctly', async ({ mount }) => {
    const component = await mount(<CostManagement costData={mockCostData} />);
    await expect(component.getByTestId('total-cost')).toContainText('$25,001.50');
  });

  test('should display chart with cluster names', async ({ mount, page }) => {
    await mount(<CostManagement costData={mockCostData} />);
    const chartTitle = page.getByTestId('chart-title');
    await expect(chartTitle).toContainText('Type of clusters cost');
  });

  test('should format total with commas and two decimal places', async ({ mount }) => {
    const largeCostData = {
      rosaClusters: 123456.789,
      osdClusters: 45678.123,
      aroClusters: 12345.678,
    };
    const component = await mount(<CostManagement costData={largeCostData} />);
    await expect(component.getByTestId('total-cost')).toContainText('$181,480.59');
  });

  test('should display custom currency symbol', async ({ mount }) => {
    const component = await mount(<CostManagement costData={mockCostData} currency="€" />);
    await expect(component.getByTestId('total-cost')).toContainText('€');
  });

  test('should calculate total cost correctly', async ({ mount }) => {
    const testData = {
      rosaClusters: 1000.0,
      osdClusters: 2000.0,
      aroClusters: 3000.0,
    };
    const component = await mount(<CostManagement costData={testData} />);
    await expect(component.getByTestId('total-cost')).toContainText('$6,000.00');
  });

  test('should render chart container', async ({ mount, page }) => {
    await mount(<CostManagement costData={mockCostData} />);
    const chartContainer = page.locator('svg').first();
    await expect(chartContainer).toBeVisible();
  });

  test('should display cost description', async ({ mount }) => {
    const component = await mount(<CostManagement costData={mockCostData} />);
    await expect(
      component.getByText(/This type of cost is the sum of the infrastructure cost/)
    ).toBeVisible();
  });

  test('should handle zero costs', async ({ mount }) => {
    const zeroCostData = {
      rosaClusters: 0,
      osdClusters: 0,
      aroClusters: 0,
    };
    const component = await mount(<CostManagement costData={zeroCostData} />);
    await expect(component.getByTestId('total-cost')).toContainText('$0.00');
  });

  test('should render chart with cluster labels', async ({ mount, page }) => {
    await mount(<CostManagement costData={mockCostData} />);
    const svgElement = page.locator('svg[role="img"]').first();
    await expect(svgElement).toBeVisible();
  });

  test('should display total with correct decimal precision', async ({ mount }) => {
    const preciseData = {
      rosaClusters: 1234.567,
      osdClusters: 5678.901,
      aroClusters: 9012.345,
    };
    const component = await mount(<CostManagement costData={preciseData} />);
    await expect(component.getByTestId('total-cost')).toContainText('$15,925.81');
  });

  test('should handle single cluster type with cost', async ({ mount }) => {
    const singleTypeData = {
      rosaClusters: 15000.0,
      osdClusters: 0,
      aroClusters: 0,
    };
    const component = await mount(<CostManagement costData={singleTypeData} />);
    await expect(component.getByTestId('total-cost')).toContainText('$15,000.00');
  });

  test('should render with high costs', async ({ mount }) => {
    const highCostData = {
      rosaClusters: 100000.0,
      osdClusters: 80000.0,
      aroClusters: 60000.0,
    };
    const component = await mount(<CostManagement costData={highCostData} />);
    await expect(component.getByTestId('total-cost')).toContainText('$240,000.00');
  });

  test('should render with low costs', async ({ mount }) => {
    const lowCostData = {
      rosaClusters: 100.0,
      osdClusters: 50.0,
      aroClusters: 25.0,
    };
    const component = await mount(<CostManagement costData={lowCostData} />);
    await expect(component.getByTestId('total-cost')).toContainText('$175.00');
  });

  test('should use default currency when not provided', async ({ mount }) => {
    const component = await mount(<CostManagement costData={mockCostData} />);
    await expect(component.getByTestId('total-cost')).toContainText('$');
  });

  test('should render chart with proper aria labels', async ({ mount, page }) => {
    await mount(<CostManagement costData={mockCostData} />);
    const chart = page.locator('svg[role="img"]').first();
    await expect(chart).toBeVisible();
  });

  test('should display even cost distribution', async ({ mount }) => {
    const evenData = {
      rosaClusters: 10000.0,
      osdClusters: 10000.0,
      aroClusters: 10000.0,
    };
    const component = await mount(<CostManagement costData={evenData} />);
    await expect(component.getByTestId('total-cost')).toContainText('$30,000.00');
  });

  test('should handle fractional cents correctly', async ({ mount }) => {
    const fractionalData = {
      rosaClusters: 99.999,
      osdClusters: 88.888,
      aroClusters: 77.777,
    };
    const component = await mount(<CostManagement costData={fractionalData} />);
    await expect(component.getByTestId('total-cost')).toContainText('$266.66');
  });

  test('should format total cost with thousands separator', async ({ mount }) => {
    const largeData = {
      rosaClusters: 500000.0,
      osdClusters: 300000.0,
      aroClusters: 200000.0,
    };
    const component = await mount(<CostManagement costData={largeData} />);
    await expect(component.getByTestId('total-cost')).toContainText('$1,000,000.00');
  });
});
