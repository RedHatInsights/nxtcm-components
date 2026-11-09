import type { Locator, Page } from '@playwright/test';

import { expect, test } from '@/playwright/ct-fixture';
import { checkAccessibility } from '@/playwright/test-helpers';

import type {
  WizSelectDeferValidationHarness,
  WizSelectExplicitHarness,
  WizSelectSubmitValidationHarness,
} from '../../WizFields/WizSelect/WizSelect.story';
import {
  WIZ_SELECT_DEFER_REVEAL_BUTTON,
  WIZ_SELECT_EXPLICIT_HELPER,
} from '../../WizFields/WizSelect/WizSelect.story-data';
import type {
  AriaDisabledOptionHarness,
  DisabledTypeaheadHarness,
  GroupedLoadingTypeaheadHarness,
  GroupedTypeaheadHarness,
  KeyboardTypeaheadHarness,
  LoadingTypeaheadHarness,
  PlainMenuHarness,
  PreselectedTypeaheadHarness,
  RefreshHarness,
  TypeaheadHarness,
} from './Select.story';

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

async function expectPopupReferences(page: Page, combo: Locator): Promise<void> {
  const ids = (await combo.getAttribute('aria-controls'))?.trim().split(/\s+/) ?? [];
  expect(ids.length).toBeGreaterThan(0);
  for (const id of ids) {
    const list = page.locator(`[id="${id}"]`);
    await expect(list).toBeVisible();
    await expect(list).toHaveAttribute('role', 'listbox');
  }
}

