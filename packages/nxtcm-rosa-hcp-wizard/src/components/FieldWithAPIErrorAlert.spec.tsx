import { expect, test } from '@/playwright/ct-fixture';

import { defaultRosaHcpWizardStrings } from '../stringsProvider/rosaHcpWizardStrings.defaults';
import { checkAccessibility } from '../test-helpers';
import type { FieldWithAPIErrorAlertStory } from './FieldWithAPIErrorAlert.story';

test.describe('FieldWithAPIErrorAlert', () => {
  test('passes accessibility check with error details and retry action', async ({
    mount,
    page,
  }) => {
    const component = await mount<typeof FieldWithAPIErrorAlertStory>(
      'nxtcm-rosa-hcp-wizard/components/FieldWithAPIErrorAlert/FieldWithAPIErrorAlertStory',
      { error: 'There has been an error', retry: true }
    );

    await expect(component.getByText('Error loading region list')).toBeVisible();
    await checkAccessibility({ component });

    await component
      .getByRole('button', { name: defaultRosaHcpWizardStrings.common.showErrorDetails })
      .click();
    // The popover is portaled to document.body, outside the mounted component.
    const dialog = page.getByRole('dialog');
    const retryButton = dialog.getByRole('button', {
      name: defaultRosaHcpWizardStrings.common.retry,
      exact: true,
    });
    await expect(dialog.getByText('There has been an error')).toBeVisible();
    await expect(retryButton).toBeVisible();
    await checkAccessibility({ component: dialog });

    await retryButton.click();
    await expect(component.getByTestId('retry-count')).toHaveValue('1');
  });

  test('shows alert and message body when string error is provided', async ({ mount, page }) => {
    const component = await mount<typeof FieldWithAPIErrorAlertStory>(
      'nxtcm-rosa-hcp-wizard/components/FieldWithAPIErrorAlert/FieldWithAPIErrorAlertStory',
      { error: 'There has been an error' }
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
    const component = await mount<typeof FieldWithAPIErrorAlertStory>(
      'nxtcm-rosa-hcp-wizard/components/FieldWithAPIErrorAlert/FieldWithAPIErrorAlertStory',
      { error: true }
    );

    await expect(component.getByText('Field content')).toBeVisible();
    await expect(component.getByText('Error loading region list')).toBeVisible();
    await expect(component.getByRole('button', { name: 'Show error details' })).toHaveCount(0);
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    await expect(page.getByText('There has been an error')).toHaveCount(0);
  });

  test('does not show alert when isFetching is true', async ({ mount, page }) => {
    const component = await mount<typeof FieldWithAPIErrorAlertStory>(
      'nxtcm-rosa-hcp-wizard/components/FieldWithAPIErrorAlert/FieldWithAPIErrorAlertStory',
      { error: 'There has been an error', isFetching: true, isValidation: true }
    );

    await expect(component.getByText('Field content')).toBeVisible();
    await expect(component.getByText('Error validating region')).toHaveCount(0);
    await expect(page.getByText('There has been an error')).toHaveCount(0);
  });
});
