/**
 * Playwright CT mount targets for {@link RosaWizardSubmitError}.
 * Stateful wrappers live here so specs can mount them (Playwright CT cannot mount components defined in test files).
 */
import React from 'react';

import { RosaWizardSubmitError } from './RosaWizardSubmitError';
import { withRosaCt } from './components/WizFields/wizFieldCtSpecHelpers';

export type RosaWizardSubmitErrorMountProps = React.ComponentProps<typeof RosaWizardSubmitError>;

export function RosaWizardSubmitErrorMount(props: RosaWizardSubmitErrorMountProps) {
  return withRosaCt(<RosaWizardSubmitError {...props} />);
}

/** Starts in submit error state and clears error when "Back to the wizard" is clicked. */
export function RosaWizardSubmitErrorThenBackMount(
  props: Omit<
    RosaWizardSubmitErrorMountProps,
    'onSubmitError' | 'onBackToReviewStep' | 'isNavigatingToReview'
  >
) {
  const [submitError, setSubmitError] = React.useState<string | boolean>(
    'There has been an error creating the cluster'
  );
  const [isNavigatingToReview, setIsNavigatingToReview] = React.useState(false);

  const onBackToReviewStep = React.useCallback(async () => {
    setIsNavigatingToReview(true);
    await new Promise((resolve) => setTimeout(resolve, 50));
    setSubmitError(false);
    setIsNavigatingToReview(false);
  }, []);

  if (!submitError) {
    return withRosaCt(<p>Wizard content restored</p>);
  }

  return withRosaCt(
    <RosaWizardSubmitError
      {...props}
      onSubmitError={submitError}
      onBackToReviewStep={onBackToReviewStep}
      isNavigatingToReview={isNavigatingToReview}
    />
  );
}
