import { test, expect, Page } from './fixtures';

async function expandOperatorPrefixSection(page: Page) {
  await page.getByRole('button', { name: /operator roles prefix/i }).click();
}

async function fillDetailsStep(page: Page) {
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

async function fillRolesStep(page: Page) {
  await page.getByTestId('installer-role-select').click();
  await page.getByRole('option', { name: /ManagedOpenShift-HCP-ROSA-Installer-Role/ }).click();
  await page.getByTestId('oidc-config-select').click();
  await page.getByRole('option', { name: /2kl4t2st8eg2u5jppv8kjeemkvimfm99/i }).click();
  await page.getByRole('button', { name: /Next/i }).click();
}

async function fillMachinePoolsStep(page: Page) {
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

async function fillNetworkingStep(page: Page) {
  await page.getByRole('button', { name: /public subnet name/i }).click();
  await page.getByRole('option', { name: /test-1-subnet-public1-us-east-1a/i }).click();
  await page.getByRole('button', { name: /Next/i }).click();
}

async function openCidrFields(page: Page) {
  await fillDetailsStep(page);
  await fillRolesStep(page);
  await fillMachinePoolsStep(page);
  await page
    .getByRole('button', { name: /Advanced networking configuration \(optional\)/i })
    .click();
  await page.getByRole('checkbox', { name: /Use default values/i }).click();
}

async function navigateToClusterUpdates(page: Page) {
  await fillDetailsStep(page);
  await fillRolesStep(page);
  await fillMachinePoolsStep(page);
  await fillNetworkingStep(page); // fills Networking and clicks Next → Encryption
  await page.getByRole('button', { name: /Next/i }).click(); // Encryption → Updates
}

async function navigateToReview(page: Page) {
  await fillDetailsStep(page);
  await fillRolesStep(page);
  await fillMachinePoolsStep(page);
  await fillNetworkingStep(page); // fills Networking and clicks Next → Encryption
  await page.getByRole('button', { name: /Next/i }).click(); // Encryption → Updates
  await page.getByRole('button', { name: /Next/i }).click(); // Updates → Review
}

test.describe('ROSA Wizard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('completes full wizard flow selecting first option in each dropdown and verifies review page', async ({
    page,
  }) => {
    const clusterNameInput = page.getByRole('textbox', { name: /Cluster name/i });
    await expect(clusterNameInput).toBeVisible();

    await clusterNameInput.fill('test-cluster');
    await clusterNameInput.press('Tab');

    await page.getByRole('combobox', { name: /Select an OpenShift version/i }).click();
    await page.getByRole('option', { name: /OpenShift 4\.12\.0/i }).click();

    await page.getByRole('combobox', { name: /Select an AWS infrastructure account/i }).click();
    await page.getByRole('option', { name: /AWS Account - Production \(123456789012\)/i }).click();

    await page.getByRole('combobox', { name: /Select an AWS billing account/i }).click();
    await page.getByRole('option', { name: /Billing Account - Main \(123456789012\)/i }).click();

    await page.getByRole('combobox', { name: /Select a region/i }).click();
    await page.getByRole('option', { name: /US East \(N\. Virginia\)/i }).click();

    await page.getByRole('button', { name: /Next/i }).click();

    await expect(page.getByTestId('installer-role-select')).toBeVisible();

    await page.getByTestId('installer-role-select').click();
    await page.getByRole('option', { name: /ManagedOpenShift-HCP-ROSA-Installer-Role/ }).click();

    await page.getByTestId('oidc-config-select').click();
    await page.getByRole('option', { name: /2kl4t2st8eg2u5jppv8kjeemkvimfm99/i }).click();

    await page.getByRole('button', { name: /Next/i }).click();

    await expect(
      page.getByRole('combobox', {
        name: /Select a VPC to install your machine pool into us-east-1/i,
      })
    ).toBeVisible();

    await page
      .getByRole('combobox', { name: /Select a VPC to install your machine pool into us-east-1/i })
      .click();
    await page.getByRole('option', { name: /test-vpc-1/i }).click();

    await page.getByRole('combobox', { name: /Select private subnet/i }).click();
    await page.getByRole('option', { name: /test-1-subnet-private1-us-east-1a/i }).click();

    await page.getByRole('combobox', { name: /Select the compute node instance type/i }).click();
    await page.getByRole('option', { name: /m5a\.xlarge/i }).click();

    await page.getByRole('button', { name: /Next/i }).click();

    await fillNetworkingStep(page);

    await expect(page.getByRole('radio', { name: /Use default AWS KMS key/i })).toBeVisible();

    await page.getByRole('button', { name: /Next/i }).click();

    await expect(page.getByRole('radio', { name: /Manual updates/i })).toBeVisible();

    await page.getByRole('button', { name: /Next/i }).click();

    await expect(page.getByRole('button', { name: /Create cluster/i })).toBeVisible();

    await expect(page.getByText(/test-cluster/i).first()).toBeVisible();
    await expect(page.getByText(/4\.12\.0/i).first()).toBeVisible();
    await expect(page.getByText(/ManagedOpenShift-HCP-ROSA-Installer-Role/i).first()).toBeVisible();
    await expect(page.getByText(/2kl4t2st8eg2u5jppv8kjeemkvimfm99/i).first()).toBeVisible();
    await expect(page.getByText(/test-cluster-[a-z][a-z0-9]+/).first()).toBeVisible();
    await expect(page.getByText(/m5a\.xlarge/i).first()).toBeVisible();
  });

  test.describe('validation', () => {
    test.describe('Details - cluster name', () => {
      test('blank shows Required', async ({ page }) => {
        const input = page.getByRole('textbox', { name: /Cluster name/i });
        await input.focus();
        await input.press('Tab');
        await expect(page.getByText(/required/i).first()).toBeVisible();
      });

      test('"a b" rejects invalid characters', async ({ page }) => {
        const input = page.getByRole('textbox', { name: /Cluster name/i });
        await input.fill('a b');
        await input.press('Tab');
        await expect(
          page.getByText(
            /this value can only contain lowercase alphanumeric characters or '-' or '\.'/i
          )
        ).toBeVisible();
      });

      test('starting with a number is rejected', async ({ page }) => {
        const input = page.getByRole('textbox', { name: /Cluster name/i });
        await input.fill('1cluster');
        await input.press('Tab');
        await expect(page.getByText(/this value must not start with a number/i)).toBeVisible();
      });

      test('ending with a non-alphanumeric character is rejected', async ({ page }) => {
        const input = page.getByRole('textbox', { name: /Cluster name/i });
        await input.fill('cluster-');
        await input.press('Tab');
        await expect(
          page.getByText(/this value must end with an alphanumeric character/i)
        ).toBeVisible();
      });

      test('more than 54 characters is rejected', async ({ page }) => {
        const input = page.getByRole('textbox', { name: /Cluster name/i });
        await input.fill('a'.repeat(55));
        await input.press('Tab');
        await expect(page.getByText(/this value can contain at most 54 characters/i)).toBeVisible();
      });
    });

    test.describe('Roles and policies - operator prefix', () => {
      test('"a b" rejects invalid characters', async ({ page }) => {
        await fillDetailsStep(page);
        await expandOperatorPrefixSection(page);
        const input = page.getByRole('textbox', { name: /Operator roles prefix/i });
        await input.fill('a b');
        await input.press('Tab');
        await expect(
          page.getByText(/isn't valid, must consist of lower-case alphanumeric characters/)
        ).toBeVisible();
      });

      test('more than 32 characters is rejected', async ({ page }) => {
        await fillDetailsStep(page);
        await expandOperatorPrefixSection(page);
        const input = page.getByRole('textbox', { name: /Operator roles prefix/i });
        await input.fill('a'.repeat(33));
        await input.press('Tab');
        await expect(page.getByText(/may not exceed 32 characters/)).toBeVisible();
      });
    });

    test.describe('Networking - CIDR fields', () => {
      test('Machine CIDR - "a b" rejects invalid CIDR notation', async ({ page }) => {
        await openCidrFields(page);
        const input = page.getByRole('textbox', { name: /Machine CIDR/i });
        await input.fill('a b');
        await input.press('Tab');
        await expect(page.getByText(/isn't valid CIDR notation/)).toBeVisible();
      });

      test('Service CIDR - "a b" rejects invalid CIDR notation', async ({ page }) => {
        await openCidrFields(page);
        const input = page.getByRole('textbox', { name: /Service CIDR/i });
        await input.fill('a b');
        await input.press('Tab');
        await expect(page.getByText(/isn't valid CIDR notation/)).toBeVisible();
      });

      test('Pod CIDR - "a b" rejects invalid CIDR notation', async ({ page }) => {
        await openCidrFields(page);
        const input = page.getByRole('textbox', { name: /Pod CIDR/i });
        await input.fill('a b');
        await input.press('Tab');
        await expect(page.getByText(/isn't valid CIDR notation/)).toBeVisible();
      });

      test('Host prefix - "a b" rejects invalid subnet mask', async ({ page }) => {
        await openCidrFields(page);
        const input = page.getByRole('textbox', { name: /Host prefix/i });
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
        await page.getByRole('radio', { name: /Use custom AWS KMS key/i }).click();
        const input = page.getByRole('textbox', { name: /Key ARN/i }).first();
        await input.focus();
        await input.press('Tab');
        await expect(page.getByText(/required/i).first()).toBeVisible();
      });

      test('"a b" rejects values with whitespace', async ({ page }) => {
        await fillDetailsStep(page);
        await fillRolesStep(page);
        await fillMachinePoolsStep(page);
        await fillNetworkingStep(page);
        await page.getByRole('radio', { name: /Use custom AWS KMS key/i }).click();
        const input = page.getByRole('textbox', { name: /Key ARN/i }).first();
        await input.fill('a b');
        await input.press('Tab');
        await expect(page.getByText(/value must not contain whitespaces/i)).toBeVisible();
      });

      test('invalid ARN format is rejected', async ({ page }) => {
        await fillDetailsStep(page);
        await fillRolesStep(page);
        await fillMachinePoolsStep(page);
        await fillNetworkingStep(page);
        await page.getByRole('radio', { name: /Use custom AWS KMS key/i }).click();
        const input = page.getByRole('textbox', { name: /Key ARN/i }).first();
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
        await page.getByRole('checkbox', { name: /Enable additional etcd encryption/i }).click();
        const input = page.getByRole('textbox', { name: /Key ARN/i }).first();
        await input.focus();
        await input.press('Tab');
        await expect(page.getByText(/required/i).first()).toBeVisible();
      });

      test('"a b" rejects values with whitespace', async ({ page }) => {
        await fillDetailsStep(page);
        await fillRolesStep(page);
        await fillMachinePoolsStep(page);
        await fillNetworkingStep(page);
        await page.getByRole('checkbox', { name: /Enable additional etcd encryption/i }).click();
        const input = page.getByRole('textbox', { name: /Key ARN/i }).first();
        await input.fill('a b');
        await input.press('Tab');
        await expect(page.getByText(/value must not contain whitespaces/i)).toBeVisible();
      });
    });
  });

  test.describe('Machine Pools - VPC and subnet', () => {
    test('changing VPC resets subnet selection', async ({ page }) => {
      await fillDetailsStep(page);
      await fillRolesStep(page);

      const vpcCombo = page.getByRole('combobox', {
        name: /Select a VPC to install your machine pool into us-east-1/i,
      });
      const subnetCombo = page.getByRole('combobox', { name: /Select private subnet/i });

      // Select VPC 1 and a private subnet
      await vpcCombo.click();
      await page.getByRole('option', { name: /test-vpc-1/i }).click();
      await subnetCombo.click();
      await page.getByRole('option', { name: /test-1-subnet-private1-us-east-1a/i }).click();

      // Verify subnet has a value
      await expect(subnetCombo).not.toHaveValue('');

      // Change to VPC 2
      await vpcCombo.click();
      await page.getByRole('option', { name: /test-2-vpc/i }).click();

      // Subnet should be reset (empty value)
      await expect(subnetCombo).toHaveValue('');
    });
  });

  test.describe('Networking - CIDR cross-field validation', () => {
    test('CIDR fields must be mutually disjoint - Machine vs Service', async ({ page }) => {
      await openCidrFields(page);

      const machineCidr = page.getByRole('textbox', { name: /Machine CIDR/i });
      const serviceCidr = page.getByRole('textbox', { name: /Service CIDR/i });

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

      const machineCidr = page.getByRole('textbox', { name: /Machine CIDR/i });
      const podCidr = page.getByRole('textbox', { name: /Pod CIDR/i });

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
      const input = page.getByRole('textbox', { name: /Machine CIDR/i });
      await input.fill('10.0.0.0/8');
      await input.press('Tab');
      await expect(page.getByText(/the subnet mask can't be larger than '\/16'/i)).toBeVisible();
    });

    test('Machine CIDR - rejects mask too small for single-AZ', async ({ page }) => {
      await openCidrFields(page);
      const input = page.getByRole('textbox', { name: /Machine CIDR/i });
      await input.fill('10.0.0.0/26');
      await input.press('Tab');
      await expect(page.getByText(/the subnet mask can't be smaller than '\/25'/i)).toBeVisible();
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
      await expect(page.getByText(/test-cluster/i).first()).toBeVisible();

      // Click Edit on the Details section (first "Edit step" button)
      await page
        .getByRole('button', { name: /Edit step/i })
        .first()
        .click();

      // Change cluster name
      const nameInput = page.getByRole('textbox', { name: /Cluster name/i });
      await nameInput.clear();
      await nameInput.fill('updated-cluster');
      await nameInput.press('Tab');

      // Navigate back through all steps to Review
      await page.getByRole('button', { name: /Next/i }).click(); // Details → Roles
      await page.getByRole('button', { name: /Next/i }).click(); // Roles → Machine Pools
      await page.getByRole('button', { name: /Next/i }).click(); // Machine Pools → Networking
      await page.getByRole('button', { name: /Next/i }).click(); // Networking → Encryption
      await page.getByRole('button', { name: /Next/i }).click(); // Encryption → Updates
      // Use "Skip to review" or Next to reach Review
      await page.getByRole('button', { name: /Next/i }).click(); // Updates → Review

      // Verify updated value appears
      await expect(page.getByText(/updated-cluster/i).first()).toBeVisible();
    });

    test('review page displays all entered values', async ({ page }) => {
      await navigateToReview(page);

      await expect(page.getByRole('button', { name: /Create cluster/i })).toBeVisible();

      // Cluster details
      await expect(page.getByText(/test-cluster/i).first()).toBeVisible();
      await expect(page.getByText(/4\.12\.0/i).first()).toBeVisible();
      await expect(page.getByText(/us-east-1/).first()).toBeVisible();

      // Roles
      await expect(
        page.getByText(/ManagedOpenShift-HCP-ROSA-Installer-Role/i).first()
      ).toBeVisible();
      await expect(page.getByText(/2kl4t2st8eg2u5jppv8kjeemkvimfm99/i).first()).toBeVisible();

      // Machine type
      await expect(page.getByText(/m5a\.xlarge/i).first()).toBeVisible();
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
      await page.getByRole('button', { name: /Back/i }).click();

      // Verify data preserved
      await expect(page.getByRole('textbox', { name: /Cluster name/i })).toHaveValue(
        'test-cluster'
      );
    });

    test('validation error prevents navigation to next step', async ({ page }) => {
      // Enter invalid cluster name
      const input = page.getByRole('textbox', { name: /Cluster name/i });
      await input.fill('1invalid');
      await input.press('Tab');

      // Fill other required fields
      await page.getByRole('combobox', { name: /Select an OpenShift version/i }).click();
      await page.getByRole('option', { name: /OpenShift 4\.12\.0/i }).click();
      await page.getByRole('combobox', { name: /Select an AWS infrastructure account/i }).click();
      await page
        .getByRole('option', { name: /AWS Account - Production \(123456789012\)/i })
        .click();
      await page.getByRole('combobox', { name: /Select an AWS billing account/i }).click();
      await page.getByRole('option', { name: /Billing Account - Main \(123456789012\)/i }).click();
      await page.getByRole('combobox', { name: /Select a region/i }).click();
      await page.getByRole('option', { name: /US East \(N\. Virginia\)/i }).click();

      // Try to proceed
      await page.getByRole('button', { name: /Next/i }).click();

      // Should still be on Details step
      await expect(input).toBeVisible();
      await expect(page.getByText(/this value must not start with a number/i)).toBeVisible();
    });
  });

  test.describe('Conditionally rendered dropdowns', () => {
    test.describe('Networking - public subnet select', () => {
      test('switching to Private hides public subnet select', async ({ page }) => {
        await fillDetailsStep(page);
        await fillRolesStep(page);
        await fillMachinePoolsStep(page);

        // Public is the default — public subnet select should be visible
        await expect(page.getByRole('button', { name: /public subnet name/i })).toBeVisible();

        // Switch to Private
        await page.getByRole('radio', { name: /Private/i }).click();

        // Public subnet select should be hidden
        await expect(page.getByRole('button', { name: /public subnet name/i })).not.toBeVisible();
      });

      test('switching back to Public re-shows public subnet select', async ({ page }) => {
        await fillDetailsStep(page);
        await fillRolesStep(page);
        await fillMachinePoolsStep(page);

        // Switch to Private
        await page.getByRole('radio', { name: /Private/i }).click();
        await expect(page.getByRole('button', { name: /public subnet name/i })).not.toBeVisible();

        // Switch back to Public
        await page.getByRole('radio', { name: /Public/i }).click();

        // Public subnet select should reappear
        await expect(page.getByRole('button', { name: /public subnet name/i })).toBeVisible();
      });

      test('switching to Private clears selected public subnet', async ({ page }) => {
        await fillDetailsStep(page);
        await fillRolesStep(page);
        await fillMachinePoolsStep(page);

        // Select a public subnet
        await page.getByRole('button', { name: /public subnet name/i }).click();
        await page.getByRole('option', { name: /test-1-subnet-public1-us-east-1a/i }).click();

        // Switch to Private then back to Public
        await page.getByRole('radio', { name: /Private/i }).click();
        await page.getByRole('radio', { name: /Public/i }).click();

        // The select should show the placeholder again (value was cleared)
        await expect(
          page.getByRole('button', { name: /Select public subnet name/i })
        ).toBeVisible();
      });
    });

    test.describe('Machine Pools - security groups version gate', () => {
      test('shows incompatible version message for security groups when version < 4.14', async ({
        page,
      }) => {
        await fillDetailsStep(page);
        await fillRolesStep(page);

        // Select VPC with security groups
        await page
          .getByRole('combobox', {
            name: /Select a VPC to install your machine pool into us-east-1/i,
          })
          .click();
        await page.getByRole('option', { name: /test-vpc-1/i }).click();

        // Expand Advanced section
        await page.getByRole('button', { name: /Advanced machine pool configuration/i }).click();

        // Version 4.12.0 < 4.14 — should show incompatible message
        await expect(
          page.getByText(/to use securityGroups, your cluster must be version 4\.14\.x or newer/i)
        ).toBeVisible();
      });
    });

    test.describe('Encryption - KMS key ARN', () => {
      test('selecting custom KMS key shows Key ARN input', async ({ page }) => {
        await fillDetailsStep(page);
        await fillRolesStep(page);
        await fillMachinePoolsStep(page);
        await fillNetworkingStep(page);

        // Default is "Use default AWS KMS key" — Key ARN should not be visible
        await expect(page.getByRole('textbox', { name: /Key ARN/i })).not.toBeVisible();

        // Select custom KMS key
        await page.getByRole('radio', { name: /Use custom AWS KMS key/i }).click();

        // Key ARN input should appear
        await expect(page.getByRole('textbox', { name: /Key ARN/i }).first()).toBeVisible();
      });

      test('switching back to default KMS key hides and clears Key ARN', async ({ page }) => {
        await fillDetailsStep(page);
        await fillRolesStep(page);
        await fillMachinePoolsStep(page);
        await fillNetworkingStep(page);

        // Select custom and enter a value
        await page.getByRole('radio', { name: /Use custom AWS KMS key/i }).click();
        const input = page.getByRole('textbox', { name: /Key ARN/i }).first();
        await input.fill('arn:aws:kms:us-east-1:123456789012:key/test-key');

        // Switch back to default
        await page.getByRole('radio', { name: /Use default AWS KMS key/i }).click();

        // Key ARN input should be hidden
        await expect(page.getByRole('textbox', { name: /Key ARN/i })).not.toBeVisible();

        // Re-select custom — input should be empty (value was cleared)
        await page.getByRole('radio', { name: /Use custom AWS KMS key/i }).click();
        await expect(page.getByRole('textbox', { name: /Key ARN/i }).first()).toHaveValue('');
      });
    });

    test.describe('Encryption - etcd key ARN', () => {
      test('enabling etcd encryption shows Key ARN input', async ({ page }) => {
        await fillDetailsStep(page);
        await fillRolesStep(page);
        await fillMachinePoolsStep(page);
        await fillNetworkingStep(page);

        // etcd encryption is off by default — etcd Key ARN should not be visible
        // KMS Key ARN is also not visible (default KMS), so no Key ARN inputs at all
        await expect(page.getByRole('textbox', { name: /Key ARN/i })).not.toBeVisible();

        // Enable etcd encryption
        await page.getByRole('checkbox', { name: /Enable additional etcd encryption/i }).click();

        // Key ARN input should appear
        await expect(page.getByRole('textbox', { name: /Key ARN/i }).first()).toBeVisible();
      });

      test('disabling etcd encryption hides and clears Key ARN', async ({ page }) => {
        await fillDetailsStep(page);
        await fillRolesStep(page);
        await fillMachinePoolsStep(page);
        await fillNetworkingStep(page);

        // Enable etcd and enter a value
        await page.getByRole('checkbox', { name: /Enable additional etcd encryption/i }).click();
        const input = page.getByRole('textbox', { name: /Key ARN/i }).first();
        await input.fill('arn:aws:kms:us-east-1:123456789012:key/etcd-key');

        // Disable etcd encryption
        await page.getByRole('checkbox', { name: /Enable additional etcd encryption/i }).click();

        // Key ARN input should be hidden
        await expect(page.getByRole('textbox', { name: /Key ARN/i })).not.toBeVisible();

        // Re-enable — input should be empty (value was cleared)
        await page.getByRole('checkbox', { name: /Enable additional etcd encryption/i }).click();
        await expect(page.getByRole('textbox', { name: /Key ARN/i }).first()).toHaveValue('');
      });
    });

    test.describe('Cluster Updates - upgrade schedule selects', () => {
      test('switching to Manual hides upgrade schedule selects', async ({ page }) => {
        await navigateToClusterUpdates(page);

        // Default is Automatic — day and hour selects should be visible
        await expect(page.getByRole('button', { name: /Sunday/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /00:00 UTC/i })).toBeVisible();

        // Switch to Manual
        await page.getByRole('radio', { name: /Manual updates/i }).click();

        // Day and hour selects should be hidden
        await expect(page.getByRole('button', { name: /Sunday/i })).not.toBeVisible();
        await expect(page.getByRole('button', { name: /00:00 UTC/i })).not.toBeVisible();
      });

      test('switching back to Automatic re-shows upgrade schedule selects', async ({ page }) => {
        await navigateToClusterUpdates(page);

        // Switch to Manual
        await page.getByRole('radio', { name: /Manual updates/i }).click();
        await expect(page.getByRole('button', { name: /Sunday/i })).not.toBeVisible();

        // Switch back to Automatic
        await page.getByRole('radio', { name: /Automatic updates/i }).click();

        // Day and hour selects should reappear
        await expect(page.getByRole('button', { name: /Sunday/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /00:00 UTC/i })).toBeVisible();
      });
    });
  });
});
