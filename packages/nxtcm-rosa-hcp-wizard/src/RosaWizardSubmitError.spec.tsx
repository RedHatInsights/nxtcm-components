import { test, expect } from '@playwright/experimental-ct-react';

import { defaultRosaHcpWizardStrings } from './stringsProvider/rosaHcpWizardStrings.defaults';
import {
  RosaWizardSubmitErrorMount,
  RosaWizardSubmitErrorThenBackMount,
} from './RosaWizardSubmitError.spec-helpers';
import { checkAccessibility } from '@/test-helpers';

const { submitError: submitErrorStrings } = defaultRosaHcpWizardStrings;
const ERROR_MESSAGE = 'There has been an error creating the cluster';

test.describe('RosaWizardSubmitError', () => {
  test('shows error title and message when onSubmitError is a non-empty string', async ({
    mount,
  }) => {
    const component = await mount(
      <RosaWizardSubmitErrorMount
        onSubmitError={ERROR_MESSAGE}
        isNavigatingToReview={false}
        onCancel={() => {}}
      />
    );

    await expect(component.getByRole('heading', { name: submitErrorStrings.title })).toBeVisible();
    await expect(component.getByText(ERROR_MESSAGE)).toBeVisible();
    await expect(
      component.getByRole('button', { name: submitErrorStrings.exitWizard })
    ).toBeVisible();
  });

  test('shows title only when onSubmitError is boolean true', async ({ mount }) => {
    const component = await mount(
      <RosaWizardSubmitErrorMount
        onSubmitError={true}
        isNavigatingToReview={false}
        onCancel={() => {}}
      />
    );

    await expect(component.getByRole('heading', { name: submitErrorStrings.title })).toBeVisible();
    await expect(component.getByText(ERROR_MESSAGE)).toHaveCount(0);
  });

  test('shows Back to the wizard when onBackToReviewStep is provided', async ({ mount }) => {
    const component = await mount(
      <RosaWizardSubmitErrorMount
        onSubmitError={ERROR_MESSAGE}
        onBackToReviewStep={() => {}}
        isNavigatingToReview={false}
        onCancel={() => {}}
      />
    );

    await expect(
      component.getByRole('button', { name: submitErrorStrings.backToReviewStep })
    ).toBeVisible();
  });

  test('hides Back to the wizard when onBackToReviewStep is not provided', async ({ mount }) => {
    const component = await mount(
      <RosaWizardSubmitErrorMount
        onSubmitError={ERROR_MESSAGE}
        isNavigatingToReview={false}
        onCancel={() => {}}
      />
    );

    await expect(
      component.getByRole('button', { name: submitErrorStrings.backToReviewStep })
    ).toHaveCount(0);
  });

  test('calls onCancel when Exit wizard is clicked', async ({ mount }) => {
    let cancelCalled = false;
    const component = await mount(
      <RosaWizardSubmitErrorMount
        onSubmitError={ERROR_MESSAGE}
        isNavigatingToReview={false}
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
      <RosaWizardSubmitErrorMount
        onSubmitError={ERROR_MESSAGE}
        onBackToReviewStep={() => {
          backToReviewCalled = true;
        }}
        isNavigatingToReview={false}
        onCancel={() => {}}
      />
    );

    await component.getByRole('button', { name: submitErrorStrings.backToReviewStep }).click();
    expect(backToReviewCalled).toBe(true);
  });

  test('disables Back to the wizard while isNavigatingToReview is true', async ({ mount }) => {
    const component = await mount(
      <RosaWizardSubmitErrorMount
        onSubmitError={ERROR_MESSAGE}
        onBackToReviewStep={() => {}}
        isNavigatingToReview
        onCancel={() => {}}
      />
    );

    await expect(
      component.getByRole('button', { name: submitErrorStrings.backToReviewStep })
    ).toBeDisabled();
  });

  test('clears error view after Back to the wizard when parent clears onSubmitError', async ({
    mount,
  }) => {
    const component = await mount(<RosaWizardSubmitErrorThenBackMount onCancel={() => {}} />);

    await expect(component.getByRole('heading', { name: submitErrorStrings.title })).toBeVisible();
    await component.getByRole('button', { name: submitErrorStrings.backToReviewStep }).click();

    await expect(
      component.getByRole('heading', { name: submitErrorStrings.title })
    ).not.toBeVisible();
    await expect(component.getByText('Wizard content restored')).toBeVisible();
  });

  test('passes accessibility tests in the error state', async ({ mount }) => {
    const component = await mount(
      <RosaWizardSubmitErrorMount
        onSubmitError={ERROR_MESSAGE}
        onBackToReviewStep={() => {}}
        isNavigatingToReview={false}
        onCancel={() => {}}
      />
    );

    await checkAccessibility({ component });
  });
});
