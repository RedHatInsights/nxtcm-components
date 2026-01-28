import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { UpgradeRisks } from './UpgradeRisks';
import { checkAccessibility } from '../../../test-helpers';

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

    // Find total risks relative to its label using filter
    const totalRisksSection = component
      .locator('div')
      .filter({ hasText: 'total number of upgrade risks' });
    await expect(totalRisksSection.getByText('45')).toBeVisible();

    // Find critical count by locating the Critical label and navigating to parent container
    const criticalLabel = component.getByText('Critical', { exact: true });
    const criticalSection = criticalLabel.locator('..');
    await expect(criticalSection.getByText('15')).toBeVisible();
  });

  test('should display correct risk counts', async ({ mount }) => {
    const component = await mount(<UpgradeRisks {...defaultProps} />);

    // Verify Critical count
    const criticalSection = component.getByText('Critical', { exact: true }).locator('..');
    await expect(criticalSection.getByText('15')).toBeVisible();

    // Verify Warning count
    const warningSection = component.getByText('Warning', { exact: true }).locator('..');
    await expect(warningSection.getByText('15')).toBeVisible();

    // Verify Info count
    const infoSection = component.getByText('Info', { exact: true }).locator('..');
    await expect(infoSection.getByText('15')).toBeVisible();
  });

  test('should render View upgrade risks link when onViewRisks is provided', async ({ mount }) => {
    let handleViewRisksCalled = false;
    const handleViewRisks = () => {
      handleViewRisksCalled = true;
    };
    const component = await mount(<UpgradeRisks {...defaultProps} onViewRisks={handleViewRisks} />);

    const viewLink = component.getByRole('button', { name: 'View upgrade risks' });
    await viewLink.click();
    expect(handleViewRisksCalled).toBe(true);
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

    // Verify total risks is 0
    const totalRisksSection = component
      .locator('div')
      .filter({ hasText: 'total number of upgrade risks' });
    await expect(totalRisksSection.getByText('0')).toBeVisible();

    // Verify Critical count is 0
    const criticalSection = component.getByText('Critical', { exact: true }).locator('..');
    await expect(criticalSection.getByText('0')).toBeVisible();

    // Verify Warning count is 0
    const warningSection = component.getByText('Warning', { exact: true }).locator('..');
    await expect(warningSection.getByText('0')).toBeVisible();

    // Verify Info count is 0
    const infoSection = component.getByText('Info', { exact: true }).locator('..');
    await expect(infoSection.getByText('0')).toBeVisible();
  });

  test('should display different counts for each risk type', async ({ mount }) => {
    const component = await mount(
      <UpgradeRisks totalRisks={50} criticalCount={35} warningCount={10} infoCount={5} />
    );

    // Verify total risks relative to its label
    const totalRisksSection = component
      .locator('div')
      .filter({ hasText: 'total number of upgrade risks' });
    await expect(totalRisksSection.getByText('50')).toBeVisible();

    // Verify Critical count relative to its label
    const criticalSection = component.getByText('Critical', { exact: true }).locator('..');
    await expect(criticalSection.getByText('35')).toBeVisible();

    // Verify Warning count relative to its label
    const warningSection = component.getByText('Warning', { exact: true }).locator('..');
    await expect(warningSection.getByText('10')).toBeVisible();

    // Verify Info count relative to its label
    const infoSection = component.getByText('Info', { exact: true }).locator('..');
    await expect(infoSection.getByText('5')).toBeVisible();
  });
});
