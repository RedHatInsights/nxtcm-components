import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { RosaWizard } from './RosaWizard';
import { RosaWizardErrorThenBackToReviewMount } from './RosaWizard.spec-helpers';
import { checkAccessibility } from '../../../test-helpers';
import { RosaWizardMount } from './RosaWizard.ct';
import type { BasicSetupStepProps } from './RosaWizard';
import { OpenShiftVersionsData, Resource, Role, ValidationResource } from '../types';

/** Builds a static `Resource` with data loaded and no fetch side effects for CT props. */
const mockResource = <TData,>(data: TData): Resource<TData> => ({
  data,
  error: null,
  isFetching: false,
  fetch: async () => {},
});

/** Builds a `Resource` whose `fetch` is a no-op, typed for CT wizard step APIs that refetch. */
const mockFetchResource = <TData, TArgs extends unknown[] = []>(
  data: TData
): Resource<TData, TArgs> & { fetch: (...args: TArgs) => Promise<void> } => ({
  data,
  error: null,
  isFetching: false,
  fetch: async (..._args: TArgs) => {},
});

/** Minimal validation resource used where the wizard only needs idle validation state. */
const mockValidationResource = (): ValidationResource => ({
  error: null,
  isFetching: false,
});

/** OpenShift version catalog with distinct latest, default, and prior releases for dropdown grouping. */
const versionsData: OpenShiftVersionsData = {
  latest: { label: 'OpenShift 4.12.1', value: '4.12.1' },
  default: { label: 'OpenShift 4.12.0', value: '4.12.0' },
  releases: [{ label: 'OpenShift 4.11.5', value: '4.11.5' }],
};

/** Same semver value for latest and default → UI merges into "Default (Recommended)" + previous only. */
const versionsDefaultEqualsLatest: OpenShiftVersionsData = {
  latest: { label: 'OpenShift 4.12.0', value: '4.12.0' },
  default: { label: 'OpenShift 4.12.0', value: '4.12.0' },
  releases: [{ label: 'OpenShift 4.11.5', value: '4.11.5' }],
};

/** Sample IAM role triple returned by the roles API for a single AWS account. */
const roles: Role[] = [
  {
    installerRole: {
      label: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Installer-Role',
      value: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Installer-Role',
      roleVersion: '4.12.0',
    },
    supportRole: [
      {
        label: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Support-Role',
        value: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Support-Role',
      },
    ],
    workerRole: [
      {
        label: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Worker-Role',
        value: 'arn:aws:iam::720424066366:role/ManagedOpenShift-HCP-ROSA-Worker-Role',
      },
    ],
  },
];

/** Smallest `wizardsStepsData.basicSetupStep` graph needed to render the full wizard in CT. */
const minimalWizardsStepsData: { basicSetupStep: BasicSetupStepProps } = {
  basicSetupStep: {
    clusterNameValidation: mockValidationResource(),
    userRole: mockValidationResource(),
    versions: mockFetchResource(versionsData),
    awsInfrastructureAccounts: mockResource([
      { label: 'AWS Account - Production (123456789012)', value: 'aws-prod-123456789012' },
    ]),
    awsBillingAccounts: mockResource([
      { label: 'Billing Account - Main (123456789012)', value: 'billing-main-123456789012' },
    ]),
    regions: mockFetchResource([
      { label: 'US East 1, US, Virginia', value: 'us-east-1' },
      { label: 'US West 1, US, Oregon', value: 'us-west-1' },
    ]),
    roles: mockFetchResource<Role[], [awsAccount: string]>(roles),
    oidcConfig: mockResource([
      {
        label: '2kl4t2st8eg2u5jppv8kjeemkvimfm99',
        value: '2kl4t2st8eg2u5jppv8kjeemkvimfm99',
        issuer_url: 'https://oidc.os1.devshift.org/2kl4t2st8eg2u5jppv8kjeemkvimfm99',
      },
    ]),
    machineTypes: mockResource([
      {
        id: 'm5a.xlarge',
        label: 'm5a.xlarge',
        description: '4 vCPU 16 GiB RAM',
        value: 'm5a.xlarge',
      },
    ]),
    vpcList: mockResource([
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
    ]),
    subnets: mockResource([]),
    securityGroups: mockResource([]),
  },
};

/** Default `RosaWizard` props for this spec: noop handlers and `minimalWizardsStepsData`. */
const defaultProps = {
  title: 'Create ROSA Cluster',
  onSubmit: async () => {},
  onCancel: () => {},
  wizardsStepsData: minimalWizardsStepsData,
};

/** Returns a `RosaWizard` element merged over `defaultProps` for Playwright CT `mount`. */
function mountRosaWizard(overrides: Record<string, unknown> = {}) {
  return <RosaWizard {...defaultProps} {...overrides} />;
}

