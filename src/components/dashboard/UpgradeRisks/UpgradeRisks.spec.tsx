import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { UpgradeRisks } from './UpgradeRisks';

test.describe('UpgradeRisks', () => {
  const defaultProps = {
    totalRisks: 45,
    criticalCount: 15,
    warningCount: 15,
    infoCount: 15,
  };

  test('renders correctly with all props', async ({ mount }) => {
    const component = await mount(<UpgradeRisks {...defaultProps} />);

    await expect(component.getByTestId('header')).toContainText('Upgrade risks');
    await expect(component.getByTestId('total-risks')).toContainText('45');
    await expect(component.getByTestId('criticalCount')).toContainText('15');
  });

  test('displays correct risk counts', async ({ mount }) => {
    const component = await mount(<UpgradeRisks {...defaultProps} />);

    const counts = component.getByText('15');
    await expect(counts).toHaveCount(3); // Critical, Warning, Info
  });

  test('renders View upgrade risks link when onViewRisks is provided', async ({ mount }) => {
    let handleViewRisksCalled = false;
    const handleViewRisks = () => {
      handleViewRisksCalled = true;
    };
    const component = await mount(<UpgradeRisks {...defaultProps} onViewRisks={handleViewRisks} />);

    const viewLink = component.getByText('View upgrade risks');
    await expect(viewLink).toBeVisible();
    await viewLink.click();
    expect(handleViewRisksCalled).toBe(true);
  });

  test('does not render View upgrade risks link when onViewRisks is not provided', async ({
    mount,
  }) => {
    const component = await mount(<UpgradeRisks {...defaultProps} />);

    await expect(component.getByText('View upgrade risks')).not.toBeVisible();
  });

  test('calls onViewRisks when link is clicked', async ({ mount }) => {
    let handleViewRisksCalled = false;
    const handleViewRisks = () => {
      handleViewRisksCalled = true;
    };
    const component = await mount(<UpgradeRisks {...defaultProps} onViewRisks={handleViewRisks} />);

    const viewLink = component.getByText('View upgrade risks');
    await viewLink.click();

    expect(handleViewRisksCalled).toBe(true);
  });

  test('applies custom className when provided', async ({ mount, page }) => {
    await mount(<UpgradeRisks {...defaultProps} className="custom-class" />);

    const card = page.locator('.custom-class');
    await expect(card).toBeVisible();
  });

  test('displays zero counts correctly', async ({ mount }) => {
    const component = await mount(
      <UpgradeRisks totalRisks={0} criticalCount={0} warningCount={0} infoCount={0} />
    );

    const zeroCounts = component.getByText('0');
    await expect(zeroCounts.first()).toBeVisible();
    expect(await zeroCounts.count()).toBeGreaterThan(0);
  });

  test('displays different counts for each risk type', async ({ mount }) => {
    const component = await mount(
      <UpgradeRisks totalRisks={50} criticalCount={35} warningCount={10} infoCount={5} />
    );

    await expect(component.getByTestId('total-risks')).toContainText('50');
    await expect(component.getByTestId('criticalCount')).toContainText('35');
    await expect(component.getByTestId('warningCount')).toContainText('10');
    await expect(component.getByTestId('infoCount')).toContainText('5');
  });
});
