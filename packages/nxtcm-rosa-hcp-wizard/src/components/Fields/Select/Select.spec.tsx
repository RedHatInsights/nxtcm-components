import { expect, test } from '@playwright/experimental-ct-react';
import {
  PlainMenuHarness,
  RefreshHarness,
  TypeaheadHarness,
  DisabledTypeaheadHarness,
} from './Select.spec-helpers';

test.describe('Select', () => {
  test('selects an option from a plain menu and updates value', async ({ mount, page }) => {
    await mount(<PlainMenuHarness />);
    await page.getByRole('button', { name: /select the region/i }).click();
    await page.getByRole('option', { name: 'eu-west-1' }).click();
    await expect(page.getByTestId('menu-val')).toHaveText('eu-west-1');
  });

  test('filters options in typeahead mode', async ({ mount, page }) => {
    await mount(<TypeaheadHarness />);
    const combo = page.getByRole('combobox', { name: /select the subnet/i });
    await combo.click();
    await combo.fill('subnet');
    await expect(page.getByRole('option', { name: 'subnet-a' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'other-net' })).toHaveCount(0);
  });

  test('shows all options when reopening a typeahead after selection', async ({ mount, page }) => {
    await mount(<TypeaheadHarness />);
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
    await mount(<TypeaheadHarness />);
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
  });

  test('disables the typeahead combobox when isDisabled is set', async ({ mount, page }) => {
    await mount(<DisabledTypeaheadHarness />);
    await expect(page.getByRole('combobox', { name: /select the subnet/i })).toBeDisabled();
  });

  test('invokes onRefresh when the refresh control is pressed', async ({ mount, page }) => {
    await mount(<RefreshHarness />);
    await page.getByRole('button', { name: 'Refresh' }).click();
    await expect(page.getByTestId('refresh-count')).toHaveText('1');
  });
});