/** Component tests for `RosaWizard`: chrome, strings, versions UX, submit error flow, and navigation. */
test.describe('RosaWizard', () => {
  /** Verifies the wizard heading matches the `title` prop. */
  test('should render the wizard title', async ({ mount }) => {
    const component = await mount(mountRosaWizard());
    await expect(component.getByRole('heading', { name: 'Create ROSA Cluster' })).toBeVisible();
  });

  /** Ensures `strings.wizard.stepLabels.review` overrides the review step label in the nav. */
  test('should show custom Rosa strings in the wizard nav (e.g. review step label)', async ({
    mount,
  }) => {
    const customReviewLabel = 'Custom review step from strings prop';
    const component = await mount(
      mountRosaWizard({
        strings: {
          wizard: {
            stepLabels: {
              review: customReviewLabel,
            },
          },
        },
      })
    );

    await expect(component.getByText(customReviewLabel)).toBeVisible();
    await expect(component.getByRole('button', { name: 'Next' })).toBeVisible();
  });

  /** Runs axe (or project helper) accessibility checks on the default mounted wizard. */
  test('should pass accessibility tests when showing the wizard', async ({ mount }) => {
    const component = await mount(mountRosaWizard());
    await checkAccessibility({ component });
  });

  /** When latest semver equals default, the version menu merges groups and hides duplicate headings. */
  test('when default and latest OpenShift versions share the same value, version dropdown shows Default (Recommended) and Previous releases only', async ({
    mount,
    page,
  }) => {
    const component = await mount(
      mountRosaWizard({
        wizardsStepsData: {
          ...minimalWizardsStepsData,
          basicSetupStep: {
            ...minimalWizardsStepsData.basicSetupStep,
            versions: mockFetchResource(versionsDefaultEqualsLatest),
          },
        },
      })
    );

    const versionToggle = component.getByRole('button', {
      name: 'Select an OpenShift version',
    });
    await versionToggle.click();

    await expect(
      page.getByRole('heading', { name: 'Default (Recommended)', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Previous releases', exact: true })
    ).toBeVisible();

    await expect(
      page.getByRole('heading', { name: 'Latest release', exact: true })
    ).not.toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Default release', exact: true })
    ).not.toBeVisible();

    const recommendedGroup = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Default (Recommended)', exact: true }),
    });
    await expect(recommendedGroup.getByText('OpenShift 4.12.0', { exact: true })).toBeVisible();

    const previousGroup = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Previous releases', exact: true }),
    });
    await expect(previousGroup.getByText('OpenShift 4.11.5', { exact: true })).toBeVisible();
  });

  /** Covers submit-failure UI: empty state, callbacks, returning to the wizard, a11y, and step validation. */
  test.describe('submit error state', () => {
    const errorMessage = 'There has been an error creating the cluster';

    /** With `onSubmitError` set, shows cluster error title, message, and Exit wizard. */
    test('should show error EmptyState when onSubmitError is set', async ({ mount }) => {
      const component = await mount(mountRosaWizard({ onSubmitError: errorMessage }));

      await expect(component.getByText('Error creating cluster')).toBeVisible();
      await expect(component.getByText(errorMessage)).toBeVisible();
      await expect(component.getByRole('button', { name: 'Exit wizard' })).toBeVisible();
    });

    /** Skipped: needs a path where error shows off the review step to assert Back to review visibility. */
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

    /** Clicking Exit wizard invokes `onCancel` from the error empty state. */
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

    /** Back to review step triggers `onBackToReviewStep` while the error view is shown. */
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

    /** Wrapper clears `onSubmitError` on back; wizard chrome returns and error copy disappears. */
    test('should hide error view and show wizard when Back to review step is clicked and onBackToReviewStep clears error', async ({
      mount,
    }) => {
      const component = await mount(<RosaWizardErrorThenBackToReviewMount {...defaultProps} />);

      await expect(component.getByText('Error creating cluster')).toBeVisible();
      await component.getByRole('button', { name: 'Back to review step' }).click();

      await expect(component.getByText('Error creating cluster')).not.toBeVisible();
      await expect(component.getByRole('heading', { name: 'Create ROSA Cluster' })).toBeVisible();
    });

    /** Accessibility check on the submit-error empty state. */
    test('should pass accessibility tests when showing the error state', async ({ mount }) => {
      const component = await mount(mountRosaWizard({ onSubmitError: errorMessage }));
      await checkAccessibility({ component });
    });

    /** Empty required cluster name blocks advance from Details; Next ends disabled after attempt. */
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

    /** Invalid cluster name shows inline validation and keeps Next disabled on the first step. */
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

  /** From Networking (last required substep without proxy), Skip to review opens the Review step. */
  test('Skip to review button appears on the last required step and navigates to Review', async ({
    mount,
  }) => {
    const component = await mount(<RosaWizardMount />);

    // Navigate to Networking (last required step when proxy is not enabled)
    await component.getByRole('button', { name: 'Basic setup' }).click();
    const networkingNav = component.getByRole('button', { name: 'Networking' });
    await expect(networkingNav).toBeVisible();
    await networkingNav.click();

    // Both Next and Skip to review should be present alongside Back and Cancel
    const nextButton = component.getByRole('button', { name: 'Next' });
    const skipButton = component.getByRole('button', { name: 'Skip to review' });
    await expect(nextButton).toBeVisible();
    await expect(skipButton).toBeVisible();
    await expect(component.getByRole('button', { name: 'Back' })).toBeVisible();
    await expect(component.getByRole('button', { name: 'Cancel' })).toBeVisible();

    // Clicking Skip to review navigates directly to Review step
    await skipButton.click();
    await expect(component.getByText('Review your ROSA cluster')).toBeVisible();
  });
});
