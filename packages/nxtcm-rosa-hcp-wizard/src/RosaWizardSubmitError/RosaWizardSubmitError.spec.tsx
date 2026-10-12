// See docs/agent-rules/playwright-ct.md for Playwright component test conventions.
import { expect, test } from '@/playwright/ct-fixture';

import { defaultRosaHcpWizardStrings } from '../stringsProvider/rosaHcpWizardStrings.defaults';
import { checkAccessibility } from '../test-helpers';
import type {
  RosaWizardSubmitErrorMount,
  RosaWizardSubmitErrorThenBackMount,
} from './RosaWizardSubmitError.story';

const { submitError: submitErrorStrings } = defaultRosaHcpWizardStrings;
const ERROR_MESSAGE = 'There has been an error creating the cluster';

test.describe('RosaWizardSubmitError', () => {
  test('shows error title and message when onSubmitError is a non-empty string', async ({
    mount,
  }) => {
    const component = await mount<typeof RosaWizardSubmitErrorMount>(
      'nxtcm-rosa-hcp-wizard/RosaWizardSubmitError/RosaWizardSubmitError/RosaWizardSubmitErrorMount',
      {
        onSubmitError: ERROR_MESSAGE,
        isNavigatingToReview: false,
        onCancel: true,
      }
    );

    await expect(component.getByRole('heading', { name: submitErrorStrings.title })).toBeVisible();
    await expect(component.getByText(ERROR_MESSAGE)).toBeVisible();
    await expect(
      component.getByRole('button', { name: submitErrorStrings.exitWizard })
    ).toBeVisible();
  });

  test('shows title only when onSubmitError is boolean true', async ({ mount }) => {
    const component = await mount<typeof RosaWizardSubmitErrorMount>(
      'nxtcm-rosa-hcp-wizard/RosaWizardSubmitError/RosaWizardSubmitError/RosaWizardSubmitErrorMount',
      {
        onSubmitError: true,
        isNavigatingToReview: false,
        onCancel: true,
      }
    );

    await expect(component.getByRole('heading', { name: submitErrorStrings.title })).toBeVisible();
    await expect(component.getByText(ERROR_MESSAGE)).toHaveCount(0);
  });

  test('shows Back to the wizard when onBackToReviewStep is provided', async ({ mount }) => {
    const component = await mount<typeof RosaWizardSubmitErrorMount>(
      'nxtcm-rosa-hcp-wizard/RosaWizardSubmitError/RosaWizardSubmitError/RosaWizardSubmitErrorMount',
      {
        onSubmitError: ERROR_MESSAGE,
        onBackToReviewStep: true,
        isNavigatingToReview: false,
        onCancel: true,
      }
    );

    await expect(
      component.getByRole('button', { name: submitErrorStrings.backToReviewStep })
    ).toBeVisible();
  });

  test('hides Back to the wizard when onBackToReviewStep is not provided', async ({ mount }) => {
    const component = await mount<typeof RosaWizardSubmitErrorMount>(
      'nxtcm-rosa-hcp-wizard/RosaWizardSubmitError/RosaWizardSubmitError/RosaWizardSubmitErrorMount',
      {
        onSubmitError: ERROR_MESSAGE,
        isNavigatingToReview: false,
        onCancel: true,
      }
    );

    await expect(
      component.getByRole('button', { name: submitErrorStrings.backToReviewStep })
    ).toHaveCount(0);
  });

  test('calls onCancel when Exit wizard is clicked', async ({ mount }) => {
    const component = await mount<typeof RosaWizardSubmitErrorMount>(
      'nxtcm-rosa-hcp-wizard/RosaWizardSubmitError/RosaWizardSubmitError/RosaWizardSubmitErrorMount',
      {
        onSubmitError: ERROR_MESSAGE,
        isNavigatingToReview: false,
        onCancel: true,
      }
    );

    await component.getByRole('button', { name: submitErrorStrings.exitWizard }).click();
    await expect
      .poll(() =>
        component
          .getByTestId('onCancel-calls')
          .evaluate((input: HTMLInputElement) => JSON.parse(input.value) as unknown[][])
      )
      .toHaveLength(1);
  });

  test('calls onBackToReviewStep when Back to the wizard is clicked', async ({ mount }) => {
    const component = await mount<typeof RosaWizardSubmitErrorMount>(
      'nxtcm-rosa-hcp-wizard/RosaWizardSubmitError/RosaWizardSubmitError/RosaWizardSubmitErrorMount',
      {
        onSubmitError: ERROR_MESSAGE,
        onBackToReviewStep: true,
        isNavigatingToReview: false,
        onCancel: true,
      }
    );

    await component.getByRole('button', { name: submitErrorStrings.backToReviewStep }).click();
    await expect
      .poll(() =>
        component
          .getByTestId('onBackToReviewStep-calls')
          .evaluate((input: HTMLInputElement) => JSON.parse(input.value) as unknown[][])
      )
      .toHaveLength(1);
  });

  test('disables Back to the wizard while isNavigatingToReview is true', async ({ mount }) => {
    const component = await mount<typeof RosaWizardSubmitErrorMount>(
      'nxtcm-rosa-hcp-wizard/RosaWizardSubmitError/RosaWizardSubmitError/RosaWizardSubmitErrorMount',
      {
        onSubmitError: ERROR_MESSAGE,
        onBackToReviewStep: true,
        isNavigatingToReview: true,
        onCancel: true,
      }
    );

    await expect(
      component.getByRole('button', { name: submitErrorStrings.backToReviewStep })
    ).toBeDisabled();
  });

  test('clears error view after Back to the wizard when parent clears onSubmitError', async ({
    mount,
  }) => {
    const component = await mount<typeof RosaWizardSubmitErrorThenBackMount>(
      'nxtcm-rosa-hcp-wizard/RosaWizardSubmitError/RosaWizardSubmitError/RosaWizardSubmitErrorThenBackMount',
      { onCancel: true }
    );

    await expect(component.getByRole('heading', { name: submitErrorStrings.title })).toBeVisible();
    await component.getByRole('button', { name: submitErrorStrings.backToReviewStep }).click();

    await expect(
      component.getByRole('heading', { name: submitErrorStrings.title })
    ).not.toBeVisible();
    await expect(component.getByText('Wizard content restored')).toBeVisible();
  });

  test('passes accessibility tests in the error state', async ({ mount }) => {
    test.setTimeout(60_000);
    const component = await mount<typeof RosaWizardSubmitErrorMount>(
      'nxtcm-rosa-hcp-wizard/RosaWizardSubmitError/RosaWizardSubmitError/RosaWizardSubmitErrorMount',
      {
        onSubmitError: ERROR_MESSAGE,
        onBackToReviewStep: true,
        isNavigatingToReview: false,
        onCancel: true,
      }
    );

    await checkAccessibility({ component });
  });
});
