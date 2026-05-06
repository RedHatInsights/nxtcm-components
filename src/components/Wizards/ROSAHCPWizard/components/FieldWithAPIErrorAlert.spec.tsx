import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { FieldWithAPIErrorAlert } from './FieldWithAPIErrorAlert';
import { RosaHcpWizardStringsProvider } from '../stringsProvider/RosaHcpWizardStringsContext';

/** `FieldWithAPIErrorAlert` uses `useRosaWizardStrings`, which requires this provider. */
function withRosaStrings(ui: React.ReactElement) {
  return <RosaHcpWizardStringsProvider>{ui}</RosaHcpWizardStringsProvider>;
}

test.describe('FieldWithAPIErrorAlert', () => {
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
