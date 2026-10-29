import type { Page } from '@playwright/test';

import { expect, test } from '@/playwright/ct-fixture';
import { checkAccessibility } from '@/playwright/test-helpers';

import type {
  MultiBadgeHarness,
  MultiGroupedHarness,
  MultiLegacyToggleHarness,
  MultiLoadingHarness,
  MultiPlainHarness,
  MultiRefreshHarness,
} from './MultiSelect.story';

// Include the trigger and any portalled menu content in the same scan.
async function checkMenuAccessibility(page: Page): Promise<void> {
  const body = page.locator('body');
  await body.evaluate(async (element) => {
    await new Promise(requestAnimationFrame);
    await Promise.allSettled(
      element
        .getAnimations({ subtree: true })
        .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
        .map((animation) => animation.finished)
    );
  });
  await checkAccessibility({ component: body });
}

test.describe('MultiSelect', () => {
  test('passes accessibility check', async ({ mount }) => {
    const component = await mount<typeof MultiPlainHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/MultiSelect/MultiSelect/MultiPlainHarness'
    );
    await checkAccessibility({ component });
  });

  test('passes accessibility check with error feedback', async ({ mount, page }) => {
    const component = await mount<typeof MultiPlainHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/MultiSelect/MultiSelect/MultiPlainHarness',
      { isError: true, errorMessage: 'Choose a valid value.' }
    );
    await expect(component.getByText('Choose a valid value.', { exact: true })).toBeVisible();
    await checkMenuAccessibility(page);
  });

  test('passes accessibility check with an empty menu', async ({ mount, page }) => {
    const component = await mount<typeof MultiPlainHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/MultiSelect/MultiSelect/MultiPlainHarness',
      { options: [] }
    );
    await component.getByRole('button', { name: /select the zones/i }).click();
    await expect(page.getByText('No results found', { exact: true })).toBeVisible();
    await checkMenuAccessibility(page);
  });

  test('toggles multiple options and updates value', async ({ mount, page }) => {
    await mount<typeof MultiPlainHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/MultiSelect/MultiSelect/MultiPlainHarness'
    );
    await page.getByRole('button', { name: /select the zones/i }).click();
    const listbox = page.locator('#ct-multi-plain-listbox');
    await expect(listbox).toBeVisible();
    await checkMenuAccessibility(page);
    await listbox.getByText('a', { exact: true }).click();
    await listbox.getByText('b', { exact: true }).click();
    await expect(page.getByTestId('multi-val')).toHaveText('a,b');
    await checkMenuAccessibility(page);
    await listbox.getByText('a', { exact: true }).click();
    await expect(page.getByTestId('multi-val')).toHaveText('b');
    await page.keyboard.press('Escape');
    await expect(listbox).toBeHidden();
    await checkMenuAccessibility(page);
  });

  test('invokes onRefresh when the refresh control is pressed', async ({ mount, page }) => {
    await mount<typeof MultiRefreshHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/MultiSelect/MultiSelect/MultiRefreshHarness'
    );
    await page.getByRole('button', { name: 'Refresh' }).click();
    await expect(page.getByTestId('multi-refresh-count')).toHaveText('1');
  });

  test('renders grouped options and records selections', async ({ mount, page }) => {
    await mount<typeof MultiGroupedHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/MultiSelect/MultiSelect/MultiGroupedHarness'
    );
    await page.getByRole('button', { name: /select the grouped zones/i }).click();
    const groupA = page.getByRole('menu', { name: 'Grouped zones: Group A', exact: true });
    const groupB = page.getByRole('menu', { name: 'Grouped zones: Group B', exact: true });
    await expect(groupA).toBeVisible();
    await expect(groupB).toBeVisible();
    await checkMenuAccessibility(page);
    await groupA.getByRole('checkbox', { name: 'a1', exact: true }).check();
    await groupB.getByRole('checkbox', { name: 'b1', exact: true }).check();
    await expect(page.getByTestId('multi-grouped-val')).toHaveText('a1,b1');
    await checkMenuAccessibility(page);
  });

  test('shows a loading row in the menu when isLoading is true', async ({ mount, page }) => {
    await mount<typeof MultiLoadingHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/MultiSelect/MultiSelect/MultiLoadingHarness'
    );
    await page.getByRole('button', { name: /^loading/i }).click();
    const listbox = page.locator('#ct-multi-loading-listbox');
    await expect(listbox).toBeVisible();
    await expect(listbox.getByText('Loading...')).toBeVisible();
    await checkMenuAccessibility(page);
  });

  test('shows a count badge on the toggle when multiple values are selected', async ({
    mount,
    page,
  }) => {
    await mount<typeof MultiBadgeHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/MultiSelect/MultiSelect/MultiBadgeHarness'
    );
    const toggle = page.getByRole('button', { name: /select the regions/i });
    await toggle.click();
    const listbox = page.locator('#ct-multi-badge-listbox');
    await expect(listbox).toBeVisible();
    await listbox.getByText('us-east-1', { exact: true }).click();
    await listbox.getByText('eu-west-1', { exact: true }).click();
    await expect(toggle).toContainText('2');
  });

  test('uses legacy toggle labels when checkboxMenuToggle is false', async ({ mount, page }) => {
    await mount<typeof MultiLegacyToggleHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/MultiSelect/MultiSelect/MultiLegacyToggleHarness'
    );
    await page.getByRole('button', { name: /select the legacy toggle/i }).click();
    const listbox = page.locator('#ct-multi-legacy-listbox');
    await expect(listbox).toBeVisible();
    await listbox.getByText('solo', { exact: true }).click();
    await expect(page.getByRole('button', { name: 'solo', exact: true })).toBeVisible();
    await listbox.getByText('pair-a', { exact: true }).click();
    await expect(page.getByRole('button', { name: '2 selected', exact: true })).toBeVisible();
    await expect(page.getByTestId('multi-legacy-val')).toHaveText('solo,pair-a');
  });
});