test.describe('Select', () => {
  test('is accessible with no option selected', async ({ mount }) => {
    const component = await mount<typeof PlainMenuHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/PlainMenuHarness'
    );
    await expect(component.getByRole('button')).toHaveAccessibleName('Region Select the region');
    await checkAccessibility({ component });
  });

  test('passes accessibility check when required', async ({ mount, page }) => {
    const component = await mount<typeof PlainMenuHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/PlainMenuHarness',
      { isRequired: true }
    );
    await expect(component.getByText('*', { exact: true })).toBeVisible();
    await checkMenuAccessibility(page);
  });

  test('passes accessibility check when disabled', async ({ mount, page }) => {
    const component = await mount<typeof PlainMenuHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/PlainMenuHarness',
      { isDisabled: true }
    );
    await expect(component.getByRole('button', { name: /select the region/i })).toBeDisabled();
    await checkMenuAccessibility(page);
  });

  test('passes accessibility check with error feedback', async ({ mount, page }) => {
    const component = await mount<typeof PlainMenuHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/PlainMenuHarness',
      { isError: true, errorMessage: 'Choose a valid value.' }
    );
    await expect(component.getByText('Choose a valid value.', { exact: true })).toBeVisible();
    await checkMenuAccessibility(page);
  });

  test('passes accessibility check with an empty menu', async ({ mount, page }) => {
    const component = await mount<typeof PlainMenuHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/PlainMenuHarness',
      { options: [] }
    );
    await component.getByRole('button', { name: /select the region/i }).click();
    await expect(page.getByText('No results found', { exact: true })).toBeVisible();
    await checkMenuAccessibility(page);
  });

  test('passes accessibility check with a loading menu', async ({ mount, page }) => {
    const component = await mount<typeof PlainMenuHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/PlainMenuHarness',
      { isLoading: true }
    );
    await component.getByRole('button', { name: /^Region Loading/i }).click();
    await expect(page.getByRole('progressbar')).toBeVisible();
    await checkMenuAccessibility(page);
  });

  test('passes accessibility check with grouped plain options', async ({ mount, page }) => {
    const component = await mount<typeof PlainMenuHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/PlainMenuHarness',
      {
        optionGroups: [
          { label: 'Americas', options: ['us-east-1'] },
          { label: 'Europe', options: ['eu-west-1'] },
        ],
        isTypeAhead: false,
      }
    );
    await component.getByRole('button', { name: /select the region/i }).click();
    await expect(page.getByText('Americas', { exact: true })).toBeVisible();
    await expect(page.getByText('Europe', { exact: true })).toBeVisible();
    const americas = page.getByRole('listbox', { name: 'Region: Americas' });
    const europe = page.getByRole('listbox', { name: 'Region: Europe' });
    await expect(americas.locator(':scope > li')).toHaveCount(1);
    await expect(europe.locator(':scope > li')).toHaveCount(1);
    await expect(europe.getByRole('option', { name: 'eu-west-1' })).toBeVisible();
    await checkMenuAccessibility(page);
  });

  test('passes accessibility check with grouped typeahead options', async ({ mount, page }) => {
    const component = await mount<typeof PlainMenuHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/PlainMenuHarness',
      {
        optionGroups: [
          { label: 'Americas', options: ['us-east-1'] },
          { label: 'Europe', options: ['eu-west-1'] },
        ],
        isTypeAhead: true,
      }
    );
    await component.getByRole('combobox', { name: 'Region' }).click();
    await expect(page.getByText('Americas', { exact: true })).toBeVisible();
    await expect(page.getByText('Europe', { exact: true })).toBeVisible();
    const americas = page.getByRole('listbox', { name: 'Region: Americas' });
    const europe = page.getByRole('listbox', { name: 'Region: Europe' });
    await expect(americas.locator(':scope > li')).toHaveCount(1);
    await expect(europe.locator(':scope > li')).toHaveCount(1);
    await expect(europe.getByRole('option', { name: 'eu-west-1' })).toBeVisible();
    await expectPopupReferences(page, component.getByRole('combobox', { name: 'Region' }));
    await checkMenuAccessibility(page);
  });

  test('uses the configured heading level for option groups', async ({ mount, page }) => {
    const component = await mount<typeof PlainMenuHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/PlainMenuHarness',
      {
        optionGroups: [{ label: 'Americas', options: ['us-east-1'] }],
        groupHeadingLevel: 'h4',
        headingContext: true,
      }
    );
    await component.getByRole('button', { name: /select the region/i }).click();
    await expect(component.getByRole('heading', { name: 'Details', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Americas', level: 4 })).toBeVisible();
    await checkMenuAccessibility(page);
  });

  test('passes accessibility check with a loading typeahead menu', async ({ mount, page }) => {
    const component = await mount<typeof PlainMenuHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/PlainMenuHarness',
      { isTypeAhead: true, isLoading: true }
    );
    const combo = component.getByRole('combobox', { name: 'Region' });
    await combo.click();
    await expect(page.getByRole('progressbar')).toBeVisible();
    await checkMenuAccessibility(page);
  });

  test('passes accessibility check with an empty typeahead menu', async ({ mount, page }) => {
    const component = await mount<typeof PlainMenuHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/PlainMenuHarness',
      { isTypeAhead: true, options: [] }
    );
    const combo = component.getByRole('combobox', { name: 'Region' });
    await combo.click();
    await expect(page.getByText('No results found', { exact: true })).toBeVisible();
    await expectPopupReferences(page, combo);
    await checkMenuAccessibility(page);
  });

  test('passes accessibility check with no matching typeahead results', async ({ mount, page }) => {
    const component = await mount<typeof PlainMenuHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/PlainMenuHarness',
      { isTypeAhead: true }
    );
    const combo = component.getByRole('combobox', { name: 'Region' });
    await combo.click();
    await combo.fill('no-such-region');
    await expect(page.getByText('No results found', { exact: true })).toBeVisible();
    await expectPopupReferences(page, combo);
    await checkMenuAccessibility(page);
  });

  test('passes accessibility check with no matching grouped typeahead results', async ({
    mount,
    page,
  }) => {
    const component = await mount<typeof PlainMenuHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/PlainMenuHarness',
      { isTypeAhead: true, optionGroups: [{ label: 'Americas', options: ['us-east-1'] }] }
    );
    const combo = component.getByRole('combobox', { name: 'Region' });
    await combo.click();
    await combo.fill('no-such-region');
    await expect(page.getByText('No results found', { exact: true })).toBeVisible();
    await expectPopupReferences(page, combo);
    await checkMenuAccessibility(page);
  });

  test('selects an option from a plain menu and updates value', async ({ mount, page }) => {
    const component = await mount<typeof PlainMenuHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/PlainMenuHarness'
    );
    const toggle = page.getByRole('button', { name: /^Region / });
    await expect(toggle).toHaveAttribute('id', 'ct-menu-plain');
    await page.getByText('Region', { exact: true }).click();
    await expect(toggle).toBeFocused();
    await expect(page.getByRole('option', { name: 'eu-west-1' })).toBeVisible();
    await checkMenuAccessibility(page);
    await page.getByRole('option', { name: 'eu-west-1' }).click();
    await expect(page.getByTestId('menu-val')).toHaveText('eu-west-1');
    await expect(toggle).toHaveAccessibleName('Region eu-west-1');
    await expect(page.getByRole('option', { name: 'eu-west-1' })).toBeHidden();
    await checkMenuAccessibility(page);
    await page.keyboard.press('Tab');
    await checkAccessibility({ component });
  });

  test('associates the typeahead label with the input and retains its name after clearing', async ({
    mount,
    page,
  }) => {
    const component = await mount<typeof TypeaheadHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/TypeaheadHarness'
    );
    const combo = page.getByRole('combobox');
    await expect(combo).toHaveAttribute('id', 'ct-menu-ta');
    await expect(combo).toHaveAccessibleName('Subnet');
    await page.getByText('Subnet', { exact: true }).click();
    await expect(combo).toBeFocused();
    await page.getByRole('option', { name: 'subnet-a' }).click();
    await expect(combo).toHaveValue('subnet-a');
    await expect(combo).toHaveAccessibleName('Subnet');

    await page.getByRole('button', { name: 'Clear selection' }).click();
    await expect(combo).toHaveValue('');
    await expect(combo).toHaveAccessibleName('Subnet');
    await page.keyboard.press('Tab');
    await checkAccessibility({ component });
  });

  test('uses the placeholder as the typeahead name when no label is present', async ({ mount }) => {
    const component = await mount<typeof PlainMenuHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/PlainMenuHarness',
      { isTypeAhead: true, label: '', placeholder: 'Choose a region' }
    );
    const combo = component.getByRole('combobox', { name: 'Choose a region' });
    await expect(combo).toHaveAttribute('placeholder', 'Choose a region');
    await expect(combo).toHaveAccessibleName('Choose a region');
    await checkAccessibility({ component });
  });

  test('exposes helper text as the toggle description', async ({ mount }) => {
    const component = await mount<typeof WizSelectExplicitHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizSelect/WizSelect/WizSelectExplicitHarness'
    );
    await expect(
      component.getByRole('button', { name: /explicit region label/i })
    ).toHaveAccessibleDescription(WIZ_SELECT_EXPLICIT_HELPER);
    await checkAccessibility({ component });
  });

  test('describes an invalid toggle and removes stale error references after correction', async ({
    mount,
    page,
  }) => {
    const component = await mount<typeof WizSelectSubmitValidationHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizSelect/WizSelect/WizSelectSubmitValidationHarness'
    );
    const toggle = page.getByRole('button', { name: /^Region \(submit demo\)/ });
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(toggle).toHaveAttribute('aria-invalid', 'true');
    await expect(toggle).toHaveAccessibleDescription(/Please choose a region to continue\./);
    await checkAccessibility({ component });

    await toggle.click();
    await page.getByRole('option', { name: 'us-east-1' }).click();
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(toggle).not.toHaveAttribute('aria-invalid');
    await expect(toggle).not.toHaveAttribute('aria-describedby');
    await expect(toggle).toHaveAccessibleDescription('');
  });

  test('applies validation descriptions to the typeahead input', async ({ mount, page }) => {
    const component = await mount<typeof WizSelectDeferValidationHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizSelect/WizSelect/WizSelectDeferValidationHarness'
    );
    const combo = page.getByRole('combobox', { name: 'Region' });
    await combo.click();
    await page.getByRole('option', { name: 'eu-west-1' }).click();
    await page.getByRole('button', { name: 'Clear selection' }).click();
    await page.getByRole('button', { name: WIZ_SELECT_DEFER_REVEAL_BUTTON }).click();
    await expect(combo).toHaveAttribute('id', 'region');
    await expect(combo).toHaveAttribute('aria-invalid', 'true');
    await expect(combo).toHaveAccessibleDescription(/Please choose a region to continue\./);
    await checkAccessibility({ component });

    await combo.click();
    await page.getByRole('option', { name: 'us-east-1' }).click();
    await expect(combo).not.toHaveAttribute('aria-invalid');
    await expect(combo).not.toHaveAttribute('aria-describedby');
    await expect(combo).toHaveAccessibleDescription('');
  });

  test('filters options in typeahead mode', async ({ mount, page }) => {
    await mount<typeof TypeaheadHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/TypeaheadHarness'
    );
    const combo = page.getByRole('combobox', { name: 'Subnet' });
    await combo.click();
    await combo.fill('subnet');
    await expect(page.getByRole('option', { name: 'subnet-a' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'other-net' })).toHaveCount(0);
    await checkMenuAccessibility(page);
    await expect(combo).toHaveAttribute('aria-controls', 'ct-menu-ta-listbox');
    await expect(page.locator('#ct-menu-ta-listbox')).toBeVisible();
    await expectPopupReferences(page, combo);
  });

  test('opens, navigates enabled options, and selects with only the keyboard', async ({
    mount,
    page,
  }) => {
    await mount<typeof KeyboardTypeaheadHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/KeyboardTypeaheadHarness'
    );
    const combo = page.getByRole('combobox', { name: 'Subnet' });
    await page.getByRole('button', { name: 'Before subnet' }).focus();
    await page.keyboard.press('Tab');
    await expect(combo).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expectPopupReferences(page, combo);
    await expect(combo).toHaveAttribute('aria-activedescendant', 'ct-menu-ta-keyboard-option-0');
    await expect(page.locator('#ct-menu-ta-keyboard-option-0')).toHaveAttribute('role', 'option');
    await expect(page.getByRole('option', { name: 'Disabled subnet' })).toBeDisabled();
    await expect(page.getByRole('option', { name: 'Unavailable subnet' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await checkMenuAccessibility(page);

    await page.keyboard.press('ArrowDown');
    await expect(combo).toHaveAttribute('aria-activedescendant', 'ct-menu-ta-keyboard-option-2');
    await page.keyboard.press('ArrowUp');
    await expect(combo).toHaveAttribute('aria-activedescendant', 'ct-menu-ta-keyboard-option-0');
    await page.keyboard.press('ArrowDown');
    await expect(combo).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('ta-keyboard-val')).toHaveText('subnet-b');
    await expect(combo).toBeFocused();
    await expect(combo).not.toHaveAttribute('aria-activedescendant');
    await expect(combo).not.toHaveAttribute('aria-controls');
  });

  test('Escape keeps input focus and Tab moves focus forward', async ({ mount, page }) => {
    await mount<typeof KeyboardTypeaheadHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/KeyboardTypeaheadHarness'
    );
    const combo = page.getByRole('combobox', { name: 'Subnet' });
    await page.getByRole('button', { name: 'Before subnet' }).focus();
    await page.keyboard.press('Tab');
    await expect(combo).toBeFocused();

    await page.keyboard.press('Enter');
    await expectPopupReferences(page, combo);
    await page.keyboard.press('ArrowUp');
    await expect(combo).toHaveAttribute('aria-activedescendant', 'ct-menu-ta-keyboard-option-2');
    await page.keyboard.press('Escape');
    await expect(combo).toBeFocused();
    await expect(combo).not.toHaveAttribute('aria-controls');
    await expect(combo).not.toHaveAttribute('aria-activedescendant');

    await page.keyboard.press('ArrowDown');
    await expectPopupReferences(page, combo);
    await checkMenuAccessibility(page);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'After subnet' })).toBeFocused();
    await expect(combo).not.toHaveAttribute('aria-controls');
  });

  test('removes stale active options when filtering or updating options', async ({
    mount,
    page,
  }) => {
    const component = await mount<typeof PlainMenuHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/PlainMenuHarness',
      { isTypeAhead: true, options: ['alpha', 'beta'] }
    );
    const combo = page.getByRole('combobox', { name: 'Region' });
    await combo.click();
    await page.keyboard.press('ArrowDown');
    await expect(combo).toHaveAttribute('aria-activedescendant', 'ct-menu-plain-option-0');

    await combo.fill('beta');
    await expect(combo).not.toHaveAttribute('aria-activedescendant');
    await expectPopupReferences(page, combo);
    await page.keyboard.press('ArrowDown');
    await expect(combo).toHaveAttribute('aria-activedescendant', 'ct-menu-plain-option-0');
    await expect(page.locator('#ct-menu-plain-option-0')).toHaveText('beta');

    await component.update({ isTypeAhead: true, options: ['gamma'] });
    await expect(combo).not.toHaveAttribute('aria-activedescendant');
    await expect(page.getByText('No results found', { exact: true })).toBeVisible();
    await expectPopupReferences(page, combo);
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('menu-val')).toHaveText('none');
    await combo.fill('gamma');
    await page.keyboard.press('ArrowDown');
    await expect(combo).toHaveAttribute('aria-activedescendant', 'ct-menu-plain-option-0');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('menu-val')).toHaveText('gamma');
  });

  test('shows all options when reopening a typeahead after selection', async ({ mount, page }) => {
    await mount<typeof TypeaheadHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/TypeaheadHarness'
    );
    const combo = page.getByRole('combobox', { name: 'Subnet' });

    // Select an option
    await combo.click();
    await page.getByRole('option', { name: 'subnet-a' }).click();

    // Reopen — all options should be visible (no leftover filter)
    await combo.click();
    await expect(page.getByRole('option', { name: 'subnet-a' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'subnet-b' })).toBeVisible();
    await expectPopupReferences(page, combo);
    await expect(page.getByRole('option', { name: 'other-net' })).toBeVisible();
  });

  test('keeps aria-controls connected for grouped typeahead menus', async ({ mount, page }) => {
    await mount<typeof GroupedTypeaheadHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/GroupedTypeaheadHarness'
    );
    const combo = page.getByRole('combobox', { name: 'Subnet' });
    await combo.click();
    await expect(combo).toHaveAttribute(
      'aria-controls',
      'ct-menu-ta-grouped-listbox-0 ct-menu-ta-grouped-listbox-1'
    );
    await expect(page.getByRole('option', { name: 'subnet-a' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'subnet-b' })).toBeVisible();
    await expectPopupReferences(page, combo);
    await combo.fill('subnet-b');
    await expect(combo).toHaveAttribute('aria-controls', 'ct-menu-ta-grouped-listbox-0');
    await expectPopupReferences(page, combo);
    await expect(page.getByRole('option', { name: 'subnet-a' })).toHaveCount(0);
  });

  test('keeps aria-controls connected while a typeahead menu is loading', async ({
    mount,
    page,
  }) => {
    await mount<typeof LoadingTypeaheadHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/LoadingTypeaheadHarness'
    );
    const combo = page.getByRole('combobox', { name: 'Subnet' });
    await combo.click();
    await expect(combo).toHaveAttribute('aria-controls', 'ct-menu-ta-loading-listbox');
    await expect(page.locator('#ct-menu-ta-loading-listbox')).toBeVisible();
    await expectPopupReferences(page, combo);
  });

  test('keeps aria-controls connected while a grouped typeahead menu is loading', async ({
    mount,
    page,
  }) => {
    await mount<typeof GroupedLoadingTypeaheadHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/GroupedLoadingTypeaheadHarness'
    );
    const combo = page.getByRole('combobox', { name: 'Subnet' });
    await combo.click();
    await expect(combo).toHaveAttribute('aria-controls', 'ct-menu-ta-grouped-loading-listbox');
    await expect(page.locator('#ct-menu-ta-grouped-loading-listbox')).toBeVisible();
    await expectPopupReferences(page, combo);
  });

  test('re-selecting the same typeahead option keeps the selection', async ({ mount, page }) => {
    await mount<typeof TypeaheadHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/TypeaheadHarness'
    );
    const combo = page.getByRole('combobox', { name: 'Subnet' });

    // Select an option
    await combo.click();
    await page.getByRole('option', { name: 'subnet-a' }).click();
    await expect(page.getByTestId('ta-val')).toHaveText('subnet-a');

    // Re-select the same option — value must stay
    await combo.click();
    await page.getByRole('option', { name: 'subnet-a' }).click();
    await expect(page.getByTestId('ta-val')).toHaveText('subnet-a');

    // Toggle text must still show the selected label (not empty)
    await expect(combo).toHaveValue('subnet-a');
    await checkMenuAccessibility(page);
  });

  test('shows selected label when typeahead mounts with a preselected value', async ({
    mount,
    page,
  }) => {
    const component = await mount<typeof PreselectedTypeaheadHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/PreselectedTypeaheadHarness'
    );
    const combo = page.getByRole('combobox', { name: 'Subnet' });

    // Typeahead input must display the preselected option label, not blank
    await expect(combo).toHaveValue('subnet-a');
    await expect(combo).toHaveAccessibleName('Subnet');
    await expect(combo).toHaveAttribute('id', 'ct-menu-ta-preselected');
    await expect(page.getByTestId('ta-preselected-val')).toHaveText('subnet-a');
    await checkAccessibility({ component });

    // Opening should show all options (no leftover filter)
    await combo.click();
    await expect(page.getByRole('option', { name: 'subnet-a' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'subnet-b' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'other-net' })).toBeVisible();
  });

  test('disables the typeahead combobox when isDisabled is set', async ({ mount, page }) => {
    await mount<typeof DisabledTypeaheadHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/DisabledTypeaheadHarness'
    );
    await expect(page.getByRole('combobox', { name: 'Subnet' })).toBeDisabled();
    await checkMenuAccessibility(page);
  });

  test('invokes onRefresh when the refresh control is pressed', async ({ mount, page }) => {
    await mount<typeof RefreshHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/RefreshHarness'
    );
    await page.getByRole('button', { name: 'Refresh' }).click();
    await expect(page.getByTestId('refresh-count')).toHaveText('1');
  });

  test('shows the description of an aria-disabled option', async ({ mount, page }) => {
    await mount<typeof AriaDisabledOptionHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/AriaDisabledOptionHarness'
    );
    await page.getByRole('button', { name: /Role/ }).click();

    const option = page.getByRole('option', { name: /role-old/ });
    await expect(option).toBeDisabled();
    await expect(option).toContainText('Incompatible with this version.');
  });
});
