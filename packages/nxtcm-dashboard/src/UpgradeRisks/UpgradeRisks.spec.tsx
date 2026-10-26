import { expect, test } from '@/playwright/ct-fixture';
import { checkAccessibility } from '@/playwright/test-helpers';

import type { UpgradeRisksStory } from './UpgradeRisks.story';

test.describe('UpgradeRisks', () => {
  const defaultProps = {
    totalRisks: 45,
    criticalCount: 15,
    warningCount: 15,
    infoCount: 15,
  };

  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount<typeof UpgradeRisksStory>(
      'nxtcm-dashboard/UpgradeRisks/UpgradeRisks/UpgradeRisksStory',
      {
        ...defaultProps,
      }
    );
    await checkAccessibility({ component });
  });

  test('should render correctly with all props', async ({ mount }) => {
    const component = await mount<typeof UpgradeRisksStory>(
      'nxtcm-dashboard/UpgradeRisks/UpgradeRisks/UpgradeRisksStory',
      {
        ...defaultProps,
      }
    );
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
    const component = await mount<typeof UpgradeRisksStory>(
      'nxtcm-dashboard/UpgradeRisks/UpgradeRisks/UpgradeRisksStory',
      {
        ...defaultProps,
      }
    );

    await expect(component.getByText('View upgrade risks')).toBeHidden();
  });

  test('should call onViewRisks when link is clicked', async ({ mount }) => {
    const component = await mount<typeof UpgradeRisksStory>(
      'nxtcm-dashboard/UpgradeRisks/UpgradeRisks/UpgradeRisksStory',
      {
        ...defaultProps,
        onViewRisks: true,
      }
    );

    const viewLink = component.getByRole('button', { name: 'View upgrade risks' });
    await viewLink.click();

    await expect
      .poll(() =>
        component
          .getByTestId('onViewRisks-calls')
          .evaluate((input: HTMLInputElement) => JSON.parse(input.value) as unknown[][])
      )
      .toHaveLength(1);
  });

  test('should display zero counts correctly', async ({ mount }) => {
    const component = await mount<typeof UpgradeRisksStory>(
      'nxtcm-dashboard/UpgradeRisks/UpgradeRisks/UpgradeRisksStory',
      {
        totalRisks: 0,
        criticalCount: 0,
        warningCount: 0,
        infoCount: 0,
      }
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
    const component = await mount<typeof UpgradeRisksStory>(
      'nxtcm-dashboard/UpgradeRisks/UpgradeRisks/UpgradeRisksStory',
      {
        totalRisks: 50,
        criticalCount: 35,
        warningCount: 10,
        infoCount: 5,
      }
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
    const component = await mount<typeof UpgradeRisksStory>(
      'nxtcm-dashboard/UpgradeRisks/UpgradeRisks/UpgradeRisksStory',
      {
        isLoading: true,
        ...defaultProps,
      }
    );
    await expect(component.getByText('Loading upgrade risks')).toBeVisible();
    await expect(component.getByTestId('total-risks')).toBeHidden();
  });

  test('should render skeleton when isLoading is true without data', async ({ mount }) => {
    const component = await mount<typeof UpgradeRisksStory>(
      'nxtcm-dashboard/UpgradeRisks/UpgradeRisks/UpgradeRisksStory',
      {
        isLoading: true,
      }
    );
    await expect(component.getByText('Loading upgrade risks')).toBeVisible();
  });
});
