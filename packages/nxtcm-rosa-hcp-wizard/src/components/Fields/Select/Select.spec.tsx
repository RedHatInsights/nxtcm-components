import type { Page } from '@playwright/test';

import { expect, test } from '@/playwright/ct-fixture';
import { checkAccessibility } from '@/playwright/test-helpers';

import type {
  DisabledTypeaheadHarness,
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

test.describe('Select', () => {
  test('passes accessibility check', async ({ mount }) => {
    const component = await mount<typeof PlainMenuHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/PlainMenuHarness'
    );
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
    await component.getByRole('button', { name: /^loading/i }).click();
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
    await expect(page.getByRole('option', { name: 'eu-west-1' })).toBeVisible();
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
    await component.getByRole('combobox', { name: /select the region/i }).click();
    await expect(page.getByText('Americas', { exact: true })).toBeVisible();
    await expect(page.getByText('Europe', { exact: true })).toBeVisible();
    await expect(page.getByRole('option', { name: 'eu-west-1' })).toBeVisible();
    await checkMenuAccessibility(page);
  });

  test('passes accessibility check with a loading typeahead menu', async ({ mount, page }) => {
    const component = await mount<typeof PlainMenuHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/PlainMenuHarness',
      { isTypeAhead: true, isLoading: true }
    );
    const combo = component.getByRole('combobox', { name: /select the region/i });
    await combo.click();
    await expect(page.getByRole('progressbar')).toBeVisible();
    await checkMenuAccessibility(page);
  });

  test('passes accessibility check with an empty typeahead menu', async ({ mount, page }) => {
    const component = await mount<typeof PlainMenuHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/PlainMenuHarness',
      { isTypeAhead: true, options: [] }
    );
    const combo = component.getByRole('combobox', { name: /select the region/i });
    await combo.click();
    await expect(page.getByText('No results found', { exact: true })).toBeVisible();
    await checkMenuAccessibility(page);
  });

  test('passes accessibility check with no matching typeahead results', async ({ mount, page }) => {
    const component = await mount<typeof PlainMenuHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/PlainMenuHarness',
      { isTypeAhead: true }
    );
    const combo = component.getByRole('combobox', { name: /select the region/i });
    await combo.click();
    await combo.fill('no-such-region');
    await expect(page.getByText('No results found', { exact: true })).toBeVisible();
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
    const combo = component.getByRole('combobox', { name: /select the region/i });
    await combo.click();
    await combo.fill('no-such-region');
    await expect(page.getByText('No results found', { exact: true })).toBeVisible();
    await checkMenuAccessibility(page);
  });

  test('selects an option from a plain menu and updates value', async ({ mount, page }) => {
    await mount<typeof PlainMenuHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/PlainMenuHarness'
    );
    await page.getByRole('button', { name: /select the region/i }).click();
    await expect(page.getByRole('option', { name: 'eu-west-1' })).toBeVisible();
    await checkMenuAccessibility(page);
    await page.getByRole('option', { name: 'eu-west-1' }).click();
    await expect(page.getByTestId('menu-val')).toHaveText('eu-west-1');
    await expect(page.getByRole('option', { name: 'eu-west-1' })).toBeHidden();
    await checkMenuAccessibility(page);
  });

  test('filters options in typeahead mode', async ({ mount, page }) => {
    await mount<typeof TypeaheadHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/TypeaheadHarness'
    );
    const combo = page.getByRole('combobox', { name: /select the subnet/i });
    await combo.click();
    await combo.fill('subnet');
    await expect(page.getByRole('option', { name: 'subnet-a' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'other-net' })).toHaveCount(0);
    await checkMenuAccessibility(page);
  });

  test('shows all options when reopening a typeahead after selection', async ({ mount, page }) => {
    await mount<typeof TypeaheadHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/TypeaheadHarness'
    );
    const combo = page.getByRole('combobox', { name: /select the subnet/i });

    // Select an option
    await combo.click();
    await page.getByRole('option', { name: 'subnet-a' }).click();

    // Reopen — all options should be visible (no leftover filter)
    await combo.click();
    await expect(page.getByRole('option', { name: 'subnet-a' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'subnet-b' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'other-net' })).toBeVisible();
  });

  test('re-selecting the same typeahead option keeps the selection', async ({ mount, page }) => {
    await mount<typeof TypeaheadHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/TypeaheadHarness'
    );
    const combo = page.getByRole('combobox', { name: /select the subnet/i });

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
    await mount<typeof PreselectedTypeaheadHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/PreselectedTypeaheadHarness'
    );
    const combo = page.getByRole('combobox', { name: /select the subnet/i });

    // Typeahead input must display the preselected option label, not blank
    await expect(combo).toHaveValue('subnet-a');
    await expect(page.getByTestId('ta-preselected-val')).toHaveText('subnet-a');

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
    await expect(page.getByRole('combobox', { name: /select the subnet/i })).toBeDisabled();
    await checkMenuAccessibility(page);
  });

  test('invokes onRefresh when the refresh control is pressed', async ({ mount, page }) => {
    await mount<typeof RefreshHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Select/Select/RefreshHarness'
    );
    await page.getByRole('button', { name: 'Refresh' }).click();
    await expect(page.getByTestId('refresh-count')).toHaveText('1');
  });
});
