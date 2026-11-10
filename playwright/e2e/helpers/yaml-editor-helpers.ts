import type { Page } from '@playwright/test';

/**
 * Navigate from wizard start to YAML editor
 */
export async function navigateToYamlEditor(page: Page): Promise<void> {
  await navigateToReview(page);

  // Open YAML editor from review page
  await page.getByRole('button', { name: /Edit in YAML/i }).click();

  // Wait for Monaco editor to be fully initialized
  await page.locator('.monaco-editor').waitFor({ state: 'visible', timeout: 10000 });

  // Wait for Monaco editor to be available on window
  await page.waitForFunction(
    () => {
      const editor = (
        window as Window & {
          monacoEditor?: { getModel?: () => unknown };
        }
      ).monacoEditor;
      return editor?.getModel?.() != null;
    },
    { timeout: 10000 }
  );
}

/**
 * Fill the required wizard steps and advance to the Review step
 */
export async function navigateToReview(page: Page): Promise<void> {
  await fillDetailsStep(page);
  await fillRolesStep(page);
  await fillMachinePoolsStep(page);
  await fillNetworkingStep(page);
  await page.getByRole('button', { name: /Next/i }).click(); // Encryption
  await page.getByRole('button', { name: /Next/i }).click(); // Updates
}

/**
 * Get current YAML content from Monaco editor
 */
export async function getMonacoYaml(page: Page): Promise<string> {
  return await page.evaluate(() => {
    const editor = (window as Window & { monacoEditor?: { getValue: () => string } }).monacoEditor;
    return editor ? editor.getValue() : '';
  });
}

/**
 * Fill Details step (cluster name, version, accounts, region)
 */
export async function fillDetailsStep(page: Page): Promise<void> {
  await page.getByRole('textbox', { name: /Cluster name/i }).fill('test-cluster');
  await page.getByRole('textbox', { name: /Cluster name/i }).press('Tab');
  await page.getByRole('combobox', { name: /^OpenShift version$/i }).click();
  await page.getByRole('option', { name: /OpenShift 4\.12\.0/i }).click();
  await page.getByRole('combobox', { name: /Associated AWS infrastructure account/i }).click();
  await page.getByRole('option', { name: /AWS Account - Production \(123456789012\)/i }).click();
  await page.getByRole('combobox', { name: /Associated AWS billing account/i }).click();
  await page.getByRole('option', { name: /Billing Account - Main \(123456789012\)/i }).click();
  await page.getByRole('combobox', { name: /^Region$/i }).click();
  await page.getByRole('option', { name: /US East \(N\. Virginia\)/i }).click();
  await page.getByRole('button', { name: /Next/i }).click();
}

/**
 * Fill Roles step (installer role, OIDC config)
 */
async function fillRolesStep(page: Page): Promise<void> {
  await page.getByTestId('installer-role-select').click();
  await page.getByRole('option', { name: /ManagedOpenShift-HCP-ROSA-Installer-Role/ }).click();
  await page.getByTestId('oidc-config-select').click();
  await page.getByRole('option', { name: /2kl4t2st8eg2u5jppv8kjeemkvimfm99/i }).click();
  await page.getByRole('button', { name: /Next/i }).click();
}

/**
 * Fill Machine Pools step (VPC, subnet, instance type)
 */
async function fillMachinePoolsStep(page: Page): Promise<void> {
  await page
    .getByRole('combobox', {
      name: /Select a VPC to install your machine pool into your selected region: us-east-1/i,
    })
    .click();
  await page.getByRole('option', { name: /test-vpc-1/i }).click();
  await page.getByRole('combobox', { name: /Private subnet name/i }).click();
  await page.getByRole('option', { name: /test-1-subnet-private1-us-east-1a/i }).click();
  await page.getByRole('combobox', { name: /Compute node instance type/i }).click();
  await page.getByRole('option', { name: /m5a\.xlarge/i }).click();
  await page.getByRole('button', { name: /Next/i }).click();
}

/**
 * Fill Networking step (select public subnet for public endpoint access)
 */
async function fillNetworkingStep(page: Page): Promise<void> {
  // Public endpoint access is selected by default, need to select public subnet
  await page.getByRole('button', { name: /public subnet name/i }).click();
  await page.getByRole('option', { name: /test-1-subnet-public1-us-east-1a/i }).click();
  await page.getByRole('button', { name: /Next/i }).click();
}
