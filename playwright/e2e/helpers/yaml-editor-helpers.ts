import { expect, type Page } from '@playwright/test';

/**
 * Navigate from wizard start to YAML editor
 */
export async function navigateToYamlEditor(page: Page): Promise<void> {
  // Fill wizard steps to reach review
  await fillDetailsStep(page);
  await fillRolesStep(page);
  await fillMachinePoolsStep(page);
  await fillNetworkingStep(page);
  await page.getByRole('button', { name: /Next/i }).click(); // Encryption
  await page.getByRole('button', { name: /Next/i }).click(); // Updates

  // Open YAML editor from review page
  await page.getByRole('button', { name: /Edit in YAML/i }).click();

  await expect(page.getByRole('textbox', { name: /Editor content/ })).toBeVisible();
  await expect.poll(() => getMonacoYaml(page)).toContain('kind: ROSAControlPlane');
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

/** Type through Monaco's keyboard surface and wait for the resulting document. */
export async function appendYamlComment(page: Page, comment: string): Promise<void> {
  const editor = page.getByRole('textbox', { name: /Editor content/ });
  await editor.press('ControlOrMeta+End');
  await editor.press('End');
  await editor.press('Enter');
  await editor.pressSequentially(`# ${comment}`);
  await expect.poll(() => getMonacoYaml(page)).toContain(`# ${comment}`);
}

/**
 * Fill Details step (cluster name, version, accounts, region)
 */
export async function fillDetailsStep(page: Page): Promise<void> {
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
    .getByRole('combobox', { name: /Select a VPC to install your machine pool into us-east-1/i })
    .click();
  await page.getByRole('option', { name: /test-vpc-1/i }).click();
  await page.getByRole('combobox', { name: /Select private subnet/i }).click();
  await page.getByRole('option', { name: /test-1-subnet-private1-us-east-1a/i }).click();
  await page.getByRole('combobox', { name: /Select the compute node instance type/i }).click();
  await page.getByRole('option', { name: /m5a\.xlarge/i }).click();
  await page.getByRole('button', { name: /Next/i }).click();
}

/**
 * Fill Networking step (select public subnet for public endpoint access)
 */
async function fillNetworkingStep(page: Page): Promise<void> {
  // Public endpoint access is selected by default, need to select public subnet
  await page.getByRole('button', { name: /Select public subnet name/i }).click();
  await page.getByRole('option', { name: /test-1-subnet-public1-us-east-1a/i }).click();
  await page.getByRole('button', { name: /Next/i }).click();
}
