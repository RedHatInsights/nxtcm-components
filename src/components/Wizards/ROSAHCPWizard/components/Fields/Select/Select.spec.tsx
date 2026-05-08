import { test, expect } from '@playwright/experimental-ct-react';

import { PlainMenuHarness, RefreshHarness, TypeaheadHarness } from './Select.spec-helpers';

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

  test('invokes onRefresh when the refresh control is pressed', async ({ mount, page }) => {
    await mount(<RefreshHarness />);
    await page.getByRole('button', { name: 'Refresh' }).click();
    await expect(page.getByTestId('refresh-count')).toHaveText('1');
  });
});
