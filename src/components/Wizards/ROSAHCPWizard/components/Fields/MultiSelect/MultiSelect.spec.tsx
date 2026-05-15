import { test, expect } from '@playwright/experimental-ct-react';

import {
  MultiBadgeHarness,
  MultiGroupedHarness,
  MultiLegacyToggleHarness,
  MultiLoadingHarness,
  MultiPlainHarness,
  MultiRefreshHarness,
} from './MultiSelect.spec-helpers';

test.describe('MultiSelect', () => {
  test('toggles multiple options and updates value', async ({ mount, page }) => {
    await mount(<MultiPlainHarness />);
    await page.getByRole('button', { name: /select the zones/i }).click();
    const listbox = page.locator('#ct-multi-plain-listbox');
    await expect(listbox).toBeVisible();
    await listbox.getByText('a', { exact: true }).click();
    await listbox.getByText('b', { exact: true }).click();
    await expect(page.getByTestId('multi-val')).toHaveText('a,b');
    await listbox.getByText('a', { exact: true }).click();
    await expect(page.getByTestId('multi-val')).toHaveText('b');
  });

  test('invokes onRefresh when the refresh control is pressed', async ({ mount, page }) => {
    await mount(<MultiRefreshHarness />);
    await page.getByRole('button', { name: 'Refresh' }).click();
    await expect(page.getByTestId('multi-refresh-count')).toHaveText('1');
  });

  test('renders grouped options and records selections', async ({ mount, page }) => {
    await mount(<MultiGroupedHarness />);
    await page.getByRole('button', { name: /select the grouped zones/i }).click();
    const listbox = page.locator('#ct-multi-grouped-listbox');
    await expect(listbox).toBeVisible();
    await listbox.getByText('a1', { exact: true }).click();
    await listbox.getByText('b1', { exact: true }).click();
    await expect(page.getByTestId('multi-grouped-val')).toHaveText('a1,b1');
  });

  test('shows a loading row in the menu when isLoading is true', async ({ mount, page }) => {
    await mount(<MultiLoadingHarness />);
    await page.getByRole('button', { name: /^loading/i }).click();
    const listbox = page.locator('#ct-multi-loading-listbox');
    await expect(listbox).toBeVisible();
    await expect(listbox.getByText('Loading...')).toBeVisible();
  });

  test('shows a count badge on the toggle when multiple values are selected', async ({
    mount,
    page,
  }) => {
    await mount(<MultiBadgeHarness />);
    const toggle = page.getByRole('button', { name: /select the regions/i });
    await toggle.click();
    const listbox = page.locator('#ct-multi-badge-listbox');
    await expect(listbox).toBeVisible();
    await listbox.getByText('us-east-1', { exact: true }).click();
    await listbox.getByText('eu-west-1', { exact: true }).click();
    await expect(toggle).toContainText('2');
  });

  test('uses legacy toggle labels when checkboxMenuToggle is false', async ({ mount, page }) => {
    await mount(<MultiLegacyToggleHarness />);
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
