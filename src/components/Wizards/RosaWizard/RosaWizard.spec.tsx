import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { RosaWizard } from './RosaWizard';
import { RosaWizardErrorThenBackToReviewMount } from './RosaWizard.spec-helpers';
import { TranslationProvider } from '../../../context/TranslationContext';
import { checkAccessibility } from '../../../test-helpers';
import { RosaWizardMount } from './RosaWizard.ct';

const minimalWizardsStepsData = {
  basicSetupStep: {
    openShiftVersions: [{ label: 'OpenShift 4.12.0', value: '4.12.0' }],
    awsInfrastructureAccounts: [
      { label: 'AWS Account - Production (123456789012)', value: 'aws-prod-123456789012' },
    ],
    awsBillingAccounts: [
      { label: 'Billing Account - Main (123456789012)', value: 'billing-main-123456789012' },
    ],
    regions: [
      { label: 'US East 1, US, Virginia', value: 'us-east-1' },
      { label: 'US West 1, US, Oregon', value: 'us-west-1' },
    ],
    roles: {
      installerRoles: [
        {
          label: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Installer-Role',
          value: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Installer-Role',
        },
      ],
      supportRoles: [
        {
          label: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Support-Role',
          value: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Support-Role',
        },
      ],
      workerRoles: [
        {
          label: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Worker-Role',
          value: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Worker-Role',
        },
      ],
    },
    oicdConfig: [
      {
        label: '2kl4t2st8eg2u5jppv8kjeemkvimfm99',
        value: '2kl4t2st8eg2u5jppv8kjeemkvimfm99',
        issuer_url: 'https://oidc.os1.devshift.org/2kl4t2st8eg2u5jppv8kjeemkvimfm99',
      },
    ],
    machineTypes: [
      {
        id: 'm5a.xlarge',
        label: 'm5a.xlarge',
        description: '4 vCPU 16 GiB RAM',
        value: 'm5a.xlarge',
      },
    ],
    vpcList: [
      {
        name: 'test-vpc',
        id: 'vpc-123',
        aws_subnets: [
          {
            subnet_id: 'subnet-1',
            name: 'subnet-a',
            availability_zone: 'us-east-1a',
            cidr_block: '10.0.0.0/24',
          },
        ],
      },
    ],
  },
  callbackFunctions: {
    onAWSAccountChange: () => {},
  },
};

const defaultProps = {
  title: 'Create ROSA Cluster',
  onSubmit: async () => {},
  onCancel: () => {},
  wizardsStepsData: minimalWizardsStepsData,
};

function mountRosaWizard(overrides: Record<string, unknown> = {}) {
  return (
    <TranslationProvider>
      <RosaWizard {...defaultProps} {...overrides} />
    </TranslationProvider>
  );
}

