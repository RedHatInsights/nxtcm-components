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
  await page.getByRole('button', { name: /public subnet name/i }).click();
  await page.getByRole('option', { name: 'test-1-subnet-public1-us-east-1a' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
}

async function openCidrFields(page: Page) {
  await fillDetailsStep(page);
  await fillRolesStep(page);
  await fillMachinePoolsStep(page);
  await page.getByRole('button', { name: 'Advanced networking configuration (optional)' }).click();
  await page.getByRole('checkbox', { name: 'Use default values' }).click();
}

async function navigateToReview(page: Page) {
  await fillDetailsStep(page);
  await fillRolesStep(page);
  await fillMachinePoolsStep(page);
  await fillNetworkingStep(page); // fills Networking and clicks Next → Encryption
  await page.getByRole('button', { name: 'Next' }).click(); // Encryption → Updates
  await page.getByRole('button', { name: 'Next' }).click(); // Updates → Review
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

    await fillNetworkingStep(page);

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

  test.describe('Machine Pools - VPC and subnet', () => {
    test('changing VPC resets subnet selection', async ({ page }) => {
      await fillDetailsStep(page);
      await fillRolesStep(page);

      // Select VPC 1 and a private subnet
      await page
        .getByRole('button', {
          name: 'Select a VPC to install your machine pool into us-east-1',
        })
        .click();
      await page.getByRole('option', { name: 'test-vpc-1' }).click();
      await page.getByRole('button', { name: 'Select private subnet' }).click();
      await page.getByRole('option', { name: 'test-1-subnet-private1-us-east-1a' }).click();

      // Verify subnet is selected (button text changes from placeholder)
      await expect(page.getByRole('button', { name: 'Select private subnet' })).not.toBeVisible();

      // Change to VPC 2
      await page.getByRole('button', { name: /test-vpc-1/ }).click();
      await page.getByRole('option', { name: 'test-2-vpc' }).click();

      // Subnet should be reset (placeholder visible again)
      await expect(page.getByRole('button', { name: 'Select private subnet' })).toBeVisible();
    });
  });

  test.describe('Networking - CIDR cross-field validation', () => {
    test('CIDR fields must be mutually disjoint - Machine vs Service', async ({ page }) => {
      await openCidrFields(page);

      const machineCidr = page.getByRole('textbox', { name: 'Machine CIDR' });
      const serviceCidr = page.getByRole('textbox', { name: 'Service CIDR' });

      await machineCidr.fill('10.0.0.0/16');
      await machineCidr.press('Tab');

      // Set Service CIDR to overlap with Machine CIDR
      await serviceCidr.fill('10.0.0.0/16');
      await serviceCidr.press('Tab');

      await expect(
        page.getByText(/overlaps with the subnet in the Machine CIDR field/)
      ).toBeVisible();

      // Fix the overlap
      await serviceCidr.fill('172.30.0.0/16');
      await serviceCidr.press('Tab');

      await expect(
        page.getByText(/overlaps with the subnet in the Machine CIDR field/)
      ).not.toBeVisible();
    });

    test('CIDR fields must be mutually disjoint - Machine vs Pod', async ({ page }) => {
      await openCidrFields(page);

      const machineCidr = page.getByRole('textbox', { name: 'Machine CIDR' });
      const podCidr = page.getByRole('textbox', { name: 'Pod CIDR' });

      await machineCidr.fill('10.0.0.0/16');
      await machineCidr.press('Tab');

      // Set Pod CIDR to overlap with Machine CIDR
      await podCidr.fill('10.0.0.0/16');
      await podCidr.press('Tab');

      await expect(
        page.getByText(/overlaps with the subnet in the Machine CIDR field/)
      ).toBeVisible();
    });

    test('Machine CIDR - rejects mask too large', async ({ page }) => {
      await openCidrFields(page);
      const input = page.getByRole('textbox', { name: 'Machine CIDR' });
      await input.fill('10.0.0.0/8');
      await input.press('Tab');
      await expect(page.getByText("The subnet mask can't be larger than '/16'.")).toBeVisible();
    });

    test('Machine CIDR - rejects mask too small for single-AZ', async ({ page }) => {
      await openCidrFields(page);
      const input = page.getByRole('textbox', { name: 'Machine CIDR' });
      await input.fill('10.0.0.0/26');
      await input.press('Tab');
      await expect(page.getByText("The subnet mask can't be smaller than '/25'.")).toBeVisible();
    });

    // Subnet containment and CIDR/subnet overlap validations require selectedSubnets
    // in the Yup validation context. Currently, selected_vpc is stored as a string ID
    // by WizSelect, so constructSelectedSubnets() returns [] and these validations
    // don't fire in the wizard flow. They are covered by unit tests with explicit contexts.
    // Unskip these if the VPC selection is changed to store the full VPC object.
  });

  test.describe('Review - navigation', () => {
    test('editing from review updates displayed values', async ({ page }) => {
      await navigateToReview(page);

      // Verify initial value on review page
      await expect(page.getByText('test-cluster', { exact: true }).first()).toBeVisible();

      // Click Edit on the Details section (first "Edit step" button)
      await page.getByRole('button', { name: 'Edit step' }).first().click();

      // Change cluster name
      const nameInput = page.getByRole('textbox', { name: 'Cluster name' });
      await nameInput.clear();
      await nameInput.fill('updated-cluster');
      await nameInput.press('Tab');

      // Navigate back through all steps to Review
      await page.getByRole('button', { name: 'Next' }).click(); // Details → Roles
      await page.getByRole('button', { name: 'Next' }).click(); // Roles → Machine Pools
      await page.getByRole('button', { name: 'Next' }).click(); // Machine Pools → Networking
      await page.getByRole('button', { name: 'Next' }).click(); // Networking → Encryption
      await page.getByRole('button', { name: 'Next' }).click(); // Encryption → Updates
      // Use "Skip to review" or Next to reach Review
      await page.getByRole('button', { name: 'Next' }).click(); // Updates → Review

      // Verify updated value appears
      await expect(page.getByText('updated-cluster', { exact: true }).first()).toBeVisible();
    });

    test('review page displays all entered values', async ({ page }) => {
      await navigateToReview(page);

      await expect(page.getByRole('button', { name: 'Create cluster' })).toBeVisible();

      // Cluster details
      await expect(page.getByText('test-cluster', { exact: true }).first()).toBeVisible();
      await expect(page.getByText('4.12.0', { exact: true }).first()).toBeVisible();
      await expect(page.getByText(/us-east-1/).first()).toBeVisible();

      // Roles
      await expect(
        page.getByText('ManagedOpenShift-HCP-ROSA-Installer-Role').first()
      ).toBeVisible();
      await expect(
        page.getByText('2kl4t2st8eg2u5jppv8kjeemkvimfm99', { exact: true }).first()
      ).toBeVisible();

      // Machine type
      await expect(page.getByText('m5a.xlarge', { exact: true }).first()).toBeVisible();
    });
  });

  test.describe('Navigation - state management', () => {
    test('back button preserves entered data', async ({ page }) => {
      // Fill Details step
      await fillDetailsStep(page);

      // Fill some of Roles step
      await page.getByTestId('installer-role-select').click();
      await page.getByRole('option', { name: /ManagedOpenShift-HCP-ROSA-Installer-Role/ }).click();

      // Go back to Details
      await page.getByRole('button', { name: 'Back' }).click();

      // Verify data preserved
      await expect(page.getByRole('textbox', { name: 'Cluster name' })).toHaveValue('test-cluster');
    });

    test('validation error prevents navigation to next step', async ({ page }) => {
      // Enter invalid cluster name
      const input = page.getByRole('textbox', { name: 'Cluster name' });
      await input.fill('1invalid');
      await input.press('Tab');

      // Fill other required fields
      await page.getByRole('combobox', { name: 'Select an OpenShift version' }).click();
      await page.getByRole('option', { name: 'OpenShift 4.12.0' }).click();
      await page.getByRole('combobox', { name: 'Select an AWS infrastructure account' }).click();
      await page.getByRole('option', { name: 'AWS Account - Production (123456789012)' }).click();
      await page.getByRole('combobox', { name: 'Select an AWS billing account' }).click();
      await page.getByRole('option', { name: 'Billing Account - Main (123456789012)' }).click();
      await page.getByRole('combobox', { name: 'Select a region' }).click();
      await page.getByRole('option', { name: 'US East (N. Virginia)' }).click();

      // Try to proceed
      await page.getByRole('button', { name: 'Next' }).click();

      // Should still be on Details step
      await expect(input).toBeVisible();
      await expect(page.getByText('This value must not start with a number')).toBeVisible();
    });
  });
});
