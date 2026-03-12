import React from 'react';
import { RosaWizard } from './RosaWizard';
import { TranslationProvider } from '../../../context/TranslationContext';

type RosaWizardProps = React.ComponentProps<typeof RosaWizard>;

/**
 * Wrapper for CT only: starts in submit error state and clears error when
 * "Back to review step" is clicked. Exported so the spec can mount it
 * (Playwright CT does not allow mounting components defined in the test file).
 */
export function RosaWizardErrorThenBackToReviewMount(props: RosaWizardProps) {
  const [submitError, setSubmitError] = React.useState<string | boolean>(
    'There has been an error creating the cluster'
  );
  return (
    <TranslationProvider>
      <RosaWizard
        {...props}
        onSubmitError={submitError}
        onBackToReviewStep={() => setSubmitError(false)}
      />
    </TranslationProvider>
  );
}
