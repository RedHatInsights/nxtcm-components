import { test, expect } from '@playwright/experimental-ct-react';

import { defaultRosaHcpWizardStrings } from './stringsProvider/rosaHcpWizardStrings.defaults';
import {
  RosaHcpWizardBodyErrorThenBackMount,
  RosaHcpWizardBodyMount,
} from './ROSAHCPWizardBody.spec-helpers';
import { checkAccessibility } from './test-helpers';
import { STEP_IDS } from './constants';

const { submitError: submitErrorStrings, wizard } = defaultRosaHcpWizardStrings;
const sl = wizard.stepLabels;
const ERROR_MESSAGE = 'There has been an error creating the cluster';

test.describe('ROSAHCPWizardBody', () => {
  test.describe('config.hiddenSteps', () => {
    test('shows all optional steps when no config is provided', async ({ mount }) => {
      const component = await mount(<RosaHcpWizardBodyMount />);

      await expect(component.getByRole('button', { name: sl.additionalSetup })).toBeVisible();
    });

    test('hides the Cluster updates step when it is in hiddenSteps', async ({ mount }) => {
      const component = await mount(
        <RosaHcpWizardBodyMount config={{ hiddenSteps: [STEP_IDS.CLUSTER_UPDATES] }} />
      );

      // Expand the Additional setup parent to reveal sub-steps
      await component.getByRole('button', { name: sl.additionalSetup }).click();

      await expect(component.getByRole('button', { name: sl.clusterUpdatesOptional })).toHaveCount(
        0
      );
    });

    test('keeps the Encryption step visible when only Cluster updates is hidden', async ({
      mount,
    }) => {
      const component = await mount(
        <RosaHcpWizardBodyMount config={{ hiddenSteps: [STEP_IDS.CLUSTER_UPDATES] }} />
      );

      await component.getByRole('button', { name: sl.additionalSetup }).click();

      await expect(component.getByRole('button', { name: sl.encryptionOptional })).toBeVisible();
    });

    test('hides the Encryption step when it is in hiddenSteps', async ({ mount }) => {
      const component = await mount(
        <RosaHcpWizardBodyMount config={{ hiddenSteps: [STEP_IDS.ENCRYPTION] }} />
      );

      await component.getByRole('button', { name: sl.additionalSetup }).click();

      await expect(component.getByRole('button', { name: sl.encryptionOptional })).toHaveCount(0);
    });

    test('hides the Additional setup parent when both Encryption and Cluster updates are hidden', async ({
      mount,
    }) => {
      const component = await mount(
        <RosaHcpWizardBodyMount
          config={{ hiddenSteps: [STEP_IDS.ENCRYPTION, STEP_IDS.CLUSTER_UPDATES] }}
        />
      );

      await expect(component.getByRole('button', { name: sl.additionalSetup })).toHaveCount(0);
    });

    test('does not show the Cluster-wide proxy step even when configure_proxy is enabled', async ({
      mount,
    }) => {
      const component = await mount(
        <RosaHcpWizardBodyMount config={{ hiddenSteps: [STEP_IDS.CLUSTER_WIDE_PROXY] }} />
      );

      // Navigate to Networking step and enable the proxy checkbox
      await component.getByRole('button', { name: sl.basicSetup }).click();
      await component.getByRole('button', { name: sl.networking }).click();
      await component.getByText(defaultRosaHcpWizardStrings.networking.privacyHelper).waitFor();

      // Open advanced section and check the proxy checkbox
      await component.getByText(defaultRosaHcpWizardStrings.networking.advancedToggle).click();

      // The proxy checkbox should be absent (hidden by config)
      await expect(
        component.getByRole('checkbox', {
          name: defaultRosaHcpWizardStrings.networking.proxyCheckboxLabel,
        })
      ).toHaveCount(0);

      // The Cluster-wide proxy nav item should never appear
      await expect(component.getByRole('button', { name: sl.clusterWideProxy })).toHaveCount(0);
    });

    test('shows the Cluster-wide proxy step when configure_proxy is enabled and step is not hidden', async ({
      mount,
    }) => {
      const component = await mount(<RosaHcpWizardBodyMount />);

      // Navigate to Networking and enable proxy
      await component.getByRole('button', { name: sl.basicSetup }).click();
      await component.getByRole('button', { name: sl.networking }).click();
      await component.getByText(defaultRosaHcpWizardStrings.networking.privacyHelper).waitFor();

      await component.getByText(defaultRosaHcpWizardStrings.networking.advancedToggle).click();
      await component
        .getByRole('checkbox', {
          name: defaultRosaHcpWizardStrings.networking.proxyCheckboxLabel,
        })
        .click();

      await expect(component.getByRole('button', { name: sl.clusterWideProxy })).toBeVisible();
    });
  });

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
});
