import { test, expect } from '../../../../ct-fixture';

test.describe('FieldWithAPIErrorAlert', () => {
  test('shows alert and message body when string error is provided', async ({ mount, page }) => {
    const component = await mount(
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
    const component = await mount(
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
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/components/FieldWithAPIErrorAlert/FieldWithAPIErrorAlertStory',
      { error: 'There has been an error', isFetching: true, isValidation: true }
    );

    await expect(component.getByText('Field content')).toBeVisible();
    await expect(component.getByText('Error validating region')).toHaveCount(0);
    await expect(page.getByText('There has been an error')).toHaveCount(0);
  });
});
