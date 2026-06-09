import { test, expect } from '@playwright/experimental-ct-react';

import { defaultRosaHcpWizardStrings } from './stringsProvider/rosaHcpWizardStrings.defaults';
import {
  RosaHcpWizardBodyErrorThenBackMount,
  RosaHcpWizardBodyMount,
} from './ROSAHCPWizardBody.spec-helpers';
import { checkAccessibility } from '@/test-helpers';

const { submitError: submitErrorStrings, wizard } = defaultRosaHcpWizardStrings;
const ERROR_MESSAGE = 'There has been an error creating the cluster';

test.describe('ROSAHCPWizardBody', () => {
  test('shows the wizard when onSubmitError is not set', async ({ mount }) => {
    const component = await mount(<RosaHcpWizardBodyMount />);

    await expect(
      component.getByRole('button', { name: wizard.stepLabels.basicSetup })
    ).toBeVisible();
    await expect(component.getByRole('textbox', { name: /Cluster name/i })).toBeVisible();
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
      const component = await mount(
        <RosaHcpWizardBodyMount onSubmitError={ERROR_MESSAGE} onBackToReviewStep={() => {}} />
      );

      await checkAccessibility({ component });
    });
  });
});
