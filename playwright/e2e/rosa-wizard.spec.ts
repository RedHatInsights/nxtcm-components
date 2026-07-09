import { test, expect, Page } from './fixtures';

async function expandOperatorPrefixSection(page: Page) {
  await page.getByRole('button', { name: 'Operator role prefix', exact: true }).click();
}

async function fillDetailsStep(page: Page) {
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

async function fillRolesStep(page: Page) {
  await page.getByTestId('installer-role-select').click();
  await page.getByRole('option', { name: /ManagedOpenShift-HCP-ROSA-Installer-Role/ }).click();
  await page.getByTestId('oidc-config-select').click();
  await page.getByRole('option', { name: '2kl4t2st8eg2u5jppv8kjeemkvimfm99' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
}

async function fillMachinePoolsStep(page: Page) {
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

async function fillNetworkingStep(page: Page) {
  await page.getByRole('button', { name: 'Next' }).click();
}

async function openCidrFields(page: Page) {
  await fillDetailsStep(page);
  await fillRolesStep(page);
  await fillMachinePoolsStep(page);
  await page.getByRole('button', { name: 'Advanced networking configuration (optional)' }).click();
  await page.getByRole('checkbox', { name: 'Use default values' }).click();
}

test.describe('ROSA Wizard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('completes full wizard flow selecting first option in each dropdown and verifies review page', async ({
    page,
  }) => {
    const clusterNameInput = page.getByRole('textbox', { name: 'Cluster name' });
    await expect(clusterNameInput).toBeVisible();

    await clusterNameInput.fill('test-cluster');
    await clusterNameInput.press('Tab');

    await page.getByRole('combobox', { name: 'Select an OpenShift version' }).click();
    await page.getByRole('option', { name: 'OpenShift 4.12.0' }).click();

    await page.getByRole('combobox', { name: 'Select an AWS infrastructure account' }).click();
    await page.getByRole('option', { name: 'AWS Account - Production (123456789012)' }).click();

    await page.getByRole('combobox', { name: 'Select an AWS billing account' }).click();
    await page.getByRole('option', { name: 'Billing Account - Main (123456789012)' }).click();

    await page.getByRole('combobox', { name: 'Select a region' }).click();
    await page.getByRole('option', { name: 'US East (N. Virginia)' }).click();

    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page.getByTestId('installer-role-select')).toBeVisible();

    await page.getByTestId('installer-role-select').click();
    await page.getByRole('option', { name: /ManagedOpenShift-HCP-ROSA-Installer-Role/ }).click();

    await page.getByTestId('oidc-config-select').click();
    await page.getByRole('option', { name: '2kl4t2st8eg2u5jppv8kjeemkvimfm99' }).click();

    await page.getByRole('button', { name: 'Next' }).click();

    await expect(
      page.getByRole('button', { name: 'Select a VPC to install your machine pool into us-east-1' })
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'Select a VPC to install your machine pool into us-east-1' })
      .click();
    await page.getByRole('option', { name: 'test-vpc-1' }).click();

    await page.getByRole('button', { name: 'Select private subnet' }).click();
    await page.getByRole('option', { name: 'test-1-subnet-private1-us-east-1a' }).click();

    await page.getByRole('button', { name: 'Select the compute node instance type' }).click();
    await page.getByRole('option', { name: 'm5a.xlarge' }).click();

    await page.getByRole('button', { name: 'Next' }).click();

    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page.getByRole('radio', { name: 'Use default AWS KMS key' })).toBeVisible();

    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page.getByRole('radio', { name: 'Manual updates' })).toBeVisible();

    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page.getByRole('button', { name: 'Create cluster' })).toBeVisible();

    await expect(page.getByText('test-cluster', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('4.12.0', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('ManagedOpenShift-HCP-ROSA-Installer-Role').first()).toBeVisible();
    await expect(
      page.getByText('2kl4t2st8eg2u5jppv8kjeemkvimfm99', { exact: true }).first()
    ).toBeVisible();
    await expect(page.getByText(/test-cluster-[a-z][a-z0-9]+/).first()).toBeVisible();
    await expect(page.getByText('m5a.xlarge', { exact: true }).first()).toBeVisible();
  });

  test.describe('validation', () => {
    test.describe('Details - cluster name', () => {
      test('blank shows Required', async ({ page }) => {
        const input = page.getByRole('textbox', { name: 'Cluster name' });
        await input.focus();
        await input.press('Tab');
        await expect(page.getByText('Required').first()).toBeVisible();
      });

      test('"a b" rejects invalid characters', async ({ page }) => {
        const input = page.getByRole('textbox', { name: 'Cluster name' });
        await input.fill('a b');
        await input.press('Tab');
        await expect(
          page.getByText(
            "This value can only contain lowercase alphanumeric characters or '-' or '.'"
          )
        ).toBeVisible();
      });

      test('starting with a number is rejected', async ({ page }) => {
        const input = page.getByRole('textbox', { name: 'Cluster name' });
        await input.fill('1cluster');
        await input.press('Tab');
        await expect(page.getByText('This value must not start with a number')).toBeVisible();
      });

      test('ending with a non-alphanumeric character is rejected', async ({ page }) => {
        const input = page.getByRole('textbox', { name: 'Cluster name' });
        await input.fill('cluster-');
        await input.press('Tab');
        await expect(
          page.getByText('This value must end with an alphanumeric character')
        ).toBeVisible();
      });

      test('more than 54 characters is rejected', async ({ page }) => {
        const input = page.getByRole('textbox', { name: 'Cluster name' });
        await input.fill('a'.repeat(55));
        await input.press('Tab');
        await expect(page.getByText('This value can contain at most 54 characters')).toBeVisible();
      });
    });

    test.describe('Roles and policies - operator prefix', () => {
      test('"a b" rejects invalid characters', async ({ page }) => {
        await fillDetailsStep(page);
        await expandOperatorPrefixSection(page);
        const input = page.getByRole('textbox', { name: 'Operator roles prefix' });
        await input.fill('a b');
        await input.press('Tab');
        await expect(
          page.getByText(/isn't valid, must consist of lower-case alphanumeric characters/)
        ).toBeVisible();
      });

      test('more than 32 characters is rejected', async ({ page }) => {
        await fillDetailsStep(page);
        await expandOperatorPrefixSection(page);
        const input = page.getByRole('textbox', { name: 'Operator roles prefix' });
        await input.fill('a'.repeat(33));
        await input.press('Tab');
        await expect(page.getByText(/may not exceed 32 characters/)).toBeVisible();
      });
    });

    test.describe('Networking - CIDR fields', () => {
      test('Machine CIDR - "a b" rejects invalid CIDR notation', async ({ page }) => {
        await openCidrFields(page);
        const input = page.getByRole('textbox', { name: 'Machine CIDR' });
        await input.fill('a b');
        await input.press('Tab');
        await expect(page.getByText(/isn't valid CIDR notation/)).toBeVisible();
      });

      test('Service CIDR - "a b" rejects invalid CIDR notation', async ({ page }) => {
        await openCidrFields(page);
        const input = page.getByRole('textbox', { name: 'Service CIDR' });
        await input.fill('a b');
        await input.press('Tab');
        await expect(page.getByText(/isn't valid CIDR notation/)).toBeVisible();
      });

      test('Pod CIDR - "a b" rejects invalid CIDR notation', async ({ page }) => {
        await openCidrFields(page);
        const input = page.getByRole('textbox', { name: 'Pod CIDR' });
        await input.fill('a b');
        await input.press('Tab');
        await expect(page.getByText(/isn't valid CIDR notation/)).toBeVisible();
      });

      test('Host prefix - "a b" rejects invalid subnet mask', async ({ page }) => {
        await openCidrFields(page);
        const input = page.getByRole('textbox', { name: 'Host prefix' });
        await input.fill('a b');
        await input.press('Tab');
        await expect(page.getByText(/isn't a valid subnet mask/)).toBeVisible();
      });
    });

    test.describe('Encryption - custom KMS key ARN', () => {
      test('blank shows Required', async ({ page }) => {
        await fillDetailsStep(page);
        await fillRolesStep(page);
        await fillMachinePoolsStep(page);
        await fillNetworkingStep(page);
        await page.getByRole('radio', { name: 'Use custom AWS KMS key' }).click();
        const input = page.getByRole('textbox', { name: 'Key ARN' }).first();
        await input.focus();
        await input.press('Tab');
        await expect(page.getByText('Required').first()).toBeVisible();
      });

      test('"a b" rejects values with whitespace', async ({ page }) => {
        await fillDetailsStep(page);
        await fillRolesStep(page);
        await fillMachinePoolsStep(page);
        await fillNetworkingStep(page);
        await page.getByRole('radio', { name: 'Use custom AWS KMS key' }).click();
        const input = page.getByRole('textbox', { name: 'Key ARN' }).first();
        await input.fill('a b');
        await input.press('Tab');
        await expect(page.getByText('Value must not contain whitespaces.')).toBeVisible();
      });

      test('invalid ARN format is rejected', async ({ page }) => {
        await fillDetailsStep(page);
        await fillRolesStep(page);
        await fillMachinePoolsStep(page);
        await fillNetworkingStep(page);
        await page.getByRole('radio', { name: 'Use custom AWS KMS key' }).click();
        const input = page.getByRole('textbox', { name: 'Key ARN' }).first();
        await input.fill('not-a-valid-arn');
        await input.press('Tab');
        await expect(page.getByText(/Key provided is not a valid ARN/)).toBeVisible();
      });
    });

    test.describe('Encryption - etcd key ARN', () => {
      test('blank shows Required', async ({ page }) => {
        await fillDetailsStep(page);
        await fillRolesStep(page);
        await fillMachinePoolsStep(page);
        await fillNetworkingStep(page);
        await page.getByRole('checkbox', { name: 'Enable additional etcd encryption' }).click();
        const input = page.getByRole('textbox', { name: 'Key ARN' }).first();
        await input.focus();
        await input.press('Tab');
        await expect(page.getByText('Required').first()).toBeVisible();
      });

      test('"a b" rejects values with whitespace', async ({ page }) => {
        await fillDetailsStep(page);
        await fillRolesStep(page);
        await fillMachinePoolsStep(page);
        await fillNetworkingStep(page);
        await page.getByRole('checkbox', { name: 'Enable additional etcd encryption' }).click();
        const input = page.getByRole('textbox', { name: 'Key ARN' }).first();
        await input.fill('a b');
        await input.press('Tab');
        await expect(page.getByText('Value must not contain whitespaces.')).toBeVisible();
      });
    });
  });
});
