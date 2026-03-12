import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { RosaWizard } from './RosaWizard';
import { RosaWizardErrorThenBackToReviewMount } from './RosaWizard.spec-helpers';
import { TranslationProvider } from '../../../context/TranslationContext';
import { checkAccessibility } from '../../../test-helpers';

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

    test('should show Back to review step button when onBackToReviewStep is provided', async ({
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
  });
});
