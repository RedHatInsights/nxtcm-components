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

    // Verify the displayed total risk count.
    const totalRisksSection = component.getByTestId('total-risks');
    await expect(totalRisksSection).toHaveText('45');

    // Verify the displayed critical count.
    const criticalSection = component.getByTestId('criticalCount');
    await expect(criticalSection).toHaveText('15');
  });

  test('should display correct risk counts', async ({ mount }) => {
    const component = await mount<typeof UpgradeRisksStory>(
      'nxtcm-dashboard/UpgradeRisks/UpgradeRisks/UpgradeRisksStory',
      {
        ...defaultProps,
      }
    );

    // Verify Critical count
    const criticalSection = component.getByTestId('criticalCount');
    await expect(criticalSection).toHaveText('15');

    // Verify Warning count
    const warningSection = component.getByTestId('warningCount');
    await expect(warningSection).toHaveText('15');

    // Verify Info count
    const infoSection = component.getByTestId('infoCount');
    await expect(infoSection).toHaveText('15');
  });

  test('should render View upgrade risks link when onViewRisks is provided', async ({ mount }) => {
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

    // Verify total risks is 0
    await expect(component.getByTestId('total-risks')).toHaveText('0');

    // Verify Critical count is 0
    const criticalSection = component.getByTestId('criticalCount');
    await expect(criticalSection).toHaveText('0');

    // Verify Warning count is 0
    const warningSection = component.getByTestId('warningCount');
    await expect(warningSection).toHaveText('0');

    // Verify Info count is 0
    const infoSection = component.getByTestId('infoCount');
    await expect(infoSection).toHaveText('0');
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

    // Verify total risks relative to its label
    const totalRisksSection = component.getByTestId('total-risks');
    await expect(totalRisksSection).toHaveText('50');

    // Verify Critical count relative to its label
    const criticalSection = component.getByTestId('criticalCount');
    await expect(criticalSection).toHaveText('35');

    // Verify Warning count relative to its label
    const warningSection = component.getByTestId('warningCount');
    await expect(warningSection).toHaveText('10');

    // Verify Info count relative to its label
    const infoSection = component.getByTestId('infoCount');
    await expect(infoSection).toHaveText('5');
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
