import { expect, type MountResult, test } from '@playwright/experimental-ct-react';
import type { Page } from '@playwright/test';

import {
  RosaHcpWizardBodyErrorThenBackMount,
  RosaHcpWizardBodyMount,
} from './ROSAHCPWizardBody.spec-helpers';
import { defaultRosaHcpWizardStrings } from './stringsProvider/rosaHcpWizardStrings.defaults';
import { checkAccessibility } from './test-helpers';

const { submitError: submitErrorStrings, wizard } = defaultRosaHcpWizardStrings;
const ERROR_MESSAGE = 'There has been an error creating the cluster';

const rosaDocsBase = (version: string): string =>
  `https://docs.redhat.com/en/documentation/red_hat_openshift_service_on_aws/${version}/html`;

test.describe('ROSAHCPWizardBody', () => {
  test('shows the wizard when onSubmitError is not set', async ({ mount }) => {
    const component = await mount(<RosaHcpWizardBodyMount />);

    await expect(
      component.getByRole('button', { name: wizard.stepLabels.basicSetup })
    ).toBeVisible();
    await expect(component.getByRole('textbox', { name: /Cluster name/i })).toBeVisible();
  });

  test('passes accessibility tests when showing the wizard', async ({ mount }) => {
    test.setTimeout(60_000);
    const component = await mount(<RosaHcpWizardBodyMount />);

    await checkAccessibility({ component });
  });

  test.describe('submit error state', () => {
    test('shows error EmptyState and hides wizard when onSubmitError is set', async ({ mount }) => {
      const component = await mount(<RosaHcpWizardBodyMount onSubmitError={ERROR_MESSAGE} />);

      await expect(
        component.getByRole('heading', { name: submitErrorStrings.title })
      ).toBeVisible();
      await expect(component.getByText(ERROR_MESSAGE)).toBeVisible();
      await expect(
        component.getByRole('button', { name: submitErrorStrings.exitWizard })
      ).toBeVisible();
      await expect(component.getByRole('textbox', { name: /Cluster name/i })).not.toBeVisible();
    });

    test('shows Back to the wizard when onBackToReviewStep is provided', async ({ mount }) => {
      const component = await mount(
        <RosaHcpWizardBodyMount onSubmitError={ERROR_MESSAGE} onBackToReviewStep={() => {}} />
      );

      await expect(
        component.getByRole('button', { name: submitErrorStrings.backToReviewStep })
      ).toBeVisible();
    });

    test('calls onCancel when Exit wizard is clicked', async ({ mount }) => {
      let cancelCalled = false;
      const component = await mount(
        <RosaHcpWizardBodyMount
          onSubmitError={ERROR_MESSAGE}
          onCancel={() => {
            cancelCalled = true;
          }}
        />
      );

      await component.getByRole('button', { name: submitErrorStrings.exitWizard }).click();
      expect(cancelCalled).toBe(true);
    });

    test('calls onBackToReviewStep when Back to the wizard is clicked', async ({ mount }) => {
      let backToReviewCalled = false;
      const component = await mount(
        <RosaHcpWizardBodyMount
          onSubmitError={ERROR_MESSAGE}
          onBackToReviewStep={() => {
            backToReviewCalled = true;
          }}
        />
      );

      await component.getByRole('button', { name: submitErrorStrings.backToReviewStep }).click();
      expect(backToReviewCalled).toBe(true);
    });

    test('hides error view and shows wizard when Back to the wizard clears the error', async ({
      mount,
    }) => {
      const component = await mount(<RosaHcpWizardBodyErrorThenBackMount />);

      await expect(
        component.getByRole('heading', { name: submitErrorStrings.title })
      ).toBeVisible();
      await component.getByRole('button', { name: submitErrorStrings.backToReviewStep }).click();

      await expect(
        component.getByRole('heading', { name: submitErrorStrings.title })
      ).not.toBeVisible();
      await expect(component.getByRole('textbox', { name: /Cluster name/i })).toBeVisible();
    });

    test('passes accessibility tests when showing the error state', async ({ mount }) => {
      test.setTimeout(60_000);
      const component = await mount(
        <RosaHcpWizardBodyMount onSubmitError={ERROR_MESSAGE} onBackToReviewStep={() => {}} />
      );

      await checkAccessibility({ component });
    });
  });

  test.describe('docsVersions prop — versioned docs links', () => {
    const { details, autoscaling } = defaultRosaHcpWizardStrings;

    /**
     * Selects a version from the OpenShift version typeahead dropdown,
     * then navigates to the Machine pool step where a versioned docs link
     * is directly visible in the autoscaling helper text.
     */
    async function selectVersionAndGoToMachinePool(
      component: MountResult,
      page: Page,
      versionLabel: string
    ): Promise<void> {
      await component
        .locator('#cluster_version-form-group')
        .getByRole('combobox', { name: details.openShiftVersionPlaceholder, exact: true })
        .click();
      await page.getByText(versionLabel, { exact: true }).click();

      await component.getByRole('button', { name: wizard.stepLabels.machinePools }).click();
    }

    test('should use v4 docs links when v5 is not in docsVersions and a v5 cluster version is selected', async ({
      mount,
      page,
    }) => {
      const component = await mount(<RosaHcpWizardBodyMount enableAllWizardNavSteps />);

      await selectVersionAndGoToMachinePool(component, page, 'OpenShift 5.21.8');

      const autoscaleLink = component.getByRole('link', {
        name: autoscaling.learnMoreAutoscaling,
      });
      await expect(autoscaleLink).toHaveAttribute(
        'href',
        expect.stringContaining(rosaDocsBase('4'))
      );
    });

    test('should use v5 docs links when docsVersions includes 5 and a v5 cluster version is selected', async ({
      mount,
      page,
    }) => {
      const component = await mount(
        <RosaHcpWizardBodyMount enableAllWizardNavSteps docsVersions={['4', '5']} />
      );

      await selectVersionAndGoToMachinePool(component, page, 'OpenShift 5.21.8');

      const autoscaleLink = component.getByRole('link', {
        name: autoscaling.learnMoreAutoscaling,
      });
      await expect(autoscaleLink).toHaveAttribute(
        'href',
        expect.stringContaining(rosaDocsBase('5'))
      );
    });

    test('should use v4 docs links when docsVersions includes both 4 and 5 and a v4 cluster version is selected', async ({
      mount,
      page,
    }) => {
      const component = await mount(
        <RosaHcpWizardBodyMount enableAllWizardNavSteps docsVersions={['4', '5']} />
      );

      await selectVersionAndGoToMachinePool(component, page, 'OpenShift 4.12.0');

      const autoscaleLink = component.getByRole('link', {
        name: autoscaling.learnMoreAutoscaling,
      });
      await expect(autoscaleLink).toHaveAttribute(
        'href',
        expect.stringContaining(rosaDocsBase('4'))
      );
    });
  });
});
