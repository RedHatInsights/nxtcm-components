import type { Page } from '@playwright/test';

import { expect, test } from '@/playwright/ct-fixture';
import { checkAccessibility } from '@/playwright/test-helpers';

import type {
  WizMultiSelectExplicitHarness,
  WizMultiSelectSubmitValidationHarness,
} from '../../WizFields/WizMultiSelect/WizMultiSelect.story';
import { WIZ_MULTI_EXPLICIT_HELPER } from '../../WizFields/WizMultiSelect/WizMultiSelect.story-data';
import type {
  MultiAriaDisabledSelectedHarness,
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

  test('is accessible with no options selected', async ({ mount }) => {
    const component = await mount<typeof MultiPlainHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/MultiSelect/MultiSelect/MultiPlainHarness'
    );
    await expect(component.getByRole('button')).toHaveAccessibleName('Zones Select the zones');
    await checkAccessibility({ component });
  });

  test('toggles multiple options and updates value', async ({ mount, page }) => {
    const component = await mount<typeof MultiPlainHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/MultiSelect/MultiSelect/MultiPlainHarness'
    );
    const toggle = page.getByRole('button', { name: /^Zones / });
    await expect(toggle).toHaveAttribute('id', 'ct-multi-plain');
    await page.getByText('Zones', { exact: true }).click();
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute('aria-haspopup', 'menu');
    const menu = page.getByRole('menu', { name: 'Zones', exact: true });
    await expect(menu).toBeVisible();
    await checkMenuAccessibility(page);
    await menu.getByText('a', { exact: true }).click();
    await menu.getByText('b', { exact: true }).click();
    await expect(page.getByTestId('multi-val')).toHaveText('a,b');
    await expect(menu.getByRole('checkbox', { name: 'a' })).toBeChecked();
    await expect(menu.getByRole('checkbox', { name: 'b' })).toBeChecked();
    await checkMenuAccessibility(page);
    await expect(toggle).toHaveAccessibleName('Zones Select the zones 2');
    await menu.getByText('a', { exact: true }).click();
    await expect(page.getByTestId('multi-val')).toHaveText('b');
    await expect(menu.getByRole('checkbox', { name: 'a' })).not.toBeChecked();
    await expect(toggle).toHaveAccessibleName('Zones Select the zones 1');
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await checkMenuAccessibility(page);
    await page.keyboard.press('Tab');
    await checkAccessibility({ component });
  });

  test('selects checkboxes and dismisses the menu using only the keyboard', async ({
    mount,
    page,
  }) => {
    await mount<typeof MultiPlainHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/MultiSelect/MultiSelect/MultiPlainHarness'
    );
    const toggle = page.getByRole('button', { name: /^Zones Select the zones/ });
    const menu = page.getByRole('menu', { name: 'Zones', exact: true });
    await toggle.focus();
    await expect(toggle).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(menu).toBeVisible();
    await expect(toggle).toBeFocused();

    await page.keyboard.press('ArrowDown');
    const first = menu.getByRole('checkbox', { name: 'a', exact: true });
    await expect(first).toBeFocused();
    await page.keyboard.press('Space');
    await expect(first).toBeChecked();
    await expect(page.getByTestId('multi-val')).toHaveText('a');

    await page.keyboard.press('ArrowDown');
    const second = menu.getByRole('checkbox', { name: 'b', exact: true });
    await expect(second).toBeFocused();
    await page.keyboard.press('Space');
    await expect(second).toBeChecked();
    await expect(page.getByTestId('multi-val')).toHaveText('a,b');
    await checkMenuAccessibility(page);

    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(toggle).toBeFocused();
    await expect(page.getByTestId('multi-val')).toHaveText('a,b');
  });

  test('exposes helper text as the toggle description', async ({ mount }) => {
    const component = await mount<typeof WizMultiSelectExplicitHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizMultiSelect/WizMultiSelect/WizMultiSelectExplicitHarness'
    );
    await expect(
      component.getByRole('button', { name: /explicit multi label/i })
    ).toHaveAccessibleDescription(WIZ_MULTI_EXPLICIT_HELPER);
    await checkAccessibility({ component });
  });

  test('describes an invalid toggle and removes stale error references after correction', async ({
    mount,
    page,
  }) => {
    const component = await mount<typeof WizMultiSelectSubmitValidationHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizMultiSelect/WizMultiSelect/WizMultiSelectSubmitValidationHarness'
    );
    const toggle = page.getByRole('button', { name: /^Tags \(submit demo\)/ });
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(toggle).toHaveAttribute('aria-invalid', 'true');
    await expect(toggle).toHaveAccessibleDescription(/Choose at least one value\./);
    await checkAccessibility({ component });

    await toggle.click();
    await page.getByRole('checkbox', { name: 'us-east-1', exact: true }).check();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(toggle).not.toHaveAttribute('aria-invalid');
    await expect(toggle).not.toHaveAttribute('aria-describedby');
    await expect(toggle).toHaveAccessibleDescription('');
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
    await expect(groupA.locator(':scope > li')).toHaveCount(2);
    await expect(groupB.locator(':scope > li')).toHaveCount(1);
    await checkMenuAccessibility(page);
    await groupA.getByRole('checkbox', { name: 'a1', exact: true }).check();
    await groupB.getByRole('checkbox', { name: 'b1', exact: true }).check();
    await expect(page.getByTestId('multi-grouped-val')).toHaveText('a1,b1');
    await expect(groupA.getByRole('checkbox', { name: 'a1', exact: true })).toBeChecked();
    await expect(groupB.getByRole('checkbox', { name: 'b1', exact: true })).toBeChecked();
    await checkMenuAccessibility(page);
  });

  test('uses the configured heading level for option groups', async ({ mount, page }) => {
    await mount<typeof MultiGroupedHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/MultiSelect/MultiSelect/MultiGroupedHarness',
      { groupHeadingLevel: 'h4', headingContext: true }
    );
    await page.getByRole('button', { name: /select the grouped zones/i }).click();
    await expect(page.getByRole('heading', { name: 'Details', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Group A', level: 4 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Group B', level: 4 })).toBeVisible();
    await checkMenuAccessibility(page);
  });

  test('keeps an aria-disabled selected checkbox checked', async ({ mount, page }) => {
    await mount<typeof MultiAriaDisabledSelectedHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/MultiSelect/MultiSelect/MultiAriaDisabledSelectedHarness'
    );
    await page.getByRole('button', { name: /^Zones / }).click();
    const menu = page.getByRole('menu', { name: 'Zones', exact: true });
    const selected = menu.getByRole('checkbox', { name: 'a', exact: true });
    await expect(selected).toBeChecked();
    await expect(selected).toHaveAttribute('aria-disabled', 'true');
    await menu.getByRole('checkbox', { name: 'b', exact: true }).check();
    await expect(selected).toBeChecked();
    await expect(page.getByTestId('multi-aria-disabled-val')).toHaveText('a,b');
    await checkMenuAccessibility(page);
  });

  test('shows a loading row in the menu when isLoading is true', async ({ mount, page }) => {
    await mount<typeof MultiLoadingHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/MultiSelect/MultiSelect/MultiLoadingHarness'
    );
    await page.getByRole('button', { name: /^loading/i }).click();
    const menu = page.getByRole('menu', { name: 'Loading list', exact: true });
    await expect(menu).toBeVisible();
    await expect(menu.getByText('Loading...')).toBeVisible();
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
    const menu = page.getByRole('menu', { name: 'Regions', exact: true });
    await expect(menu).toBeVisible();
    await menu.getByText('us-east-1', { exact: true }).click();
    await menu.getByText('eu-west-1', { exact: true }).click();
    await expect(toggle).toContainText('2');
    await expect(toggle).toHaveAccessibleName(/^Regions Select the regions 2\s*regions selected$/);
    await menu.getByText('us-east-1', { exact: true }).click();
    await menu.getByText('eu-west-1', { exact: true }).click();
    await expect(toggle).toHaveAccessibleName('Regions Select the regions');
  });

  test('uses legacy toggle labels when checkboxMenuToggle is false', async ({ mount, page }) => {
    await mount<typeof MultiLegacyToggleHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/MultiSelect/MultiSelect/MultiLegacyToggleHarness'
    );
    const toggle = page.getByRole('button', { name: /^Legacy toggle / });
    await expect(toggle).toHaveAccessibleName('Legacy toggle Select the legacy toggle');
    await toggle.click();
    const menu = page.getByRole('menu', { name: 'Legacy toggle', exact: true });
    await expect(menu).toBeVisible();
    await menu.getByText('solo', { exact: true }).click();
    await expect(toggle).toHaveAccessibleName('Legacy toggle solo');
    await menu.getByText('pair-a', { exact: true }).click();
    await expect(toggle).toHaveAccessibleName('Legacy toggle 2 selected');
    await expect(page.getByTestId('multi-legacy-val')).toHaveText('solo,pair-a');
  });
});
