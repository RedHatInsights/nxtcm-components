import { expect, test } from './fixtures';
import { checkPageAccessibility, harnessRules } from './helpers/accessibility-helpers';
import { navigateToReview, navigateToYamlEditor } from './helpers/yaml-editor-helpers';

test.describe('Page-level accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('scans the initial wizard page', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: /Cluster name/i })).toBeVisible();
    await checkPageAccessibility(page, 'initial wizard', harnessRules);
  });

  test('scans an open select portal', async ({ page }) => {
    await page.getByRole('combobox', { name: /^OpenShift version$/i }).click();
    await expect(page.getByRole('option', { name: /OpenShift 4\.12\.0/i })).toBeVisible();
    await checkPageAccessibility(page, 'open version select', harnessRules);
  });

  test('scans the review page', async ({ page }) => {
    await navigateToReview(page);
    await expect(page.getByRole('button', { name: /Create cluster/i })).toBeVisible();
    await checkPageAccessibility(page, 'review page', harnessRules);
  });

  test('scans the YAML editor and discard dialog', async ({ page }) => {
    await navigateToYamlEditor(page);
    await expect(page.locator('.monaco-editor')).toBeVisible();
    // Monaco's syntax highlighting colors are owned by the editor theme and
    // are covered by the dedicated editor/theme accessibility tickets.
    await checkPageAccessibility(page, 'YAML editor', [...harnessRules, 'color-contrast']);
    await page.getByRole('button', { name: /Discard changes and go back to Review step/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await checkPageAccessibility(page, 'YAML discard dialog', [...harnessRules, 'color-contrast']);
    await checkPageAccessibility(page, 'YAML discard dialog contrast', harnessRules, {
      include: '[role="dialog"]',
    });
  });
});
