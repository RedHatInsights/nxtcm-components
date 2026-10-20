import { test, expect } from '@/ct-fixture';
import React from 'react';
import { UpgradeRisks } from './UpgradeRisks';
import { checkAccessibility } from '@/test-helpers';

test.describe('UpgradeRisks', () => {
  const defaultProps = {
    totalRisks: 45,
    criticalCount: 15,
    warningCount: 15,
    infoCount: 15,
  };

  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<UpgradeRisks {...defaultProps} />);
    await checkAccessibility({ component });
  });

  test('should render correctly with all props', async ({ mount }) => {
    const component = await mount(<UpgradeRisks {...defaultProps} />);
    await expect(component.getByTestId('total-risks')).toHaveText('45');
    await expect(component.getByTestId('criticalCount')).toHaveText('15');
    await expect(component.getByTestId('warningCount')).toHaveText('15');
    await expect(component.getByTestId('infoCount')).toHaveText('15');
    await expect(component.getByText('Critical', { exact: true })).toBeVisible();
    await expect(component.getByText('Warning', { exact: true })).toBeVisible();
    await expect(component.getByText('Info', { exact: true })).toBeVisible();
  });

  test('should not render View upgrade risks link when onViewRisks is not provided', async ({
    mount,
  }) => {
    const component = await mount(<UpgradeRisks {...defaultProps} />);

    await expect(component.getByText('View upgrade risks')).not.toBeVisible();
  });

  test('should call onViewRisks when link is clicked', async ({ mount }) => {
    let handleViewRisksCalled = false;
    const handleViewRisks = () => {
      handleViewRisksCalled = true;
    };
    const component = await mount(<UpgradeRisks {...defaultProps} onViewRisks={handleViewRisks} />);

    const viewLink = component.getByRole('button', { name: 'View upgrade risks' });
    await viewLink.click();

    expect(handleViewRisksCalled).toBe(true);
  });

  test('should display zero counts correctly', async ({ mount }) => {
    const component = await mount(
      <UpgradeRisks totalRisks={0} criticalCount={0} warningCount={0} infoCount={0} />
    );
    await expect(component.getByTestId('total-risks')).toHaveText('0');
    await expect(component.getByTestId('criticalCount')).toHaveText('0');
    await expect(component.getByTestId('warningCount')).toHaveText('0');
    await expect(component.getByTestId('infoCount')).toHaveText('0');
    await expect(component.getByText('Critical', { exact: true })).toBeVisible();
    await expect(component.getByText('Warning', { exact: true })).toBeVisible();
    await expect(component.getByText('Info', { exact: true })).toBeVisible();
  });

  test('should display different counts for each risk type', async ({ mount }) => {
    const component = await mount(
      <UpgradeRisks totalRisks={50} criticalCount={35} warningCount={10} infoCount={5} />
    );
    await expect(component.getByTestId('total-risks')).toHaveText('50');
    await expect(component.getByTestId('criticalCount')).toHaveText('35');
    await expect(component.getByTestId('warningCount')).toHaveText('10');
    await expect(component.getByTestId('infoCount')).toHaveText('5');
    await expect(component.getByText('Critical', { exact: true })).toBeVisible();
    await expect(component.getByText('Warning', { exact: true })).toBeVisible();
    await expect(component.getByText('Info', { exact: true })).toBeVisible();
  });

  test('should render skeleton when isLoading is true', async ({ mount }) => {
    const component = await mount(<UpgradeRisks isLoading {...defaultProps} />);
    await expect(component.getByText('Loading upgrade risks')).toBeVisible();
    await expect(component.getByTestId('total-risks')).not.toBeVisible();
  });

  test('should render skeleton when isLoading is true without data', async ({ mount }) => {
    const component = await mount(<UpgradeRisks isLoading />);
    await expect(component.getByText('Loading upgrade risks')).toBeVisible();
  });
});
