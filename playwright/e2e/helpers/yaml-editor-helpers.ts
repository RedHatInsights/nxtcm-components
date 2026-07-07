import type { Page } from '@playwright/test';

/**
 * Navigate from wizard start to YAML editor
 */
export async function navigateToYamlEditor(page: Page): Promise<void> {
  // Fill wizard steps to reach review
  await fillDetailsStep(page);
  await fillRolesStep(page);
  await fillMachinePoolsStep(page);
  await fillNetworkingStep(page);
  await page.getByRole('button', { name: 'Next' }).click(); // Encryption
  await page.getByRole('button', { name: 'Next' }).click(); // Updates

  // Open YAML editor from review page
  await page.getByRole('button', { name: 'Edit in YAML' }).click();

  // Wait for Monaco editor to be fully initialized
  await page.locator('.monaco-editor').waitFor({ state: 'visible' });

  // Wait for Monaco editor to be available on window
  await page.waitForFunction(
    () => {
      return (window as Window & { monacoEditor?: unknown }).monacoEditor !== undefined;
    },
    { timeout: 5000 }
  );

  // Give Monaco a moment to load content
  await page.waitForTimeout(500);
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
  await page.getByRole('textbox', { name: 'Cluster name' }).fill('test-cluster');
  await page.getByRole('textbox', { name: 'Cluster name' }).press('Tab');
  await page.getByRole('combobox', { name: 'Select an OpenShift version' }).click();
  await page.getByRole('option', { name: 'OpenShift 4.12.0' }).click();
  await page.getByRole('combobox', { name: 'Select an AWS infrastructure account' }).click();
  await page.getByRole('option', { name: 'AWS Account - Production (123456789012)' }).click();
  await page.getByRole('combobox', { name: 'Select an AWS billing account' }).click();
  await page.getByRole('option', { name: 'Billing Account - Main (123456789012)' }).click();
  await page.getByRole('combobox', { name: 'Select a region' }).click();
  await page.getByRole('option', { name: 'US East (N. Virginia)' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
}

/**
 * Fill Roles step (installer role, OIDC config)
 */
export async function fillRolesStep(page: Page): Promise<void> {
  await page.getByTestId('installer-role-select').click();
  await page.getByRole('option', { name: /ManagedOpenShift-HCP-ROSA-Installer-Role/ }).click();
  await page.getByTestId('oidc-config-select').click();
  await page.getByRole('option', { name: '2kl4t2st8eg2u5jppv8kjeemkvimfm99' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
}

/**
 * Fill Machine Pools step (VPC, subnet, instance type)
 */
export async function fillMachinePoolsStep(page: Page): Promise<void> {
  await page
    .getByRole('button', { name: 'Select a VPC to install your machine pool into us-east-1' })
    .click();
  await page.getByRole('option', { name: 'test-vpc-1' }).click();
  await page.getByRole('button', { name: 'Select private subnet' }).click();
  await page.getByRole('option', { name: 'test-1-subnet-private1-us-east-1a' }).click();
  await page.getByRole('button', { name: 'Select the compute node instance type' }).click();
  await page.getByRole('option', { name: 'm5a.xlarge' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
}

/**
 * Fill Networking step (use defaults)
 */
export async function fillNetworkingStep(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Next' }).click();
}
