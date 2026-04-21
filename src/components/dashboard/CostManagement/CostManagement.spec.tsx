import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { CostManagement, CostManagementProps } from './CostManagement';

const sampleClusters: CostManagementProps['clusters'] = [
  { id: 'prod-east-1', name: 'prod-east-1', cost: 700 },
  { id: 'prod-west-2', name: 'prod-west-2', cost: 2300 },
];

test.describe('CostManagement', () => {
  test('renders the title', async ({ mount }) => {
    const component = await mount(<CostManagement totalCost={3000} clusters={sampleClusters} />);
    await expect(component.getByRole('heading', { name: 'Cost Management' })).toBeVisible();
  });

  test('displays the formatted total cost', async ({ mount }) => {
    const component = await mount(<CostManagement totalCost={3000} clusters={sampleClusters} />);
    await expect(component.getByTestId('total-cost')).toContainText('$3,000.00');
  });

  test('displays month-to-date label', async ({ mount }) => {
    const component = await mount(<CostManagement totalCost={3000} clusters={sampleClusters} />);
    await expect(component.getByText('Month-to-date cost')).toBeVisible();
  });

  test('displays top clusters heading', async ({ mount }) => {
    const component = await mount(<CostManagement totalCost={3000} clusters={sampleClusters} />);
    await expect(component.getByText('Top clusters')).toBeVisible();
  });

  test('renders cluster names', async ({ mount }) => {
    const component = await mount(<CostManagement totalCost={3000} clusters={sampleClusters} />);
    await expect(component.getByTestId('cluster-name-prod-east-1')).toContainText('prod-east-1');
    await expect(component.getByTestId('cluster-name-prod-west-2')).toContainText('prod-west-2');
  });

  test('renders cluster costs with percentages', async ({ mount }) => {
    const component = await mount(<CostManagement totalCost={3000} clusters={sampleClusters} />);
    // 700/3000 = 23%, 2300/3000 = 77%
    await expect(component.getByTestId('cluster-cost-prod-east-1')).toContainText('$700.00');
    await expect(component.getByTestId('cluster-cost-prod-east-1')).toContainText('23%');
    await expect(component.getByTestId('cluster-cost-prod-west-2')).toContainText('$2,300.00');
    await expect(component.getByTestId('cluster-cost-prod-west-2')).toContainText('77%');
  });

  test('renders cluster names as links when onClusterClick is provided', async ({ mount }) => {
    const clicks: string[] = [];
    const component = await mount(
      <CostManagement
        totalCost={3000}
        clusters={sampleClusters}
        onClusterClick={(c) => clicks.push(c.id)}
      />
    );
    const link = component.getByRole('button', { name: 'prod-east-1' });
    await expect(link).toBeVisible();
  });

  test('renders cluster names as plain text without onClusterClick', async ({ mount }) => {
    const component = await mount(<CostManagement totalCost={3000} clusters={sampleClusters} />);
    await expect(component.getByTestId('cluster-name-prod-east-1')).toContainText('prod-east-1');
    await expect(component.getByRole('button', { name: 'prod-east-1' })).toHaveCount(0);
  });

  test('shows "View more in Cost Management" link when onViewMore is set', async ({ mount }) => {
    const component = await mount(
      <CostManagement totalCost={3000} clusters={sampleClusters} onViewMore={() => {}} />
    );
    await expect(
      component.getByRole('button', { name: 'View more in Cost Management' })
    ).toBeVisible();
  });

  test('hides "View more" link when onViewMore is not set', async ({ mount }) => {
    const component = await mount(<CostManagement totalCost={3000} clusters={sampleClusters} />);
    await expect(
      component.getByRole('button', { name: 'View more in Cost Management' })
    ).toHaveCount(0);
  });

  test('renders a divider between total cost and clusters', async ({ mount }) => {
    const component = await mount(<CostManagement totalCost={3000} clusters={sampleClusters} />);
    await expect(component.getByRole('separator')).toBeVisible();
  });

  test('hides cluster list and divider when clusters is empty', async ({ mount }) => {
    const component = await mount(<CostManagement totalCost={0} clusters={[]} />);
    await expect(component.getByTestId('cluster-list')).toHaveCount(0);
    await expect(component.getByText('Top clusters')).toHaveCount(0);
    await expect(component.getByRole('separator')).toHaveCount(0);
  });

  test('supports custom currency', async ({ mount }) => {
    const component = await mount(
      <CostManagement totalCost={3000} clusters={sampleClusters} currency="EUR" />
    );
    await expect(component.getByTestId('total-cost')).toContainText('€3,000.00');
  });

  test('handles zero total cost without division errors', async ({ mount }) => {
    const clusters = [{ id: 'a', name: 'cluster-a', cost: 0 }];
    const component = await mount(<CostManagement totalCost={0} clusters={clusters} />);
    await expect(component.getByTestId('cluster-cost-a')).toContainText('$0.00');
    await expect(component.getByTestId('cluster-cost-a')).toContainText('0%');
  });

  test('formats large costs with thousands separators', async ({ mount }) => {
    const component = await mount(
      <CostManagement
        totalCost={1000000}
        clusters={[{ id: 'big', name: 'big-cluster', cost: 500000 }]}
      />
    );
    await expect(component.getByTestId('total-cost')).toContainText('$1,000,000.00');
    await expect(component.getByTestId('cluster-cost-big')).toContainText('$500,000.00');
    await expect(component.getByTestId('cluster-cost-big')).toContainText('50%');
  });
});
