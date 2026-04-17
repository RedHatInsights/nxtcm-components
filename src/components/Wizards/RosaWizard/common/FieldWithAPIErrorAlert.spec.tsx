import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { FieldWithAPIErrorAlert } from './FieldWithAPIErrorAlert';
import { RosaWizardStringsProvider } from '../RosaWizardStringsContext';

/**
 * Wraps UI in `RosaWizardStringsProvider` because `FieldWithAPIErrorAlert` reads wizard string hooks.
 */
function withRosaStrings(ui: React.ReactElement) {
  return <RosaWizardStringsProvider>{ui}</RosaWizardStringsProvider>;
}

/** CT for API/validation error chrome: summary alert, optional detail popover, and loading suppression. */
test.describe('FieldWithAPIErrorAlert', () => {
  /** String errors show the field summary and reveal the message body via Show error details. */
  test('shows alert and message body when string error is provided', async ({ mount, page }) => {
    const component = await mount(
      withRosaStrings(
        <FieldWithAPIErrorAlert
          error="There has been an error"
          isFetching={false}
          fieldName="region"
        >
          <div>Field content</div>
        </FieldWithAPIErrorAlert>
      )
    );

    await expect(component.getByText('Field content')).toBeVisible();
    await expect(component.getByText('Error loading region list')).toBeVisible();
    await component.getByRole('button', { name: 'Show error details' }).click();
    await expect(page.getByText('There has been an error')).toBeVisible({ timeout: 10_000 });
  });

  /** Boolean `true` errors show summary text only—no details button or popover/dialog content. */
  test('shows summary helper only when error is boolean true (no popover)', async ({
    mount,
    page,
  }) => {
    const component = await mount(
      withRosaStrings(
        <FieldWithAPIErrorAlert error={true} isFetching={false} fieldName="region">
          <div>Field content</div>
        </FieldWithAPIErrorAlert>
      )
    );

    await expect(component.getByText('Field content')).toBeVisible();
    await expect(component.getByText('Error loading region list')).toBeVisible();
    await expect(component.getByRole('button', { name: 'Show error details' })).toHaveCount(0);
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    await expect(page.getByText('There has been an error')).toHaveCount(0);
  });

  /** While fetching, validation-style errors are suppressed (no summary or stray dialog text). */
  test('does not show alert when isFetching is true', async ({ mount, page }) => {
    const component = await mount(
      withRosaStrings(
        <FieldWithAPIErrorAlert
          error="There has been an error"
          isFetching
          fieldName="region"
          isValidation
        >
          <div>Field content</div>
        </FieldWithAPIErrorAlert>
      )
    );

    await expect(component.getByText('Field content')).toBeVisible();
    await expect(component.getByText('Error validating region')).toHaveCount(0);
    await expect(page.getByText('There has been an error')).toHaveCount(0);
  });
});
