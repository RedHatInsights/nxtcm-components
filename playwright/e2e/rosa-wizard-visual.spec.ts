import type { Locator } from '@playwright/test';

import { expect, type Page, test } from './fixtures';
import {
  fillDetailsStep,
  fillMachinePoolsStep,
  fillNetworkingStep,
  fillRolesStep,
} from './helpers/yaml-editor-helpers';

async function fillVisualDetailsStep(page: Page): Promise<void> {
  await fillDetailsStep(page);
  // The generated prefix is random and appears in both the CLI command and Review.
  const toggle = page.getByRole('button', { name: 'Operator roles prefix', exact: true });
  await toggle.click();
  await page
    .getByRole('textbox', { name: 'Operator roles prefix', exact: true })
    .fill('test-cluster-visual');
  await toggle.click();
}

async function prepareWizardViewport(page: Page, ready: Locator): Promise<void> {
  await expect(ready).toBeVisible();
  await ready.evaluate(async (element) => {
    await document.fonts.ready;
    // Wizard steps scroll inside the page; reset each ancestor without relying on PF classes.
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
      parent.scrollTop = 0;
    }
  });
  await page.mouse.move(0, 0);
}

async function expectWizardFormScreenshot(
  page: Page,
  control: Locator,
  name: string
): Promise<void> {
  await prepareWizardViewport(page, control);
  // Step forms are unnamed. Scope by a unique control to capture all expanded fields.
  const form = page.locator('form').filter({ has: control });
  await expect(form).toHaveCount(1);
  await expect(form).toHaveScreenshot(name);
}

async function navigateToVisualMachinePools(page: Page): Promise<void> {
  await fillVisualDetailsStep(page);
  await fillRolesStep(page);
}

async function navigateToVisualNetworking(page: Page): Promise<void> {
  await navigateToVisualMachinePools(page);
  await fillMachinePoolsStep(page);
}

async function navigateToVisualEncryption(page: Page): Promise<void> {
  await navigateToVisualNetworking(page);
  await fillNetworkingStep(page);
}

