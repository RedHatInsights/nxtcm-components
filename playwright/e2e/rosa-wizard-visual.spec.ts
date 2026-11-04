import { test, expect } from './fixtures';

test.describe('ROSA Wizard visual comparisons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('textbox', { name: 'Cluster name', exact: true })).toBeVisible();
    await expect(
      page.getByRole('combobox', { name: 'Select an OpenShift version', exact: true })
    ).toBeVisible();
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
  });

  test('initial wizard viewport', async ({ page }) => {
    await expect(page).toHaveScreenshot('rosa-wizard-initial.png');
  });

  test('Details section', async ({ page }) => {
    const details = page.getByRole('group').filter({
      has: page.getByRole('textbox', { name: 'Cluster name', exact: true }),
    });
    await expect(details).toHaveCount(1);
    await expect(details).toHaveScreenshot('rosa-wizard-details.png');
  });
});
