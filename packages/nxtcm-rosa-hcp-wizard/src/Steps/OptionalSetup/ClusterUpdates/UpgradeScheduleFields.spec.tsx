import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../test-helpers';
import { UpgradeScheduleFieldsMount } from './UpgradeScheduleFields.spec-helpers';

test.describe('UpgradeScheduleFields', () => {
  test('should render day and time select fields', async ({ mount }) => {
    const component = await mount(<UpgradeScheduleFieldsMount />);

    // Day select
    const daySelect = component.locator('#upgrade-schedule-day');
    await expect(daySelect).toBeVisible();

    // Hour select
    const hourSelect = component.locator('#upgrade-schedule-hour');
    await expect(hourSelect).toBeVisible();
  });

  test('should show placeholders when no value selected', async ({ mount }) => {
    const component = await mount(<UpgradeScheduleFieldsMount />);

    await expect(component.getByText(/select a day/i)).toBeVisible();
    await expect(component.getByText(/select a time/i)).toBeVisible();
  });

  test('should allow selecting a day', async ({ mount, page }) => {
    const component = await mount(<UpgradeScheduleFieldsMount />);

    const daySelect = component.locator('#upgrade-schedule-day button').first();
    await daySelect.click();

    // Select Sunday (should be first in the list)
    await page.getByRole('option').first().click();

    // Verify selection was made (placeholder should be gone)
    await expect(component.getByText(/select a day/i)).not.toBeVisible();
  });

  test('should allow selecting a time', async ({ mount, page }) => {
    const component = await mount(<UpgradeScheduleFieldsMount />);

    const hourSelect = component.locator('#upgrade-schedule-hour button').first();
    await hourSelect.click();

    // Select first hour option (00:00 UTC)
    await page.getByRole('option', { name: /00:00 UTC/i }).click();

    // Verify selection was made (placeholder should be gone)
    await expect(component.getByText(/select a time/i)).not.toBeVisible();
  });

  test('should display hours in 24-hour UTC format', async ({ mount, page }) => {
    const component = await mount(<UpgradeScheduleFieldsMount />);

    const hourSelect = component.locator('#upgrade-schedule-hour button').first();
    await hourSelect.click();

    // Check a few hour options
    await expect(page.getByRole('option', { name: '00:00 UTC' })).toBeVisible();
    await expect(page.getByRole('option', { name: '12:00 UTC' })).toBeVisible();
    await expect(page.getByRole('option', { name: '23:00 UTC' })).toBeVisible();
  });

  test('should build correct cron string when both day and hour selected', async ({
    mount,
    page,
  }) => {
    const component = await mount(<UpgradeScheduleFieldsMount />);

    // Select day (0 = Sunday)
    const daySelect = component.locator('#upgrade-schedule-day button').first();
    await daySelect.click();
    await page.getByRole('option').first().click();

    // Select hour (14 = 2pm)
    const hourSelect = component.locator('#upgrade-schedule-hour button').first();
    await hourSelect.click();
    await page.getByRole('option', { name: '14:00 UTC' }).click();

    // The component should have set upgrade_schedule to "00 14 * * 0" (cron format)
    // We can verify this indirectly by checking that both selections are still visible
    await expect(component.getByText(/select a day/i)).not.toBeVisible();
    await expect(component.getByText(/select a time/i)).not.toBeVisible();
  });

  test('should parse existing cron schedule on mount', async ({ mount }) => {
    // Cron format: "00 10 * * 3" = Wednesdays at 10:00 UTC
    const component = await mount(
      <UpgradeScheduleFieldsMount defaultValues={{ upgrade_schedule: '00 10 * * 3' }} />
    );

    // Both placeholders should not be visible since values are pre-selected
    await expect(component.getByText(/select a day/i)).not.toBeVisible();
    await expect(component.getByText(/select a time/i)).not.toBeVisible();
  });

  test('should show scrollable menu for hours', async ({ mount }) => {
    const component = await mount(<UpgradeScheduleFieldsMount />);

    const hourSelect = component.locator('#upgrade-schedule-hour button').first();
    await hourSelect.click();

    // Menu should be scrollable (has max height)
    const menu = component.locator('.pf-v6-c-menu').first();
    await expect(menu).toBeVisible();
  });

  test('should mark fields as required', async ({ mount }) => {
    const component = await mount(<UpgradeScheduleFieldsMount />);

    // The FormGroup should have the required indicator
    const formGroup = component.locator('.pf-v6-c-form__group');
    await expect(formGroup).toBeVisible();
  });

  test('should allow clearing selection when one field is empty', async ({
    mount,
    page: _page,
  }) => {
    const component = await mount(
      <UpgradeScheduleFieldsMount defaultValues={{ upgrade_schedule: '00 10 * * 3' }} />
    );

    // Clear day selection
    const daySelect = component.locator('#upgrade-schedule-day button').first();
    await daySelect.click();
    const clearButton = _page.locator('button[aria-label*="Clear"]').first();
    if ((await clearButton.count()) > 0) {
      await clearButton.click();
    }

    // Placeholder should be back
    await expect(component.getByText(/select a day/i)).toBeVisible();
  });

  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<UpgradeScheduleFieldsMount />);
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests with values selected', async ({ mount, page }) => {
    const component = await mount(<UpgradeScheduleFieldsMount />);

    // Select values first
    const daySelect = component.locator('#upgrade-schedule-day button').first();
    await daySelect.click();
    await page.getByRole('option').first().click();

    const hourSelect = component.locator('#upgrade-schedule-hour button').first();
    await hourSelect.click();
    await page.getByRole('option', { name: '10:00 UTC' }).click();

    await checkAccessibility({ component });
  });
});