test.describe('ROSA Wizard visual comparisons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('textbox', { name: 'Cluster name', exact: true })).toBeVisible();
    await expect(
      page.getByRole('combobox', { name: 'OpenShift version', exact: true })
    ).toBeVisible();
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
  });

  test('initial wizard viewport', async ({ page }) => {
    await expect(page).toHaveScreenshot('rosa-wizard-initial.png');
  });

  test('Details section', async ({ page }) => {
    // The step's unnamed form does not expose an accessible form role.
    const details = page.locator('form').filter({
      has: page.getByRole('textbox', { name: 'Cluster name', exact: true }),
    });
    await expect(details).toHaveCount(1);
    await expect(details).toHaveScreenshot('rosa-wizard-details.png');
  });

  test('Roles and policies viewport', async ({ page }) => {
    await fillVisualDetailsStep(page);
    await prepareWizardViewport(page, page.getByTestId('installer-role-select'));
    await expect(page).toHaveScreenshot('rosa-wizard-roles.png');
  });

  test('Machine pool viewport', async ({ page }) => {
    await fillVisualDetailsStep(page);
    await fillRolesStep(page);
    await prepareWizardViewport(
      page,
      page.getByRole('heading', { name: 'Machine pool', exact: true })
    );
    await expect(page).toHaveScreenshot('rosa-wizard-machine-pools.png');
  });

  test('Networking viewport', async ({ page }) => {
    await fillVisualDetailsStep(page);
    await fillRolesStep(page);
    await fillMachinePoolsStep(page);
    await prepareWizardViewport(
      page,
      page.getByRole('heading', { name: 'Networking', exact: true })
    );
    await expect(page).toHaveScreenshot('rosa-wizard-networking.png');
  });

  test('Encryption viewport', async ({ page }) => {
    await fillVisualDetailsStep(page);
    await fillRolesStep(page);
    await fillMachinePoolsStep(page);
    await fillNetworkingStep(page);
    await prepareWizardViewport(
      page,
      page.getByRole('heading', { name: 'Advanced encryption', exact: true })
    );
    await expect(page).toHaveScreenshot('rosa-wizard-encryption.png');
  });

  test('Cluster updates viewport', async ({ page }) => {
    await fillVisualDetailsStep(page);
    await fillRolesStep(page);
    await fillMachinePoolsStep(page);
    await fillNetworkingStep(page);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await prepareWizardViewport(
      page,
      page.getByRole('heading', { name: 'Cluster update strategy', exact: true })
    );
    await expect(page).toHaveScreenshot('rosa-wizard-updates.png');
  });

  test('populated Review viewport', async ({ page }) => {
    await fillVisualDetailsStep(page);
    await fillRolesStep(page);
    await fillMachinePoolsStep(page);
    await fillNetworkingStep(page);
    await page.getByRole('button', { name: 'Next', exact: true }).click(); // Encryption
    await page.getByRole('button', { name: 'Next', exact: true }).click(); // Updates
    await expect(page.getByRole('button', { name: 'Create cluster', exact: true })).toBeVisible();
    await expect(page.getByText('test-cluster', { exact: true })).toBeVisible();
    await prepareWizardViewport(
      page,
      page.getByRole('heading', { name: 'Review your ROSA cluster', exact: true })
    );
    await expect(page).toHaveScreenshot('rosa-wizard-review.png');
  });

  test('Details validation errors viewport', async ({ page }) => {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    const clusterName = page.getByRole('textbox', { name: 'Cluster name', exact: true });
    await expect(clusterName).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('This field is required', { exact: true })).toHaveCount(5);
    await expect(
      page.getByRole('combobox', { name: 'Associated AWS infrastructure account', exact: true })
    ).toBeFocused();
    await prepareWizardViewport(page, clusterName);
    // Focusing the account selector reveals its delayed tooltip.
    await expect(page.getByRole('tooltip')).toBeVisible();
    await expect(page).toHaveScreenshot('rosa-wizard-details-errors.png');
  });

  test('open OpenShift version dropdown viewport', async ({ page }) => {
    await page.getByRole('combobox', { name: 'OpenShift version', exact: true }).click();
    await prepareWizardViewport(page, page.getByRole('option', { name: /OpenShift 4\.12\.0/i }));
    await expect(page).toHaveScreenshot('rosa-wizard-version-dropdown.png');
  });

  test('Machine pool autoscaling form', async ({ page }) => {
    await navigateToVisualMachinePools(page);
    await page.getByRole('checkbox', { name: 'Enable autoscaling', exact: true }).check();
    const minimum = page.getByRole('spinbutton', { name: 'Min compute node count', exact: true });
    const maximum = page.getByRole('spinbutton', { name: 'Max compute node count', exact: true });
    await maximum.fill('6');
    await minimum.fill('2');
    await minimum.press('Tab');
    await expect(minimum).toHaveValue('2');
    await expect(maximum).toHaveValue('6');
    await expect(
      page.getByRole('spinbutton', { name: 'Compute node count', exact: true })
    ).toBeHidden();
    await expectWizardFormScreenshot(page, minimum, 'rosa-wizard-autoscaling.png');
  });

  test('advanced Machine pool form', async ({ page }) => {
    await navigateToVisualMachinePools(page);
    await fillMachinePoolsStep(page);
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page
      .getByRole('button', { name: 'Advanced machine pool configuration (optional)', exact: true })
      .click();
    const imdsV2 = page.getByRole('radio', { name: 'Use IMDSv2 only', exact: true });
    await imdsV2.check();
    const rootDisk = page.getByRole('spinbutton', { name: 'Root disk size', exact: true });
    await rootDisk.fill('150');
    await rootDisk.press('Tab');
    await expect(rootDisk).toHaveValue('150');
    await expect(imdsV2).toBeChecked();
    await expectWizardFormScreenshot(page, rootDisk, 'rosa-wizard-machine-pools-advanced.png');
  });

  test('private Networking viewport', async ({ page }) => {
    await navigateToVisualNetworking(page);
    const privateAccess = page.getByRole('radio', { name: /^Private\b/ });
    await privateAccess.check();
    await expect(privateAccess).toBeChecked();
    await expect(page.getByRole('button', { name: /public subnet name/i })).toBeHidden();
    await prepareWizardViewport(page, privateAccess);
    await expect(page).toHaveScreenshot('rosa-wizard-networking-private.png');
  });

  test('advanced Networking CIDR errors form', async ({ page }) => {
    await navigateToVisualNetworking(page);
    await page
      .getByRole('button', { name: 'Advanced networking configuration (optional)', exact: true })
      .click();
    await page.getByRole('checkbox', { name: 'Use default values', exact: true }).uncheck();
    const machineCidr = page.getByRole('textbox', { name: 'Machine CIDR', exact: true });
    const serviceCidr = page.getByRole('textbox', { name: 'Service CIDR', exact: true });
    await machineCidr.fill('10.0.0.0/16');
    await machineCidr.press('Tab');
    await serviceCidr.fill('10.0.0.0/16');
    await serviceCidr.press('Tab');
    await expect(page.getByText(/overlaps.*Machine CIDR/i)).toBeVisible();
    await expect(serviceCidr).toHaveAttribute('aria-invalid', 'true');
    await expectWizardFormScreenshot(page, serviceCidr, 'rosa-wizard-networking-cidr-errors.png');
  });

  test('custom KMS and etcd encryption required errors form', async ({ page }) => {
    await navigateToVisualEncryption(page);
    await page.getByRole('radio', { name: 'Use custom AWS KMS key', exact: true }).check();
    await page
      .getByRole('checkbox', { name: 'Enable additional etcd encryption', exact: true })
      .check();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    const keyInputs = page.getByRole('textbox', { name: 'Key ARN', exact: true });
    await expect(keyInputs).toHaveCount(2);
    // The custom KMS input precedes the etcd input in the form.
    await expect(keyInputs.nth(0)).toBeFocused();
    for (const input of await keyInputs.all()) {
      await expect(input).toHaveAttribute('aria-invalid', 'true');
    }
    await expect(page.getByText('This field is required', { exact: true })).toHaveCount(2);
    await expectWizardFormScreenshot(
      page,
      page.getByRole('radio', { name: 'Use custom AWS KMS key', exact: true }),
      'rosa-wizard-encryption-custom-errors.png'
    );
  });

  test('manual Cluster updates viewport', async ({ page }) => {
    await navigateToVisualEncryption(page);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    const manual = page.getByRole('radio', { name: 'Manual updates', exact: true });
    await manual.check();
    await expect(manual).toBeChecked();
    await expect(page.getByRole('button', { name: 'Sunday', exact: true })).toBeHidden();
    await expect(page.getByRole('button', { name: '00:00 UTC', exact: true })).toBeHidden();
    await prepareWizardViewport(page, manual);
    await expect(page).toHaveScreenshot('rosa-wizard-updates-manual.png');
  });

  test('open Cluster update day dropdown viewport', async ({ page }) => {
    await navigateToVisualEncryption(page);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('button', { name: 'Sunday', exact: true }).click();
    await prepareWizardViewport(page, page.getByRole('option', { name: 'Monday', exact: true }));
    await expect(page).toHaveScreenshot('rosa-wizard-updates-day-dropdown.png');
  });
});
