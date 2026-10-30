import type { Page } from './fixtures';
import { expect, test } from './fixtures';
import { checkPageAccessibility } from './helpers/accessibility-helpers';
import { navigateToYamlEditor } from './helpers/yaml-editor-helpers';

// The E2E harness mounts the library without a consuming application's shell.
// These structural rules are covered by the host application and are not
// meaningful for this repository-level page fixture.
const harnessRules = ['landmark-one-main', 'page-has-heading-one', 'region'];

async function fillDetailsStep(page: Page): Promise<void> {
  await page.getByRole('textbox', { name: /Cluster name/i }).fill('test-cluster');
  await page.getByRole('textbox', { name: /Cluster name/i }).press('Tab');
  await page.getByRole('combobox', { name: /Select an OpenShift version/i }).click();
  await page.getByRole('option', { name: /OpenShift 4\.12\.0/i }).click();
  await page.getByRole('combobox', { name: /Select an AWS infrastructure account/i }).click();
  await page.getByRole('option', { name: /AWS Account - Production \(123456789012\)/i }).click();
  await page.getByRole('combobox', { name: /Select an AWS billing account/i }).click();
  await page.getByRole('option', { name: /Billing Account - Main \(123456789012\)/i }).click();
  await page.getByRole('combobox', { name: /Select a region/i }).click();
  await page.getByRole('option', { name: /US East \(N\. Virginia\)/i }).click();
  await page.getByRole('button', { name: /Next/i }).click();
}

async function navigateToReview(page: Page): Promise<void> {
  await fillDetailsStep(page);
  await page.getByTestId('installer-role-select').click();
  await page.getByRole('option', { name: /ManagedOpenShift-HCP-ROSA-Installer-Role/ }).click();
  await page.getByTestId('oidc-config-select').click();
  await page.getByRole('option', { name: /2kl4t2st8eg2u5jppv8kjeemkvimfm99/i }).click();
  await page.getByRole('button', { name: /Next/i }).click();
  await page
    .getByRole('combobox', { name: /Select a VPC to install your machine pool into us-east-1/i })
    .click();
  await page.getByRole('option', { name: /test-vpc-1/i }).click();
  await page.getByRole('combobox', { name: /Select private subnet/i }).click();
  await page.getByRole('option', { name: /test-1-subnet-private1-us-east-1a/i }).click();
  await page.getByRole('combobox', { name: /Select the compute node instance type/i }).click();
  await page.getByRole('option', { name: /m5a\.xlarge/i }).click();
  await page.getByRole('button', { name: /Next/i }).click();
  await page.getByRole('button', { name: /public subnet name/i }).click();
  await page.getByRole('option', { name: /test-1-subnet-public1-us-east-1a/i }).click();
  await page.getByRole('button', { name: /Next/i }).click();
  await page.getByRole('button', { name: /Next/i }).click();
  await page.getByRole('button', { name: /Next/i }).click();
  await expect(page.getByRole('button', { name: /Create cluster/i })).toBeVisible();
}

test.describe('Page-level accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('scans the initial wizard page', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: /Cluster name/i })).toBeVisible();
    await checkPageAccessibility(page, 'initial wizard', harnessRules);
  });

  test('scans an open select portal', async ({ page }) => {
    await page.getByRole('combobox', { name: /Select an OpenShift version/i }).click();
    await expect(page.getByRole('option', { name: /OpenShift 4\.12\.0/i })).toBeVisible();
    // PatternFly's current typeahead popup contributes these findings while
    // FCN-815/FCN-829 track its listbox semantics and FCN-821 tracks contrast.
    await checkPageAccessibility(page, 'open version select', [
      ...harnessRules,
      'aria-input-field-name',
      'aria-required-children',
      'aria-valid-attr-value',
      'color-contrast',
    ]);
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
  });
});