test.describe('RosaWizard', () => {
  test('should render the wizard title', async ({ mount }) => {
    const component = await mount(mountRosaWizard());
    await expect(component.getByRole('heading', { name: 'Create ROSA Cluster' })).toBeVisible();
  });

  test('should pass accessibility tests when showing the wizard', async ({ mount }) => {
    const component = await mount(mountRosaWizard());
    await checkAccessibility({ component });
  });

  test.describe('submit error state', () => {
    const errorMessage = 'There has been an error creating the cluster';

    test('should show error EmptyState when onSubmitError is set', async ({ mount }) => {
      const component = await mount(mountRosaWizard({ onSubmitError: errorMessage }));

      await expect(component.getByText('Error creating cluster')).toBeVisible();
      await expect(component.getByText(errorMessage)).toBeVisible();
      await expect(component.getByRole('button', { name: 'Exit wizard' })).toBeVisible();
    });

    // This can't be fully tested unless there is a way for the user to not be on the review step when an error is shown.
    test.skip('should show Back to review step button when onBackToReviewStep is provided', async ({
      mount,
    }) => {
      const component = await mount(
        mountRosaWizard({
          onSubmitError: errorMessage,
          onBackToReviewStep: () => {},
        })
      );

      await expect(component.getByText('Error creating cluster')).toBeVisible();
      await expect(component.getByRole('button', { name: 'Back to review step' })).toBeVisible();
    });

    test('should call onCancel when Exit wizard is clicked', async ({ mount }) => {
      let cancelCalled = false;
      const component = await mount(
        mountRosaWizard({
          onSubmitError: errorMessage,
          onCancel: () => {
            cancelCalled = true;
          },
        })
      );

      await expect(component.getByText('Error creating cluster')).toBeVisible();
      await component.getByRole('button', { name: 'Exit wizard' }).click();

      expect(cancelCalled).toBe(true);
    });

    test('should call onBackToReviewStep when Back to review step is clicked', async ({
      mount,
    }) => {
      let backToReviewCalled = false;
      const component = await mount(
        mountRosaWizard({
          onSubmitError: errorMessage,
          onBackToReviewStep: () => {
            backToReviewCalled = true;
          },
        })
      );

      await expect(component.getByText('Error creating cluster')).toBeVisible();
      await component.getByRole('button', { name: 'Back to review step' }).click();

      expect(backToReviewCalled).toBe(true);
    });

    test('should hide error view and show wizard when Back to review step is clicked and onBackToReviewStep clears error', async ({
      mount,
    }) => {
      const component = await mount(<RosaWizardErrorThenBackToReviewMount {...defaultProps} />);

      await expect(component.getByText('Error creating cluster')).toBeVisible();
      await component.getByRole('button', { name: 'Back to review step' }).click();

      await expect(component.getByText('Error creating cluster')).not.toBeVisible();
      await expect(component.getByRole('heading', { name: 'Create ROSA Cluster' })).toBeVisible();
    });

    test('should pass accessibility tests when showing the error state', async ({ mount }) => {
      const component = await mount(mountRosaWizard({ onSubmitError: errorMessage }));
      await checkAccessibility({ component });
    });

    test('required field empty: user cannot advance to next step and Next button is disabled', async ({
      mount,
    }) => {
      const component = await mount(<RosaWizardMount />);

      // Ensure we're on the Details step (Basic setup first substep) — Cluster name is visible
      const clusterNameInput = component.getByPlaceholder('Enter the cluster name');
      await expect(clusterNameInput).toBeVisible();

      const nextButton = component.getByRole('button', { name: 'Next' });
      await expect(nextButton).toBeVisible();

      // Try to go next without filling required Cluster name
      await nextButton.click();

      // User should still see Details content (Cluster name still visible) — did not advance
      await expect(clusterNameInput).toBeVisible();

      // Next button should be disabled when there are validation errors and we've tried to advance
      await expect(nextButton).toBeDisabled();
    });

    test('invalid data: field-level validation is shown and Next button is disabled', async ({
      mount,
    }) => {
      const component = await mount(<RosaWizardMount />);

      const clusterNameInput = component.getByPlaceholder('Enter the cluster name');
      await expect(clusterNameInput).toBeVisible();

      // Enter invalid cluster name (uppercase not allowed)
      await clusterNameInput.fill('Uppercase');
      await clusterNameInput.blur();

      // Field-level validation message should be visible (validateOnBlur triggers it)
      await expect(
        component.getByText(/This value can only contain lowercase alphanumeric/, { exact: false })
      ).toBeVisible();

      // Next button should be disabled when step has validation errors
      const nextButton = component.getByRole('button', { name: 'Next' });
      await expect(nextButton).toBeDisabled();
    });
  });

  // This test will fail once the left navigation forces a user to go step by step
  test('Skip to review step is disabled when there are validation errors', async ({ mount }) => {
    const component = await mount(<RosaWizardMount />);

    // Click on "Additional setup" in the left navigation to expand it
    await component.getByText('Additional setup').click();
    // Wait for Encryption (optional) step to be visible (it fades in after expand)
    const encryptionStepNav = component.getByRole('button', { name: 'Encryption (optional)' });

    await expect(encryptionStepNav).toBeVisible();
    await encryptionStepNav.click();

    const skipToReviewButtonText = 'Skip to review';

    // Checking this box will cause a required Key ARN field to appear and be empty
    await component.getByRole('checkbox', { name: /Enable additional etcd encryption/i }).check();
    await expect(component.getByRole('button', { name: skipToReviewButtonText })).toBeEnabled();

    await component.getByRole('button', { name: skipToReviewButtonText }).click();

    // Ensure "Please fix validation errors" is shown
    await expect(component.getByText('Please fix validation errors')).toBeVisible();

    // Ensure both Next and Skip to review buttons are disabled
    await expect(component.getByRole('button', { name: 'Next' })).toBeDisabled();
    await expect(component.getByRole('button', { name: skipToReviewButtonText })).toBeDisabled();
  });
});
